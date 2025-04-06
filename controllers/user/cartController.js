// const User = require("../../models/userSchema");
// const Product = require("../../models/productSchema");
// const mongodb = require("mongodb");


// const getCartPage = async (req, res) => {
//   try {
//     const id = req.session.user;
//     const user = await User.findOne({ _id: id });
//     const productIds = user.cart.map((item) => item.productId);
//     const products = await Product.find({ _id: { $in: productIds } });
//     const oid = new mongodb.ObjectId(id);
//     let data = await User.aggregate([
//       { $match: { _id: oid } },
//       { $unwind: "$cart" },
//       {
//         $project: {
//           proId: { $toObjectId: "$cart.productId" },
//           quantity: "$cart.quantity",
//         },
//       },
//       {
//         $lookup: {
//           from: "products",
//           localField: "proId",
//           foreignField: "_id",
//           as: "productDetails",
//         },
//       },
//     ]);
//     let quantity = 0;
//     for (const i of user.cart) {
//       quantity += i.quantity;
//     }
//     let grandTotal = 0;
//     for (let i = 0; i < data.length; i++) {
//       if (products[i]) {
//         grandTotal += data[i].productDetails[0].salePrice * data[i].quantity;
//       }
//       req.session.grandTotal = grandTotal;
//     }
//     res.render("cart", {
//       user,
//       quantity,
//       data,
//       grandTotal,
//     });
//   } catch (error) {
//     res.redirect("/pageNotFound");
//   }
// };


// const addToCart = async (req, res) => {
//   try {
//     const id = req.body.productId;
//     const userId = req.session.user;
//     const findUser = await User.findById(userId);
//     const product = await Product.findById({ _id: id }).lean();
    
//     if (!product) {
//       return res.json({ status: "Product not found" });
//     }
    
//     if (product.quantity <= 0) {
//       return res.json({ status: "Out of stock" });
//     }

//     const cartIndex = findUser.cart.findIndex((item) => item.productId == id);

//     if (cartIndex === -1) {
//       const quantity = 1;
//       await User.findByIdAndUpdate(userId, {
//         $addToSet: {
//           cart: {
//             productId: id,
//             quantity: quantity,
//           },
//         },
//       });
//       return res.json({ status: true, cartLength: findUser.cart.length + 1, user: userId });
//     } else {
//       const productInCart = findUser.cart[cartIndex];
//       if (productInCart.quantity < product.quantity) {
//         const newQuantity = productInCart.quantity + 1;
//         await User.updateOne(
//           { _id: userId, "cart.productId": id },
//           { $set: { "cart.$.quantity": newQuantity } }
//         );
//         return res.json({ status: true, cartLength: findUser.cart.length, user: userId });
//       } else {
//         return res.json({ status: "Out of stock" });
//       }
//     }
//   } catch (error) {
//     console.error(error);
//     return res.redirect("/pageNotFound");
//   }
// };


// const changeQuantity = async (req, res) => {
//   try {
//     const id = req.body.productId;
//     const user = req.session.user;
//     const count = req.body.count;
//     // count(-1,+1)
//     const findUser = await User.findOne({ _id: user });
//     const findProduct = await Product.findOne({ _id: id });
//     const oid = new mongodb.ObjectId(user);
//     if (findUser) {
//       const productExistinCart = findUser.cart.find(
//         (item) => item.productId === id
//       );
//       let newQuantity;
//       if (productExistinCart) {
//         if (count == 1) {
//           newQuantity = productExistinCart.quantity + 1;
//         } else if (count == -1) {
//           newQuantity = productExistinCart.quantity - 1;
//         } else {
//           return res
//             .status(400)
//             .json({ status: false, error: "Invalid count" });
//         }
//       } else {
//       }
//       if (newQuantity > 0 && newQuantity <= findProduct.quantity) {
//         let quantityUpdated = await User.updateOne(
//           { _id: user, "cart.productId": id },
//           {
//             $set: {
//               "cart.$.quantity": newQuantity,
//             },
//           }
//         );
//         const totalAmount = findProduct.salePrice * newQuantity;
//         const grandTotal = await User.aggregate([
//           { $match: { _id: oid } },
//           { $unwind: "$cart" },
//           {
//             $project: {
//               proId: { $toObjectId: "$cart.productId" },
//               quantity: "$cart.quantity",
//             },
//           },
//           {
//             $lookup: {
//               from: "products",
//               localField: "proId",
//               foreignField: "_id",
//               as: "productDetails",
//             },
//           },
//           {
//             $unwind: "$productDetails", // Unwind the array created by the $lookup stage
//           },

