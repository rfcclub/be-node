// require mongoose
var mongoose = require('mongoose');

// Define student schema
var Schema = mongoose.Schema;

// Comments (product, user, rating, image(s), text)
var CommentSchema = new Schema({
  _id: Schema.Types.ObjectId,
  commentTitle: String,
  commentText: String,
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  images: [{
    imageLink: String
  }]
});
// export the model
module.exports = mongoose.model('Comment', CommentSchema);
