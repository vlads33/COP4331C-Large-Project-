const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  orderID: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  status: { type: String, default: "active" }
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
module.exports = OrderItem;

