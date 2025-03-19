const { default: mongoose } = require("mongoose");
const moongose=require("mongoose")
const{Schema}=moongose;

const wishlistSchema=new Schema({
    userId:{
        type:String,
        ref:"User",
        required:true
    },
    products:[{
        productId:{
            type:Schema.Types.ObjectId,
            ref:"Product",
            required:true

        }, 
        addedOn:{
            type:Date,
            default:Date.now
        }
    }]
})
const Wishlist=mongoose.model('Wishlist',wishlistSchema);
module.exports=Wishlist;