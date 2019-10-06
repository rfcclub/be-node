// router file for ExpressJS
const path = require('path');
const bcrypt = require('bcryptjs');
const ALPHABET = '23456789abdegjkmnpqrvwxyz';
const ID_LENGTH = 8;
const UNIQUE_RETRIES = 9999;

// require mongoose
var mongoose = require('mongoose'); // eslint-disable-line
var Product = require('../models/product'); // eslint-disable-line
var PurchaseOrder = require('../models/purchaseorder'); // eslint-disable-line
var Comment = require('../models/comment'); // eslint-disable-line
var User = require('../models/user'); // eslint-disable-line
var uuidv4 = require('uuid/v4');
var jwtEncoder = require('jsonwebtoken');
var jwt = require('express-jwt');
const jwtSecret = 'Iamthelaziest';

// require express
const express = require('express');
var router = express.Router();

router.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', '*');
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', '*');
  next();
});

// handle products information
router.get('/products', async function (req, res) {
  console.log('get all products');
  var products = await Product.find().exec();
  res.json({ 'products': products });
});
// handle orders information
router.get('/orders', jwt({secret: jwtSecret}), async function (req, res) {
  console.log('get all orders');
  if (req.user && req.user.isLoggedIn) {
    var user = await User.findOne({ username: req.user.username, isEnabled: true }).populate('purchaseHistory').exec();
    res.json({ 'orders': user.purchaseHistory });
  }
});
// handle product information
router.get('/product/:id', async function (req, res) {
  console.log('get product with comments');
  var productId = req.params.id;
  var productWithComments = await Product.findOne({ _id: productId })
    .populate({ path: 'comments', populate: { path: 'postedBy' } })
    .exec();
  res.json({ 'product': productWithComments });
});

// handle logout information
router.post('/logout', async function (req, res) {
  console.log('logout account');
  req.user = null;
  res.json({ 'loggedOut': 200 });
});

// handle login information
router.post('/login', async function (req, res) {
  console.log('login account');
  var user = req.body.user;
  var dbUser = await User.findOne({ username: user.username, isEnabled: true }).exec();
  if (bcrypt.compareSync(user.password, dbUser.password)) {
    var returnUser = {
      username: user.username,
      email: dbUser.email,
      name: dbUser.name,
      shippingAddress: dbUser.shippingAddress
    };
    var token = jwtEncoder.sign({ 
      exp: Math.floor(Date.now() / 1000) + (60 * 60), 
      username: user.username, 
      isLoggedIn: true }, 
      jwtSecret);
    res.json({ 'loggedIn': true, 'loggedInUser': returnUser, 'token': token });
  } else {
    res.json({ 'loggedIn': false });
  }
});

// handle registration information
router.post('/register', async function (req, res) {
  console.log('register account');
  var user = req.body.user;
  user.isEnabled = true;
  user._id = new mongoose.mongo.ObjectId();
  user.purchaseHistory = [];
  user.password = bcrypt.hashSync(user.password, 5);
  user.shippingAddress[0].isChosen = true;
  user = await User.create(user);
  var returnUser = {
    username: user.username,
    email: user.email,
    name: user.name,
    shippingAddress: user.shippingAddress
  };
  res.json({ 'registered': returnUser });
});
// handle change password
router.post('/changePassword', jwt({secret: jwtSecret}), async function (req, res) {
  console.log('change password');
  if (req.user && req.user.isLoggedIn) {
    var password = req.body.passwordData.password;
    var newPassword = req.body.passwordData.newPassword;
    var confirmPassword = req.body.passwordData.confirmPassword;
    var user = await User.findOne({ username: req.user.username, isEnabled: true }).exec();
    if (bcrypt.compareSync(password, user.password) && newPassword === confirmPassword) {
        user.password = bcrypt.hashSync(newPassword, 5);
        await user.save();
        res.json({ 'saved': 200 });
    } else {
      res.json({ 'saved': 500 });
    }
  } else {
    res.json({ 'saved': 500 });
  }
});

