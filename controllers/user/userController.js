const User = require("../../models/userSchema");
const Category=require("../../models/categorySchema");
const Product=require("../../models/productSchema");
// const Banner=require("../../models/bannerSchema");
const env = require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Brand=require("../../models/brandSchema");


const { search } = require("../../routes/userRouter");
const PageNotFound=async (req,res)=>{
    try{
        res.render("page-404")
    }catch(error){
        res.redirect("/PageNotFound")
    }
}



const loadHomepage = async (req, res) => {
    try {
        const user=req.session.user;
        const categories=await Category.find({isListed:true});
        let productData=await Product.find(
            {isBlocked:false,
                category:{$in:categories.map(category=>category._id)},quantity:{$gt:0}
            }
        )
productData.sort((a,b)=>new Date(b.createdOn)-new Date(a.createdOn));
productData=productData.slice(0,4);

        if(user){
            const userData=await User.findOne({id:user._id});
            
        return res.render("home",{user:userData,products:productData});
        }else{
            return res.render("home",{products:productData});
        }
   
    } catch (error) {
        console.log("Homepage not found");
        res.status(500).send("Server error")
    }
}

const loadsignup = async (req, res) => {
    try {
        return res.render('signup');

    } catch (error) {
        console.log('Home page not loading:', error);
        res.status(500).send('Server Error');

    }
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
async function sendVerificationEmail(email, otp) {
    try {
        if (!process.env.NODEMAILER_EMAIL || !process.env.NODEMAILER_PASSWORD) {
            console.error("Nodemailer credentials missing!");
            return false;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD
            },
            tls: {
                rejectUnauthorized: false  // ✅ Ignore self-signed certificate issues
            }
        })
        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Verify your account",
            text: `Your OTP is ${otp}`,
            html: `<b>Your OTP: ${otp}</b>`
        })

        return info.accepted.length > 0;
    } catch (error) {
        console.log("Error sending email", error);
        return false;
    }
}

const signup = async (req, res) => {
    try {
        const { name, phone, email, password, cPassword } = req.body;
        if (password != cPassword) {
            return res.render("signup", { message: "Passwords do not match" });
        }
        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.render("signup", { message: "User with this email already exists" });
        }
        const otp = generateOtp();
        const emailSent = await sendVerificationEmail(email, otp);
        if (!emailSent) {
            return res.json("email-error")
        }
        req.session.userOtp = otp;
        req.session.userData = { name, phone, email, password };
        res.render("verify-otp");
        console.log("OTP Sent", otp);
    } catch (error) {
        console.log("signup error", error);
        res.redirect("/PageNotFound");
    }
}
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;
    } catch (error) {
        console.error("Error hashing password:", error);
        return null;  // ✅ 
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        console.log(otp);
        if (otp.toString() === req.session.userOtp.toString()) {
            const user = req.session.userData;
            const passwordHash = await securePassword(user.password);
            const saveUserData = new User({
                name: user.name,
                email: user.email,
                phone: user.phone,
                password: passwordHash,
            })
            await saveUserData.save()
            req.session.user = saveUserData._id;
            res.json({ success: true, redirectUrl: "/" })
        } else {
            res.status(400).json({ success: false, message: "Invalid OTP,Please try again" })
        }
    } catch (error) {
        console.error("Error Verifying OTP", error);
        res.status(500).json({ success: false, message: "An error occured" })
    }
}
const resendOtp = async (req, res) => {
    try {
        const { email } = req.session.userData;
        console.log(email);
        if (!email) {
            return res.status(400).json({ success: false, message: "Email not found in session" })
        }
        const otp = generateOtp();
        req.session.userOtp = otp;
        const emailSent = await sendVerificationEmail(email, otp);
        if (emailSent) {
            console.log("Resend OTP:", otp);
            res.status(200).json({ success: true, message: "OTP Resend Successfully" })
        } else {
            res.status(500).json({ success: false, message: "Failed to resend OTP.Please try again" });
        }

    } catch (error) {
        console.error("Error resending OTP", error);
        res.status(500).json({ success: false, message: "Internal Server Error. Please try again" })
    }
}
const loadLogin=async(req,res)=>{
    try{
        if(!req.session.user)
        {
            return res.render("login")
        }
        else
        {
            res.redirect("/")
        }
    }catch(error){
        res.redirect("/PageNotFound")
    }
}
const login=async(req,res)=>{
    try{
       const {email,password}=req.body;

       const findUser=await User.findOne({isAdmin:0,email:email});
       if(!findUser){
        return res.render("login",{message:"User not found"})
       }
       if(findUser.isBlocked){
        return res.render("login",{message:"User is blocked by admin"})
       }
       const passwordMatch=await bcrypt.compare(password,findUser.password);
       if(!passwordMatch){
        return res.render("login",{message:"Incorrect password"})
       }
req.session.user=findUser._id;
res.redirect("/")
    }catch(error){
        console.error("login error",error)
        res.render("login",{message:"login failed. Please try again later"})
    }
}
const logout=async (req,res)=>{
    try{
        req.session.destroy((err)=>{
            if(err){
                console.log("Session destruction error",err.message);
                return res.redirect("/PageNotFound");
            }
            return res.redirect("/login")
        })
    }catch(error){
        console.log("Logout error",error);
        res.redirect("/PageNotFound")
    }
}


