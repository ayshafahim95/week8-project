const moongose=require("mongoose")
const {Schema}=moongose;
const {v4:uuidv4}=require('uuid');
const Product = require("./productSchema");
const { default: mongoose } = require("mongoose");

const orderSchema =new Schema({
    orderId:{
        type:String,
        default:()=>uuidv49(),
        unique:true
    },
    orderedItems:[{
        Product:{
            type:Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        price:{
            type:Number,
            default:0
        }

    }],
    totalPrice:{
        type:Number,
        required:true
    },
    discount:{
type:Number,
required:true
    },
    finalAmount:{
        type:Number,
        required:true
    },
    address:{
        type:Schema.Types.orderId,
        ref:'User',
        required:true
    },
    invoiceDate:{
        type:Date
    },
    status:{
        type:String,
        required:true,
        enum:['Pending','Processing','Shipped','Delivered','Cancelled','Return Request','Returned']
    },
    createdOn:{
        type:Date,
        dafault:Date.now,
        required:true
    },
    couponApplied:{
        type:Boolean,
        default:false
    }
})
const Order=mongoose.model("Order",orderSchema);
module.exports=Order;