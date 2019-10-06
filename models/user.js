// require mongoose
var mongoose = require('mongoose');

// Define student schema
var Schema = mongoose.Schema;

// User (email, password, username, purchase history, shipping address)
var UserSchema = new Schema({
  _id: Schema.Types.ObjectId,
  email: String,
  name: String,
  username: String,
  password: String,
  isEnabled: Boolean,
  shippingAddress: [
    {
      contactName: String,
      address: String,
      city: String,
      province: String,
      postalCode: String,
      telephone: String,
      isChosen: Boolean
    }
  ],
  purchaseHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder'
    }
  ]
});
// export the model
module.exports = mongoose.model('User', UserSchema);