const loadShoppingPage=async (req,res)=>{
    try{
       
        const user=req.session.user;
        const userData=await User.findOne({_id:user});
        const categories=await Category.find({isListed:true})
        const categoryIds=categories.map((category)=>category._id.toString());
        const page=parseInt(req.query.page)||1;
        const limit=9;
        const skip=(page-1)*limit;
        const products=await Product.find({
            isBlocked:false,
            category:{$in:categoryIds},
            quantity:{$gt:0},

        }).sort({createdOn:-1}).skip(skip).limit(limit);
        const totalProducts=await Product.countDocuments({
            isBlocked:false,
            category:{$in:categoryIds},
            quantity:{$gt:0}
        });
        const totalPages=Math.ceil(totalProducts/limit);
        const brands=await Brand.find({isBlocked:false});
        const categoriesWithIds=categories.map(category=>({_id:category._id,name:category.name}));

        res.render("shop",{
            user:userData,
            products:products,
            category:categoriesWithIds,
            brand:brands,
            totalProducts:totalProducts,
            currentPage:page,
            totalPages:totalPages,


        })

    }catch(error){
        res.redirect("/pageNotFound")
    }
}

const filterProduct = async (req, res) => {
    try {
        const user = req.session.user;  // Fetch the user from the session
        const category = req.query.category;
        const brand = req.query.brand;

        const findCategory = category ? await Category.findOne({ _id: category }) : null;
        const findBrand = brand ? await Brand.findOne({ _id: brand }) : null;

        const brands = await Brand.find({}).lean();
        const categories = await Category.find({ isListed: true });

        const query = {
            isBlocked: false,
            quantity: { $gt: 0 },
        };

        if (findCategory) {
            query.category = findCategory._id;
        }
        if (findBrand) {
            query.brand = findBrand._id; // Ensure it matches the schema (use _id if necessary)
        }

        let findProducts = await Product.find(query).lean();
        findProducts.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));

        let itemsPerPage = 6;
        let currentPage = parseInt(req.query.page) || 1;
        let totalPages = Math.ceil(findProducts.length / itemsPerPage);

        let startIndex = (currentPage - 1) * itemsPerPage;
        let endIndex = Math.min(startIndex + itemsPerPage, findProducts.length); // Prevent overflow
        const currentProduct = findProducts.slice(startIndex, endIndex);

        let userData = null;
        if (user) {
            userData = await User.findOne({ _id: user });
            if (userData) {
                const searchEntry = {
                    category: findCategory ? findCategory._id : null,
                    brand: findBrand ? findBrand.brandName : null,
                    searchedOn: new Date(),
                };
                userData.searchHistory.push(searchEntry);
                await userData.save();
            }
        }

        req.session.filteredProducts = currentProduct;
        res.render("shop", {
            user: userData,
            products: currentProduct,
            category: categories,
            brand: brands,
            totalPages,
            currentPage,
        });

    } catch (error) {
        console.log(error);
        res.redirect("/pageNotFound");
    }
};  // Ensure this closing brace is present

  // Ensure this closing brace is present

