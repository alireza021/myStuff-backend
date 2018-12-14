const mongoose = require("mongoose");
const Schema = mongoose.Schema;


//Post schema 
var PostSchema = new Schema({
  title: {
    type: String,
    require: true,
  },
  price: {
    type: String,
    require: true,
  },
  category: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    require: true,
  },
  condition: {
    type: String,
    require: true,
  },
  url: {
    type: String
  },
  city: {
    type: String,
    require: true
  },
  description: {
    type: String,
    default: "Description goes here",
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

module.exports = Post = mongoose.model("Post", PostSchema);