//           {
//             $group: {
//               _id: null,
//               totalQuantity: { $sum: "$quantity" },
//               totalPrice: {
//                 $sum: { $multiply: ["$quantity", "$productDetails.salePrice"] },
//               }, 
//             },
//           },
//         ]);
//         if (quantityUpdated) {
//           res.json({
//             status: true,
//             quantityInput: newQuantity,
//             count: count,
//             totalAmount: totalAmount,
//             grandTotal: grandTotal[0].totalPrice,
//           });
//         } else {
//           res.json({ status: false, error: "cart quantity is less" });
//         }
//       } else {
//         res.json({ status: false, error: "out of stock" });
//       }
//     }
//   } catch (error) {
//     res.redirect("/pageNotFound");
//     return res.status(500).json({ status: false, error: "Server error" });
//   }
// };

// const deleteProduct = async (req, res) => {
//   try {
//     const id = req.query.id;
//     const userId = req.session.user;
//     const user = await User.findById(userId);
//     const cartIndex = user.cart.findIndex((item) => item.productId == id);
//     user.cart.splice(cartIndex, 1);
//     await user.save();
//     res.redirect("/cart");
//   } catch (error) {
//     res.redirect("/pageNotFound");
//   }
// };





// module.exports = {
//   getCartPage,
//   addToCart,
//   changeQuantity,
//   deleteProduct,
// };
const User = require("../../models/userSchema");
const Product = require("../../models/productSchema");
const Cart=require("../../models/cartSchema");
const mongodb = require("mongodb");


const getCartPage = async (req, res) => {
  try {
    const userId = req.session.user;

    const cart = await Cart.findOne({ userId }).populate("Items.productId");
    const user = await User.findById(userId);

    let quantity = 0;
    let grandTotal = 0;
    let cartItems = [];

    if (cart && cart.Items.length > 0) {
      cartItems = cart.Items.map((item) => {
        quantity += item.quantity;

        const product = item.productId;
        const total = product.salePrice * item.quantity;

        grandTotal += total;

        return {
          product,
          quantity: item.quantity,
          total,
        };
      });
    }

    req.session.grandTotal = grandTotal;

    res.render("cart", {
      user,
      cartItems,
      quantity,
      grandTotal,
    });

  } catch (error) {
    console.error("Error in getCartPage:", error);
    res.redirect("/PageNotFound");
  }
};


// const getCartPage = async (req, res) => {
//   try {
//     const userId = req.session.user;
//     const user = await User.findById(userId).populate("cart.productId");

//     let quantity = 0;
//     let grandTotal = 0;
//     const cartItems = user.cart.map((item) => {
//       quantity += item.quantity;
//       const total = item.quantity * item.productId.salePrice;
//       grandTotal += total;
//       return {
//         product: item.productId,
//         quantity: item.quantity,
//         total,
//       };
//     });

//     req.session.grandTotal = grandTotal;

//     res.render("cart", {
//       user,
//       cartItems,
//       quantity,
//       grandTotal,
//     });
//   } catch (error) {
//     console.error("Error in getCartPage:", error);
//     res.redirect("/PageNotFound");
//   }
// };

const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.session.user;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!product) {
      return res.json({ status: false, message: "Product not found" });
    }

    if (product.quantity <= 0) {
      return res.json({ status: false, message: "Out of stock" });
    }

    let cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      // Create new cart if not found
      cart = new Cart({
        userId: user._id,
        Items: [
          {
            productId,
            quantity: 1,
          },
        ],
      });
      await cart.save();

      return res.json({
        status: true,
        message: "Product added to new cart",
        cartLength: 1,
      });
    }

    const existingIndex = cart.Items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingIndex !== -1) {
      const cartItem = cart.Items[existingIndex];
      if (cartItem.quantity < product.quantity && cartItem.quantity < 10) {
        cartItem.quantity += 1;
    } else {
        return res.json({ status: false, message: "Cannot add more than 10 or exceed stock" });
    }
    
    } else {
      cart.Items.push({
        productId,
        quantity: 1,
      });
    }

    await cart.save();

    return res.json({
      status: true,
      message: "Product added to cart",
      cartLength: cart.Items.length,
    });
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ status: false, message: "Server Error" });
  }
};