const filterByPrice = async (req, res) => {
    try {
        const user = req.session.user;
        const userData = await User.findOne({ _id: user });
        const brands = await Brand.find({}).lean();
        const categories = await Category.find({ isListed: true }).lean();

        // Ensure valid numeric values for price filtering
        const minPrice = parseFloat(req.query.gt) || 0;
        const maxPrice = parseFloat(req.query.lt) || Number.MAX_VALUE;

        let findProduct = await Product.find({
            salePrice: { $gt: minPrice, $lt: maxPrice },
            isBlocked: false,
            quantity: { $gt: 0 }
        }).lean();

        // Sort by latest created date
        findProduct.sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());

        // Pagination setup
        let ItemsPerPage = 6;
        let currentPage = parseInt(req.query.page) || 1;
        let startIndex = (currentPage - 1) * ItemsPerPage;
        let endIndex = startIndex + ItemsPerPage;
        let totalPages = Math.ceil(findProduct.length / ItemsPerPage);
        const currentProduct = findProduct.slice(startIndex, endIndex);

        // Store filtered products in session
        req.session.filteredProducts = findProduct;

        res.render("shop", {
            user: userData,
            products: currentProduct,
            category: categories,
            brand: brands,
            totalPages,
            currentPage
        });

    } catch (error) {
        console.log("Error:", error);
        res.redirect("/pageNotFound");
    }
};


const searchProducts = async (req, res) => {
    try {
        const user = req.session.user;
        const userData = await User.findOne({ _id: user });
        let search = req.body.query;
        const brands = await Brand.find({}).lean();
        const categories = await Category.find({ isListed: true }).lean();
        const categoryIds = categories.map(category => category._id.toString());

        let searchResult = [];

        if (req.session.filteredProducts && req.session.filteredProducts.length > 0) {
            searchResult = req.session.filteredProducts.filter(product =>
                product.productName.toLowerCase().includes(search.toLowerCase())
            );
        } else {
            searchResult = await Product.find({
                productName: { $regex: ".*" + search + ".*", $options: "i" },
                isBlocked: false,
                quantity: { $gt: 0 },
                category: { $in: categoryIds }
            }).lean();
        }

        // Sorting by latest created date
        searchResult.sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());

        // Pagination
        let ItemsPerPage = 6;
        let currentPage = parseInt(req.query.page) || 1;
        let startIndex = (currentPage - 1) * ItemsPerPage;
        let endIndex = startIndex + ItemsPerPage;
        let totalPages = Math.ceil(searchResult.length / ItemsPerPage);
        const currentProduct = searchResult.slice(startIndex, endIndex);

        console.log("Current Page Products:", currentProduct);

        res.render("shop", {
            user: userData,
            products: currentProduct,
            category: categories,
            brand: brands,
            totalPages,
            currentPage,
            count: searchResult.length,
        });
    } catch (error) {
        console.log("Error:", error);
        res.redirect("/pageNotFound");
    }
};


module.exports = {
    loadHomepage,
    loadsignup,
    
    signup,
    verifyOtp,
    resendOtp,
    loadLogin,
    PageNotFound,
    login,
    logout,
    loadShoppingPage,
    filterProduct,
    filterByPrice,
    searchProducts,



};