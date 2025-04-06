const Product=require("../../models/productSchema");
const Category=require("../../models/categorySchema");
const Brand=require("../../models/brandSchema");
const User=require("../../models/userSchema");
const fs=require("fs");
const path=require("path");
const sharp=require("sharp");
const { addCategory } = require("./categoryController");
const { ObjectId } = require("mongodb");

const getProductAddPage=async (req,res)=>{
    try{
        const category=await Category.find({isListed:true});
        const brand=await Brand.find({isBlocked:false});
        res.render("product-add",{
cat:category,
brand:brand
        });
    }catch(error){
        res.redirect("/pageerror")
    }
}

const addProducts = async (req, res) => {
    try {
        const products = req.body;
        const productExists = await Product.findOne({
            productName: products.productName,
        });
        if (!productExists) {
            const images = [];
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    const originalImagePath = req.files[i].path;
                    // Define the path for the resized image
                    const resizedImagePath = path.join('public', 'uploads', 're-image', `resized-${req.files[i].filename}`);

                    // Resize the image and save it with the new name
                    await sharp(originalImagePath)
                        .resize({ width: 440, height: 440 })
                        .toFile(resizedImagePath);

                    // Push the resized image's filename, not the original one
                    images.push(`re-image/resized-${req.files[i].filename}`);
                }
            }
            const categoryId = await Category.findOne({ name: products.category });
            if (!categoryId) {
                return res.status(400).send("Invalid category name");
            }

            const newProduct = new Product({
                productName: products.productName,
                description: products.description,
                brand: products.brand,
                category: categoryId._id,
                regularPrice: products.regularPrice,
                salePrice: products.salePrice,
                createdOn: new Date(),
                quantity: products.quantity,
                size: products.size,
                color: products.color,
                Productimage: images,
                status: 'Available',
            });
            await newProduct.save();
            return res.redirect("/admin/addProducts");
        } else {
            return res.status(400).json("Product already exists, please try with another name");
        }
    } catch (error) {
        console.error("Error saving product", error);
        return res.redirect("/admin/pageerror");
        // res.status(500).json({ message: "Internal Server Error" });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;

        // Fetch products based on search criteria
        const productData = await Product.find({
            $or: [
                { productName: { $regex: new RegExp(".*" + search + ".*", "i") } },
                { brand: { $regex: new RegExp(".*" + search + ".*", "i") } },
            ],
        })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate("category")
        .exec();

        // Count total products for pagination
        const count = await Product.countDocuments({
            $or: [
                { productName: { $regex: new RegExp(".*" + search + ".*", "i") } },
                { brand: { $regex: new RegExp(".*" + search + ".*", "i") } },
            ],
        });

        // Fetch categories and brands
        const category = await Category.find({ isListed: true });
        const brand = await Brand.find({ isBlocked: false });

        // Render products page only if category and brand exist
        if (category && brand) {
            res.render("products", {
                data: productData,
                currentPage: page,
                totalPages: Math.ceil(count / limit), // Fixed duplicate
                cat: category,
                brand: brand,
            });
        } else {
            res.status(404).render("page-404"); // Improved error handling
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong. Please try again.");
    }
};
const addProductOffer=async(req,res)=>{
    try{
        const{productId,percentage}=req.body;
        const findProduct=await Product.findOne({_id:productId});
        const findCategory=await Category.findOne({_id:findProduct.category});
        if(findCategory.categoryOffer>percentage){
            return res.json({status:false,message:"This products category already has a category Offer"})
        }
        findProduct.salePrice=findProduct.salePrice-Math.floor(findProduct.regularPrice*(percentage/100))
        findProduct.productOffer=parseInt(percentage);
        await findProduct.save();
        findCategory.categoryOffer=0;
        await findCategory.save();
        res.json({status:true});
    }catch(error){
        res.redirect("/pageerror");
        res.status(500).json({status:false,message:"Internal Server Error"});
    }
};

const removeProductOffer=async(req,res)=>{
    try{
        const{productId}=req.body;
        const findProduct=await Product.findOne({_id:productId});
        const percentage=findProduct.productOffer;
        findProduct.salePrice=findProduct.salePrice+Math.floor(findProduct.regularPrice*(percentage/100))
        findProduct.productOffer=0;
await findProduct.save();
res.json({status:true})


    }catch(error){
res.redirect("/pageerror")
    }
}

const blockProduct = async (req, res) => {
    try {
        let id = req.query.id;
        await Product.updateOne({ _id: id }, { $set: { isBlocked: true } });
        res.redirect("/admin/products");
    } catch (error) {
        console.error("Error blocking product:", error);
        res.redirect("/pageerror");
    }
};
const unblockProduct = async (req, res) => {
    try {
        let id = req.query.id;
        await Product.updateOne({ _id: id }, { $set: { isBlocked: false} });
        res.redirect("/admin/products");
    } catch (error) {
        console.error("Error blocking product:", error);
        res.redirect("/pageerror");
    }
};
const getEditProduct = async (req, res) => {
    try {
        let proId = req.query.id;
        proId = new ObjectId(proId);
        const product = await Product.findOne({ _id: proId });
        product.productImage = product.productImage || [];
        const category = await Category.find({});
        const brand = await Brand.find({});
        res.render("edit-product", {
            product: product,
            cat: category,
            brand: brand,
        });

    } catch (error) {
        console.log(error);
        res.redirect("/pageerror");
    }
};



const editProduct=async(req,res)=>{
    try{
        const id=req.params.id;
        const product=await Product.findOne({_id:id});
        const data=req.body;
        const existingProduct=await Product.findOne({
            productName:data.productName,
            _id:{$ne:id}
        })
        if(existingProduct){
            return res.status(400).json({error:"Product with this name already exists.Please try with another name"});
        }
        const images=[];
        if(req.files&&req.files.length){
            for(let i=0;i<req.files;i++)
                images.push(req.files[i].filename);
        }
        const updateFields={
            productName:data.productName,
            description:data.description,
            brand:data.brand,
            category:product.category,
            regularPrice:data.regularPrice,
            salePrice:data.salePrice,
            quantity:data.quantity,
            size:data.size,
            color:data.color,

        }
        if(req.files.length>0){
            updateFields.$push={productImage:{$each:images}};

        }
        await Product.findByIdAndUpdate(id,updateFields,{new:true});
        res.redirect("/admin/products");

    }catch(error){
console.error(error)
res.redirect("/pageerror")
    }
}



const deleteSingleImage=async (req,res)=>{
    try{
        const {imageNameToServer,productIdToServer}=req.body;
        const product=await Product.findByIdAndUpdate(productIdToServer,{$pull:{productImage,imageNameToServer}});
        const imagePath=path.join("public","uploads","re-image",imageNameToServer)
        if(fs.existsSync(imagePath)){
            await fs.unlinkSync(imagePath);
            console.log(`Image ${imageNameToServer} deleted successfully`);
        }else{
            console.log(`Image ${imageNameToServer} not found`);
        }
        res.send({status:true});
    }catch(error){
        res.redirect("/pageerror")
    }
}




module.exports={
    getProductAddPage,
    addProducts,
    getAllProducts,
    addProductOffer,
    removeProductOffer,
    blockProduct,
    unblockProduct,
    getEditProduct,
    editProduct,
    deleteSingleImage,
}