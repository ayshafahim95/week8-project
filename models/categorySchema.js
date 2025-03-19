// const mongoose=require("mongoose")
// const {Schema}=mongoose;

// const categorySchema = new Schema({
//     name:{
//         type:String,
//         required:true,
//         unique:true
//     },
//     description:{
//         type:String,
//         required:true
//     },
//     isListed:{
//         type:Boolean,
//         default:true,
//     },
//     categoryOffer:{
//         type:Number,
//         default:0
//     },
//     createdAt:{
//         type:Date,
//         default:Date.now
//     }

// })
// const Category = mongoose.model("category",categorySchema);
// module.exports=Category;
const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    isListed: {
      type: Boolean,
      default: true,
    },
    categoryOffer: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // Add timestamps here for createdAt and updatedAt
);

const Category = mongoose.model("category", categorySchema);
module.exports = Category;
