import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: String,
  userId: String,
  email: String,
  items: [String],
  quantity: Number,
  totalAmount: Number,
  status: {
    type: String,
    enum: ['New', 'Accepted', 'Rejected', 'Out for Delivery', 'Delivered'],
    default: 'New',
  },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
