const Coupon=require("../../models/couponSchema");
const mongoose=require("mongoose");





// const loadCoupon=async(req,res)=>{
//     try{
//         const findCoupons=await Coupon.find({});
//         return res.render("coupon",{coupons:findCoupons})
//     }catch(error){
//         return res.redirect("/pageerror")
//     }
// }
const loadCoupon = async (req, res) => {
    try {
        const coupons = await Coupon.find(); // Fetch coupons from the database
        return res.render("coupon", { coupon: coupons }); // Pass 'coupon' to EJS
    } catch (error) {
        console.error("Error loading coupons:", error);
        return res.redirect("/pageerror");
    }
};

const createCoupon=async(req,res)=>{
    try{
        const data={
            couponName:req.body.couponName,
            startDate:new Date(req.body.startDate+"T00:00:00"),
            endDate:new Date(req.body.endDate+"T00:00:00"),
            offerPrice:parseInt(req.body.offerPrice),
            minimumPrice:parseInt(req.body.minimumPrice),
        }

        const newCoupon=new Coupon({
            name:data.couponName,
            createdOn:data.startDate,
            expireOn:data.endDate,
            offerPrice:data.offerPrice,
            minimumPrice:data.minimumPrice,
        });
        await newCoupon.save();
        return res.redirect("/admin/coupon");

    }catch(error){
res.redirect("/pageerror")
    }
}

const editCoupon=async(req,res)=>{
    try{
const id=req.query.id;
const findCoupon=await Coupon.findOne({_id:id});
res.render('edit-coupon',{
    findCoupon:findCoupon,
})

}catch(error){
    res.redirect("/pageerror")
}
};


// const updateCoupon=async(req,res)=>{
//     try{
//         couponId=req.body.couponId;
// const oid=new mongoose.Types.ObjectId(couponId);
// const selectedCoupon=await Coupon.findOne({_id:id});
// if(selectedCoupin){
//     const startDate=new Date(req.body.startDate);
//     const endDate=new Date(req.body.endDate);
//     const updateCoupon=await Coupon.updateOne({
//         id:oid},
//         {
//             $set:{
//                 name:req.body.couponName,
//                 createdOn:startDate,
//                 expireOn:endDate,
//                 offerPrice:parseInt(req.body.offerPrice),
//                 minimumPrice:parseInt(req.body.minimumPrice),
//             },
//         },{new:true}
//     );
//     if(updatedCoupon!==null){
//         res.send("coupon updated Successfully")
//     }else{
//         res.status(500).send("coupon update Failed")
//     }

// }
//     }catch(error){
//         res.redirect("/pageerror")
//     }
// };
const updateCoupon = async (req, res) => {
    try {
        const couponId = req.body.couponId; // Properly declare couponId
        const oid = new mongoose.Types.ObjectId(couponId);

        // Correct variable name from `id` to `oid`
        const selectedCoupon = await Coupon.findOne({ _id: oid });

        if (selectedCoupon) {
            const startDate = new Date(req.body.startDate);
            const endDate = new Date(req.body.endDate);

            // Corrected update query - changed `id: oid` to `_id: oid`
            const updatedCoupon = await Coupon.updateOne(
                { _id: oid }, 
                {
                    $set: {
                        name: req.body.couponName,
                        createdOn: startDate,
                        expireOn: endDate,
                        offerPrice: parseInt(req.body.offerPrice),
                        minimumPrice: parseInt(req.body.minimumPrice),
                    },
                }
            );

            if (updatedCoupon.modifiedCount > 0) { // Check if an update actually happened
                res.send("Coupon updated successfully");
            } else {
                res.status(500).send("Coupon update failed");
            }
        } else {
            res.status(404).send("Coupon not found");
        }
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror");
    }
};
const deleteCoupon=async(req,res)=>{
    try{
        const id=req.query.id;
        await Coupon.deleteOne({_id:id});
        res.status(200).send({success:true,message:"Coupon deleted Successfully"});

    }catch(error){
        console.error("Error deleting coupon:",error);
        res.status(500).send({success:false,message:"Failed to delete coupon"})
    }
}







module.exports={
    loadCoupon,
    createCoupon,
    editCoupon,
    updateCoupon,
    deleteCoupon,

}