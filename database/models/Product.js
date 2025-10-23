const mongoose = require('mongoose');

//create product schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true }
});

//export product schema
const Product = mongoose.model('Product', productSchema);
module.exports = Product;

