const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userID:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:           { type: String, required: true },
  price:          { type: Number, required: true },
  stockQuantity:  { type: Number, required: true },
  description:    { type: String, required: true },
  imageLocation:  { type: String },  	
  dateCreated:    { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;

