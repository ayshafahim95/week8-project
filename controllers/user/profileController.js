
const User = require("../../models/userSchema");
const Address=require("../../models/addressSchema");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const env = require("dotenv").config();
const session = require("express-session");

// Function to generate a 6-digit OTP
function generateOtp() {
    return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");
}

// Function to send email with OTP
const sendVerificationEmail = async (email, otp) => {
    try {
        console.log("Sending OTP to:", email); // Debugging step

        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false, 
            auth: {
                user: process.env.NODEMAILER_EMAIL,  
                pass: process.env.NODEMAILER_PASSWORD, 
            },
            tls: {
                rejectUnauthorized: false,  
            }
        });

        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Your OTP for password reset",
            text: `Your OTP is ${otp}`,
            html: `<h4>Your OTP is <b>${otp}</b></h4>`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};


const securePassword = async (password) => {
    try {
        console.log("Hashing password:", password);
        return await bcrypt.hash(password, 10);
    } catch (error) {
        console.error("Error in hashing password:", error);
        return null; // Handle error
    }
};



// Route for forgot password page

const getForgotPassPage = async (req, res) => {
    try {
        res.render("forgot-password");
    } catch (error) {
        res.redirect("/pageNotFound");
    }
};

// Function to validate email for forgot password
const forgotEmailValid = async (req, res) => {
    try {
        const { email } = req.body;
        const findUser = await User.findOne({ email: email });

        if (findUser) {
            const otp = generateOtp();
            const emailSent = await sendVerificationEmail(email, otp);

            if (emailSent) {
                req.session.userOtp = otp;
                req.session.email = email;
                res.render("forgotPass-otp");
                console.log("OTP:", otp);
            } else {
                res.json({ success: false, message: "Failed to send OTP. Please try again" });
            }
        } else {
            res.render("forgot-password", {
                message: "User with this email does not exist",
            });
        }
    } catch (error) {
        console.error("Error in forgotEmailValid:", error);
        res.redirect("/pageNotFound");
    }
};

// User profile function
const userProfile = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.findById(userId);
const addressData=await Address.findOne({userId:userId});
        res.render("profile", { user: userData,userAddress:addressData });
    } catch (error) {
        console.error("Error retrieving profile data:", error);
        res.redirect("/pageNotFound");
    }
};

// Function to change email
const changeEmail = async (req, res) => {
    try {
        res.render("change-email");
    } catch (error) {
        res.redirect("/pageNotFound");
    }
};


const verifyForgotPassOtp = async (req, res) => {
    try {
        const enteredOtp = req.body.otp.toString(); // Convert to string
        const storedOtp = req.session.userOtp ? req.session.userOtp.toString() : null;

        if (enteredOtp === storedOtp) {
            req.session.userOtp = null; // Clear OTP after successful verification

            // Redirect correctly using res.json
            return res.json({ success: true, redirectUrl: "/reset-password" });
        } else {
            return res.json({ success: false, message: "OTP not matching" });
        }
    } catch (error) {
        console.error("Error in verifying OTP:", error);
        res.status(500).json({ success: false, message: "An error occurred. Please try again" });
    }
};


const getResetPassPage=async(req,res)=>{
    try{
        res.render("reset-password");
        
}catch(error){
res.redirect("/PageNotFound");
}
}

