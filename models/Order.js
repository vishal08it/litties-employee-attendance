import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderId: String,
  userId: String, // Mobile number
  email: String,
  items: [String],
  quantity: Number,
  totalAmount: Number,
  paymentMethod: String,
  address: {
    name: String,
    address: String,
    mobile: String,
  },
  status: {
    type: String,
    enum: ['New', 'Accepted', 'Rejected', 'Out for Delivery', 'Delivered'],
    default: 'New',
  },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);