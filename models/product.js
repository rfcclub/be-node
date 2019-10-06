// require mongoose
var mongoose = require('mongoose');

// Define student schema
var Schema = mongoose.Schema;

// Product (description, image, pricing, shipping cost)
var ProductSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  description: String,
  imageLink: String,
  price: Number,
  shippingCost: Number,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});
// export the model
module.exports = mongoose.model('Product', ProductSchema);
