// const express=require('express');
// const passport = require('passport'); 
// const router=express.Router();
// const userController=require("../controllers/user/userController");
// const productController=require("../controllers/user/productController");
// // const userAuth = require("../middlewares/auth"); 
// const {userAuth,adminAuth}=require("../middlewares/auth");
// const profileController=require("../controllers/user/profileController");
// const cartController = require("../controllers/user/cartController");

//  router.get("/PageNotFound",userController.PageNotFound); 
// router.get("/",userController.loadHomepage);
// router.get("/shop",userController.loadShoppingPage);

// router.get("/filter",userAuth,userController.filterProduct);
// router.get("/filterProduct",userController.filterByPrice);
// router.post("/shop",userController.searchProducts);
// router.get("/signup",userController.loadsignup);

// router.post("/signup",userController.signup);
// router.post("/verify-otp",userController.verifyOtp);
// router.post("/resend-otp",userController.resendOtp);
// router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));
// router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
//     res.redirect('/')
// });
// router.get("/login",userController.loadLogin);
// router.post("/login",userController.login);
// router.get("/logout",userController.logout);
// router.get("/forgot-password",profileController.getForgotPassPage);

// router.get("/productDetails",userAuth,productController.productDetails);
// router.get("/userProfile",userAuth,profileController.userProfile);
// router.get("/change-email",userAuth,profileController.changeEmail);
// router.post("/forgot-email-valid",profileController.forgotEmailValid);
// router.post("/verify-passForgot-otp",profileController.verifyForgotPassOtp);
// router.get("/reset-password",profileController.getResetPassPage);
// router.post("/resend-forgot-otp",profileController.resendOtp);
// router.post("/reset-password",profileController.postNewPassword);
// router.get("/addAddress",userAuth,profileController.addAddress);
// router.post("/addAddress",userAuth,profileController.postAddAddress);
// router.get("/editAddress",userAuth,profileController.editAddress);
// router.post("/editAddress",userAuth,profileController.postEditAddress);
// router.get("/deleteAddress",userAuth,profileController.deleteAddress);
// router.get("/cart", userAuth, cartController.getCartPage); 
// router.post("/addToCart", userAuth, cartController.addToCart); 
// router.post("/changeQuantity", userAuth, cartController.changeQuantity); 
// router.get("/deleteItem", userAuth, cartController.deleteProduct);





// module.exports=router;
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Controllers
const userController = require("../controllers/user/userController");
const productController = require("../controllers/user/productController");
const profileController = require("../controllers/user/profileController");
const cartController = require("../controllers/user/cartController");

// Middleware
const { userAuth, adminAuth } = require("../middlewares/auth");

// ------------------- General Pages -------------------
router.get("/", userController.loadHomepage);
router.get("/PageNotFound", userController.PageNotFound);
router.get("/shop", userController.loadShoppingPage);
router.post("/shop", userController.searchProducts);

// ------------------- Product Filtering -------------------
router.get("/filter", userAuth, userController.filterProduct);
router.get("/filterProduct", userController.filterByPrice);

// ------------------- Authentication -------------------
router.get("/signup", userController.loadsignup);
router.post("/signup", userController.signup);
router.post("/verify-otp", userController.verifyOtp);
router.post("/resend-otp", userController.resendOtp);

router.get("/login", userController.loadLogin);
router.post("/login", userController.login);
router.get("/logout", userController.logout);

// ------------------- Google Auth -------------------
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/signup' }),
  (req, res) => res.redirect('/')
);

// ------------------- Product Details -------------------
router.get("/productDetails", userAuth, productController.productDetails);

// ------------------- User Profile -------------------
router.get("/userProfile", userAuth, profileController.userProfile);
router.get("/change-email", userAuth, profileController.changeEmail);

// ------------------- Password Reset -------------------
router.get("/forgot-password", profileController.getForgotPassPage);
router.post("/forgot-email-valid", profileController.forgotEmailValid);
router.post("/verify-passForgot-otp", profileController.verifyForgotPassOtp);
router.get("/reset-password", profileController.getResetPassPage);
router.post("/reset-password", profileController.postNewPassword);
router.post("/resend-forgot-otp", profileController.resendOtp);

// ------------------- Address Management -------------------
router.get("/addAddress", userAuth, profileController.addAddress);
router.post("/addAddress", userAuth, profileController.postAddAddress);
router.get("/editAddress", userAuth, profileController.editAddress);
router.post("/editAddress", userAuth, profileController.postEditAddress);
router.get("/deleteAddress", userAuth, profileController.deleteAddress);

// ------------------- Cart Management -------------------
router.get("/cart", userAuth, cartController.getCartPage);
router.post("/addToCart", userAuth, cartController.addToCart);
router.post("/changeQuantity", userAuth, cartController.changeQuantity);
router.get("/deleteItem", userAuth, cartController.deleteProduct);

module.exports = router;
