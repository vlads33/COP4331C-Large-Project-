const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: "active" },
  dateCreated: { type: Date, default: Date.now },
  shippingAddress: { type: String }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