// handle update user information
router.post('/updateUser', jwt({secret: jwtSecret}), async function (req, res) {
  console.log('update user account');
  if (req.user && req.user.isLoggedIn) {
    let newUserInfo = req.body.user;
    var user = await User.findOne({ username: newUserInfo.username, isEnabled: true }).exec();
    user.name = newUserInfo.name;
    user.email = newUserInfo.email;
    user.shippingAddress[0].contactName = newUserInfo.shippingAddress[0].contactName;
    user.shippingAddress[0].address = newUserInfo.shippingAddress[0].address;
    user.shippingAddress[0].city = newUserInfo.shippingAddress[0].city;
    user.shippingAddress[0].postalCode = newUserInfo.shippingAddress[0].postalCode;
    user.shippingAddress[0].province = newUserInfo.shippingAddress[0].province;
    user.shippingAddress[0].telephone = newUserInfo.shippingAddress[0].telephone;
    await user.save();
    res.json({ 'saved': 200 });
  } else {
    res.json({ 'saved': 500 });
  }
});
// handle comment upload image information
router.post('/upload/comment/:commentId', jwt({secret: jwtSecret}), async function (req, res) {
  console.log('uploading file');
  let commentId = req.params.commentId;
  if (req.files) {
    var success = false;
    let file = req.files.file;
    console.log(file);
    var imageLink = uuidv4() + '.png';
    let pictureName = '/upload/images/' + imageLink;
    try {
      await file.mv(path.join(__dirname, '../' + pictureName));
      success = true;
    } catch (err) {
      console.log(err);
    }
    if (success) {
      var comment = await Comment.findOne({ _id: commentId }).populate('images').exec();
      if (!comment.images) comment.images = [];
      comment.images.push({ imageLink: pictureName });
      await comment.save();
      res.json({ 'saved': 200 });
    }
  } else {
    res.json({ 'saved': 201 });
  }
});
// handle comment information
router.post('/commentProduct', jwt({secret: jwtSecret}), async function (req, res) {
  console.log('comment a product');
  let productId = req.body.productId;
  let commentTitle = req.body.commentTitle;
  let commentText = req.body.commentText;
  if (req.user && req.user.isLoggedIn) {
    var user = await User.findOne({ username: req.user.username, isEnabled: true }).exec();
    var product = await Product.findOne({ _id: productId }).populate('comments').exec();
    if (!product.comments) product.comments = [];
    var comment = new Comment();
    comment._id = new mongoose.mongo.ObjectId();
    comment.commentText = commentText;
    comment.commentTitle = commentTitle;
    comment.postedBy = user;
    comment = await comment.save();
    product.comments.push(comment);
    await product.save();
    res.json({ 'saved': 200, 'commentId': comment._id });
  } else {
    res.json({ 'saved': 500 });
  }
});

// handle order information
router.post('/order', jwt({secret: jwtSecret}), async function (req, res) {
  console.log('post an order');
  let clientPO = req.body.purchaseOrder;
  let clientAddress = req.body.address;
  var user = null;
  if (!req.user) { // create dummy user
    user = new User();
    user._id = new mongoose.mongo.ObjectId();
    user.email = clientAddress.email;
    user.name = 'anonymous';
    user.isEnabled = false;
    user.shippingAddress = [];
    user.shippingAddress.push({
      contactName: clientAddress.contactName,
      address: clientAddress.address,
      city: clientAddress.city,
      province: clientAddress.province,
      postalCode: clientAddress.postalCode,
      telephone: clientAddress.telephone,
      isChosen: true
    });
    user = await user.save();
    user.selectedShippingAddress = user.shippingAddress[0];
  } else {
    user = await User.findOne({ username: req.user.username, isEnabled: true }).populate('purchaseHistory').exec();
  }
  var previous = await User.find({ email: user.email }).populate('purchaseHistory').exec();
  var previousKeys = [];
  previous.forEach(v => {
    v.purchaseHistory.forEach(ph => { previousKeys.push(ph.orderCode); });
  });
  var purchaseOrder = new PurchaseOrder();
  purchaseOrder._id = new mongoose.mongo.ObjectId();
  purchaseOrder.user = user;
  purchaseOrder.orderCode = generateOrderNumber(previousKeys);
  purchaseOrder.subTotalPrice = clientPO.subTotal;
  purchaseOrder.shippingCost = clientPO.shippingCost;
  purchaseOrder.totalPrice = clientPO.totalPrice;
  purchaseOrder.tax = clientPO.tax;
  purchaseOrder.items = [];
  clientPO.cartProducts.forEach(cartProduct => {
    purchaseOrder.items.push({
      item: cartProduct.product._id,
      quantity: cartProduct.quantity
    });
  });
  purchaseOrder.completed = false;
  purchaseOrder = await purchaseOrder.save();
  if (!user.purchaseHistory) user.purchaseHistory = [];
  user.purchaseHistory.push(purchaseOrder);
  await user.save();
  res.json({ 'saved': 200, 'orderCode': purchaseOrder.orderCode });
});
module.exports = router;

function generate () {
  var rtn = '';
  for (var i = 0; i < ID_LENGTH; i++) {
    rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return rtn;
}

function generateOrderNumber (previous) {
  previous = previous || [];
  var retries = 0;
  var id;

  while (!id && retries < UNIQUE_RETRIES) {
    id = generate();
    if (previous.indexOf(id) !== -1) {
      id = null;
      retries++;
    }
  }
  return id;
}
