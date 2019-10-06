// require mongoose
var mongoose = require('mongoose');

// Define student schema
var Schema = mongoose.Schema;

// Cart (products, quantities, user)
var PurchaseOrderSchema = new Schema({
  _id: Schema.Types.ObjectId,
  orderCode: String,
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product' },
    quantity: Number,
    note: String
  }],
  subTotalPrice: Number,
  shippingCost: Number,
  tax: Number,
  totalPrice: Number,
  completed: Boolean
});
// export the model
module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