// const addToCart = async (req, res) => {
//   try {
//     const productId = req.body.productId;
//     const userId = req.session.user;
//     const user = await User.findById(userId);
//     const product = await Product.findById(productId);
//     let cart = await Cart.findOne({userId:user._id});


//     if (!product) return res.json({ status: "Product not found" });
//     if (product.quantity <= 0) return res.json({ status: "Out of stock" });
    
//      if(!cart){
//       cart = new Cart({
//         userId:user._id,
//         Items:[]
//       })
//       await cart.save();
//      }     

//     const index = user.cart.findIndex(
//       (item) => item.productId.toString() === productId
//     );

//     if (index === -1) {
//       user.cart.push({ productId, quantity: 1 });
//     } else {
//       if (user.cart[index].quantity < product.quantity) {
//         user.cart[index].quantity += 1;
//       } else {
//         return res.json({ status: "Out of stock" });
//       }
//     }

//     await user.save();
//     return res.json({
//       status: true,
//       cartLength: user.cart.length,
//     });
//   } catch (error) {
//     console.error("Error in addToCart:", error);
//     res.status(500).json({ status: false, message: "Server Error" });
//   }
// };

const changeQuantity = async (req, res) => {
  try {
    const userId = req.session.user;
    const { productId, count } = req.body;
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    const cartItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (!cartItem) {
      return res.json({ status: false, error: "Item not in cart" });
    }

    const newQuantity = cartItem.quantity + parseInt(count);

    if (newQuantity <= 0 || newQuantity > product.quantity) {
      return res.json({ status: false, error: "Invalid quantity" });
    }

    cartItem.quantity = newQuantity;
    await user.save();

    const totalAmount = cartItem.quantity * product.salePrice;

    // Recalculate grand total
    const cartData = await User.findById(userId).populate("cart.productId");
    let grandTotal = 0;
    for (const item of cartData.cart) {
      grandTotal += item.quantity * item.productId.salePrice;
    }

    res.json({
      status: true,
      quantityInput: cartItem.quantity,
      totalAmount,
      grandTotal,
    });
  } catch (error) {
    console.error("Error in changeQuantity:", error);
    res.status(500).json({ status: false, error: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    const userId = req.session.user;

    await User.updateOne(
      { _id: userId },
      { $pull: { cart: { productId: productId } } }
    );

    res.redirect("/cart");
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.redirect("/PageNotFound");
  }
};

module.exports = {
  getCartPage,
  addToCart,
  changeQuantity,
  deleteProduct,
};











// const User = require("../../models/userSchema");
// const Product = require("../../models/productSchema");
// const mongodb = require("mongodb");


// const getCartPage = async (req, res) => {
//   try {
//     const id = req.session.user;
//     const user = await User.findOne({ _id: id });
//     const productIds = user.cart.map((item) => item.productId);
//     const products = await Product.find({ _id: { $in: productIds } });
//     const oid = new mongodb.ObjectId(id);
//     let data = await User.aggregate([
//       { $match: { _id: oid } },
//       { $unwind: "$cart" },
//       {
//         $project: {
//           proId: { $toObjectId: "$cart.productId" },
//           quantity: "$cart.quantity",
//         },
//       },
//       {
//         $lookup: {
//           from: "products",
//           localField: "proId",
//           foreignField: "_id",
//           as: "productDetails",
//         },
//       },
//     ]);
//     let quantity = 0;
//     for (const i of user.cart) {
//       quantity += i.quantity;
//     }
//     let grandTotal = 0;
//     for (let i = 0; i < data.length; i++) {
//       if (products[i]) {
//         grandTotal += data[i].productDetails[0].salePrice * data[i].quantity;
//       }
//       req.session.grandTotal = grandTotal;
//     }
//     res.render("cart", {
//       user,
//       quantity,
//       data,
//       grandTotal,
//     });
//   } catch (error) {
//     res.redirect("/pageNotFound");
//   }
// };


// const addToCart = async (req, res) => {
//   try {
//     const id = req.body.productId;
//     const userId = req.session.user;
//     const findUser = await User.findById(userId);
//     const product = await Product.findById({ _id: id }).lean();
    
//     if (!product) {
//       return res.json({ status: "Product not found" });
//     }
    
//     if (product.quantity <= 0) {
//       return res.json({ status: "Out of stock" });
//     }

//     const cartIndex = findUser.cart.findIndex((item) => item.productId == id);

//     if (cartIndex === -1) {
//       const quantity = 1;
//       await User.findByIdAndUpdate(userId, {
//         $addToSet: {
//           cart: {
//             productId: id,
//             quantity: quantity,
//           },
//         },
//       });
//       return res.json({ status: true, cartLength: findUser.cart.length + 1, user: userId });
//     } else {
//       const productInCart = findUser.cart[cartIndex];
//       if (productInCart.quantity < product.quantity) {
//         const newQuantity = productInCart.quantity + 1;
//         await User.updateOne(
//           { _id: userId, "cart.productId": id },
//           { $set: { "cart.$.quantity": newQuantity } }
//         );
//         return res.json({ status: true, cartLength: findUser.cart.length, user: userId });
//       } else {
//         return res.json({ status: "Out of stock" });
//       }
//     }
//   } catch (error) {
//     console.error(error);
//     return res.redirect("/pageNotFound");
//   }
// };


// const changeQuantity = async (req, res) => {
//   try {
//     const id = req.body.productId;
//     const user = req.session.user;
//     const count = req.body.count;
//     // count(-1,+1)
//     const findUser = await User.findOne({ _id: user });
//     const findProduct = await Product.findOne({ _id: id });
//     const oid = new mongodb.ObjectId(user);
//     if (findUser) {
//       const productExistinCart = findUser.cart.find(
//         (item) => item.productId === id
//       );
//       let newQuantity;
//       if (productExistinCart) {
//         if (count == 1) {
//           newQuantity = productExistinCart.quantity + 1;
//         } else if (count == -1) {
//           newQuantity = productExistinCart.quantity - 1;
//         } else {
//           return res
//             .status(400)
//             .json({ status: false, error: "Invalid count" });
//         }
//       } else {
//       }
//       if (newQuantity > 0 && newQuantity <= findProduct.quantity) {
//         let quantityUpdated = await User.updateOne(
//           { _id: user, "cart.productId": id },
//           {
//             $set: {
//               "cart.$.quantity": newQuantity,
//             },
//           }
//         );
//         const totalAmount = findProduct.salePrice * newQuantity;
//         const grandTotal = await User.aggregate([
//           { $match: { _id: oid } },
//           { $unwind: "$cart" },
//           {
//             $project: {
//               proId: { $toObjectId: "$cart.productId" },
//               quantity: "$cart.quantity",
//             },
//           },
//           {
//             $lookup: {
//               from: "products",
//               localField: "proId",
//               foreignField: "_id",
//               as: "productDetails",
//             },
//           },
//           {
//             $unwind: "$productDetails", // Unwind the array created by the $lookup stage
//           },

//           {
//             $group: {
//               _id: null,
//               totalQuantity: { $sum: "$quantity" },
//               totalPrice: {
//                 $sum: { $multiply: ["$quantity", "$productDetails.salePrice"] },
//               }, 
//             },
//           },
//         ]);
//         if (quantityUpdated) {
//           res.json({
//             status: true,
//             quantityInput: newQuantity,
//             count: count,
//             totalAmount: totalAmount,
//             grandTotal: grandTotal[0].totalPrice,
//           });
//         } else {
//           res.json({ status: false, error: "cart quantity is less" });
//         }
//       } else {
//         res.json({ status: false, error: "out of stock" });
//       }
//     }
//   } catch (error) {
//     res.redirect("/pageNotFound");
//     return res.status(500).json({ status: false, error: "Server error" });
//   }
// };

// const deleteProduct = async (req, res) => {
//   try {
//     const id = req.query.id;
//     const userId = req.session.user;
//     const user = await User.findById(userId);
//     const cartIndex = user.cart.findIndex((item) => item.productId == id);
//     user.cart.splice(cartIndex, 1);
//     await user.save();
//     res.redirect("/cart");
//   } catch (error) {
//     res.redirect("/pageNotFound");
//   }
// };





// module.exports = {
//   getCartPage,
//   addToCart,
//   changeQuantity,
//   deleteProduct,
// };




