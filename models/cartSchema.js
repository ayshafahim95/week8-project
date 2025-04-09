const mongoose=require("mongoose")
const{Schema}=mongoose;

const cartSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    Items:[{
        productId:{
            type:Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        String:{
            type:String,
            default:'placed'
        },
        cancellationReason:{
            type:String,
            default:'none'
        }

    }]

})
const Cart=mongoose.model("Cart",cartSchema);
module.exports=Cart;
// const mongoose = require("mongoose");
// const { Schema } = mongoose;

// const cartSchema = new Schema({
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
//   items: [ // ✅ changed from Items to items
//     {
//       productId: {
//         type: Schema.Types.ObjectId,
//         ref: "Product",
//         required: true
//       },
//       quantity: {
//         type: Number,
//         required: true
//       },
//       status: { // ✅ changed from "String" to a valid key "status"
//         type: String,
//         default: "placed"
//       },
//       cancellationReason: {
//         type: String,
//         default: "none"
//       }
//     }
//   ]
// });

// const Cart = mongoose.model("Cart", cartSchema);
// module.exports = Cart;



