const mongoose=reuire("mongoose")
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
            default:none
        }

    }]

})
const Cart=mongoose.model("Cart",cartSchema);
module.exports=Cart;