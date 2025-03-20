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
        if (!product) {
            console.log("Product not found");
            return res.redirect("/pageerror");
        }
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





module.exports={
    getProductAddPage,
    addProducts,
    getAllProducts,
    addProductOffer,
    removeProductOffer,
    blockProduct,
    unblockProduct,
    getEditProduct,
    

}

// const fs = require("fs");
// const path = require("path");
// const sharp = require("sharp");
// const Product = require("../../models/productSchema");
// const Category = require("../../models/categorySchema");

// const addProducts = async (req, res) => {
//     try {
//         const products = req.body;

//         // Check if product already exists
//         const productExists = await Product.findOne({ productName: products.productName });
//         if (productExists) {
//             return res.status(400).json("Product already exists, please try with another name");
//         }

//         const images = [];

//         if (req.files && req.files.length > 0) {
//             // ✅ Ensure the upload directory exists
//             const uploadDir = path.join(__dirname, "../../public/uploads/product-images");
//             if (!fs.existsSync(uploadDir)) {
//                 fs.mkdirSync(uploadDir, { recursive: true });
//             }

//             for (let i = 0; i < req.files.length; i++) {
//                 const originalImagePath = req.files[i].path;
//                 const resizedImagePath = path.join(uploadDir, req.files[i].filename);

//                 try {
//                     // ✅ Check if the original image file exists
//                     if (fs.existsSync(originalImagePath)) {
//                         await sharp(originalImagePath)
//                             .resize({ width: 440, height: 440 })
//                             .toFile(resizedImagePath);

//                         images.push(req.files[i].filename);
//                     } else {
//                         console.error("File not found:", originalImagePath);
//                     }
//                 } catch (err) {
//                     console.error("Sharp processing error:", err);
//                 }
//             }
//         }

//         // Find category by name
//         const categoryId = await Category.findOne({ name: products.category });
//         if (!categoryId) {
//             return res.status(400).json("Invalid category name");
//         }

//         // Create and save new product
//         const newProduct = new Product({
//             productName: products.productName,
//             description: products.description,
//             brand: products.brand,
//             category: categoryId._id,
//             regularPrice: products.regularPrice,
//             salePrice: products.salePrice,
//             createdOn: new Date(),
//             quantity: products.quantity,
//             size: products.size,
//             color: products.color,
//             Productimage: images,
//             status: "Available",
//         });

//         await newProduct.save();
//         return res.redirect("/admin/addProducts");

//     } catch (error) {
//         console.error("Error saving product", error);
//         return res.redirect("/admin/pageerror");
//     }
// };

// module.exports = { addProducts };
