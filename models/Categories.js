const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Post schema
var CategoriesSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  }
});

module.exports = Categories = mongoose.model("Categories", CategoriesSchema);
