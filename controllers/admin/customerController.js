// const User=require("../../models/userSchema");


// const customerInfo=async (req,res)=>{
//     try{
// let search="";
// if(req.query.search){
//     search=req.query.search;
// }
// let page=1;
// if(req.query.page){
//     page=req.query.page
// }
//     const limit=3
//     const userData=await  User.find({
//         isAdmin:false,
//         $or:[
//             {name:{$regex:".*" + search +".*"}},
//             {email:{$regex:".*" + search +".*"}},
//         ],
//     })
//     .limit(limit*l)
//     .skip((page-l)*limit)
//     .exec();

//     const count=await User.find({
//         isAdmin:false,
//         $or: [ 
//             {name:{$regex:".*"+search+".*"}},
//             {email:{$regex:".*"+search+".*"}},
//             ],
//     }).countDocuments();
//     res.render("customers", { users: userData, totalPages: Math.ceil(count / limit), currentPage: page });
// }catch(error){
//     console.log("Error loading customers:", error);
//           res.redirect("/admin/pageerror");
// }
// }
// module.exports={
//     customerInfo,
// }
const User = require("../../models/userSchema");

const customerInfo = async (req, res) => {
    try {
        let search = "";
        if (req.query.search) {
            search = req.query.search;
        }

        let page = 1;
        if (req.query.page) {
            page = parseInt(req.query.page);
        }

        const limit = 3;
        const userData = await User.find({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        })
        .limit(limit)
        .skip((page - 1) * limit)
        .exec();

        const count = await User.countDocuments({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        });

        res.render("customers", { data: userData, totalpages : Math.ceil(count.length / limit), currentPage: page });
    } catch (error) {
        console.log("Error loading customers:", error);
        res.redirect("/admin/pageerror");
    }
};
const customerBlocked=async (req,res)=>{
    try{
        let id=req.query.id;
        await User.updateOne({_id:id},{$set:{isBlocked:true}});
        res.redirect("/admin/users");
    }catch(error){
        res.redirect("/pageerror");
    }
};

const customerunBlocked=async (req,res)=>{
    try{
        let id=req.query.id;
        await User.updateOne({_id:id},{$set:{isBlocked:false}});
        res.redirect("/admin/users");

    }catch(error){
        res.redirect("/pageerror");
    }
};

module.exports = { customerInfo,
    customerBlocked,
    customerunBlocked,
 };