const resendOtp = async (req, res) => {
    try {
        const otp = generateOtp();
        req.session.userOtp = otp;
        const email = req.session.email;

        console.log("Resending OTP to email:", email);
        const emailSent = await sendVerificationEmail(email, otp);

        if (emailSent) {
            console.log("Resent OTP:", otp);
            return res.status(200).json({ success: true, message: "Resend OTP successful" });
        } else {
            return res.status(500).json({ success: false, message: "Failed to resend OTP" });
        }

    } catch (error) {
        console.log("Error in resending OTP:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const postNewPassword = async (req, res) => {
    try {
        const { newPass1, newPass2 } = req.body;
        const email = req.session.email;
        if (newPass1 === newPass2) {
            const passwordHash = await securePassword(newPass1);
            await User.updateOne({ email: email }, { $set: { password: passwordHash } });
            res.redirect("/login");
        } else {
            res.render("reset-password", { message: 'Passwords do not match' });
        }
    } catch (error) {
        console.error("Error updating password:", error);
        res.redirect("/pageNotFound");
    }
};
const addAddress=async(req,res)=>{
    try{
const user=req.session.user;
res.render("add-address",{user:user})
    }catch(error){
res.redirect("/pageNotFound")
    }
}
const postAddAddress = async (req, res) => {
    try {
        // Get userId from session (ensure user is logged in)
        const userId = req.session.user;
        
        if (!userId) {
            return res.status(400).send('User is not logged in.');
        }

        // Fetch user data based on _id (assuming _id is the default field)
        const userData = await User.findById(userId);
        
        if (!userData) {
            return res.status(404).send('User not found.');
        }

        // Destructure address data from the request body
        const { addressType, name, city, landMark, state, pincode, phone, altPhone } = req.body;

        // Check if the user already has an address document
        let userAddress = await Address.findOne({ userId: userData._id });

        // If no address document found, create one
        if (!userAddress) {
            const newAddress = new Address({
                userId: userData._id,
                address: [{ addressType, name, city, landMark, state, pincode, phone, altPhone }]
            });
            await newAddress.save();  // Save the new address to the database
        } else {
            // If address document exists, push the new address to the address array
            userAddress.address.push({ addressType, name, city, landMark, state, pincode, phone, altPhone });
            await userAddress.save();  // Save the updated address
        }

        // Redirect to the user profile page after successful address addition
        res.redirect("/userProfile");

    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error adding address:", error);
        // Redirect to a page not found in case of an error
        res.redirect("/pageNotFound");
    }
};
const editAddress=async(req,res)=>{
    try{
const addressId=req.query.id;
const user=req.session.user;
const currAddress=await Address.findOne({
    "address._id":addressId,

});
if(!currAddress){
    return res.redirect("/pageNotFound")
}
const addressData=currAddress.address.find((item)=>{
    return item._id.toString()===addressId.toString();
})
if(!addressData){
    return res.redirect("/pageNotFound");
}
res.render("edit-address",{address:addressData,user:user});
    }catch(error){
console.error("Error in edit address",error);
res.redirect("/pageNotFound")
    }
}
const postEditAddress=async(req,res)=>{
    try{
const data=req.body;
const addressId=req.query.id;
const user=req.session.user;
const findAddress=await Address.findOne({"address._id":addressId});
if(!findAddress){
    res.redirect("/pageNotFound")
}
await Address.updateOne(
    {"address._id":addressId},
    {$set:{
        "address.$":{
            _id:addressId,
            addressType:data.addressType,
            name:data.name,
            city:data.city,
            landMark:data.landMark,
            state:data.state,
            pincode:data.pincode,
            phone:data.phone,
            altPhone:data.altPhone,
        }
    }}

    
)
res.redirect("/userProfile")
    }catch(error){
        console.error("Error in edit address",error);
        res.redirect("/pageNotFound")
    }
}

const deleteAddress = async (req, res) => {
    try {
        const addressId = req.query.id;

        // Find the address by its ID
        const findAddress = await Address.findOne({ "address._id": addressId });

        if (!findAddress) {
            // If address is not found, send a 404 response
            return res.status(404).send("Address not found");
        }

        // Perform the delete operation
        const result = await Address.updateOne(
            { "address._id": addressId },
            {
                $pull: {
                    address: {
                        _id: addressId,
                    }
                }
            }
        );

        // If no documents were affected, something went wrong
        if (result.nModified === 0) {
            return res.status(400).send("Failed to delete address");
        }

        // Redirect to the user profile after successful deletion
        res.redirect("/userProfile");
        
    } catch (error) {
        console.error("Error in delete Address", error);
        // If there's an error, redirect to a page not found page
        res.redirect("/pageNotFound");
    }
};





// Export all functions
module.exports = {
    userProfile,
    changeEmail,
    getForgotPassPage,
    forgotEmailValid,
    verifyForgotPassOtp,
    getResetPassPage,
    resendOtp,
    postNewPassword,
    addAddress,
    postAddAddress,
    editAddress,
    postEditAddress,
    deleteAddress,
};
