// Mongoose database part
const MONGO_PORT = 27017;
const MONGO_HOST = '127.0.0.1';
// require path
const path = require('path');
// require mongoose
var mongoose = require('mongoose');
// model importing
var Product = require('./models/product');

var User = require('./models/user'); // eslint-disable-line
var ProductOrder = require('./models/purchaseorder'); // eslint-disable-line
var Comment = require('./models/comment'); // eslint-disable-line
// file access
const fs = require('fs-extra'); // eslint-disable-line
// Database connection
let dbPort = process.env.DB_PORT || MONGO_PORT;
let dbHost = process.env.DB_HOST || MONGO_HOST;
var mongoDB = 'mongodb://' + dbHost + ':' + dbPort.toString() + '/assignment1';
mongoose.connect(mongoDB, { useNewUrlParser: true });
// Force Mongoose use global Promise
mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// create db & import data
let productString = fs.readFileSync(path.join(__dirname, '/data/product.json'), 'utf-8');
const data = JSON.parse(productString, function (key, value) {
  if (key === 'price' || key === 'shippingCost') {
    return parseFloat(value);
  } else {
    return value;
  }
});
initializeDatabase();

async function initializeDatabase () {
  var products = await Product.find().exec();
  if (products.length === 0) await Product.insertMany(data);
}
module.exports.db = db;
