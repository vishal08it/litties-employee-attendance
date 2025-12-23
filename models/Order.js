// import mongoose from 'mongoose';

// const OrderSchema = new mongoose.Schema({
//   orderId: String,
//   userId: String,
//   email: String,
//   items: [  
//     {
//       name: String,
//       quantity: Number,
//       price: Number,
//       image: String,
//     }
//   ],
//   quantity: Number,
//   totalAmount: Number,
//   paymentMethod: String,
//   address: {
//     name: String,
//     address: String,
//     mobile: String,
//   },
//   status: {
//     type: String,
//     enum: ['New', 'Accepted', 'Rejected', 'Out for Delivery', 'Delivered','Cancelled'],
//     default: 'New',
//   },
// }, { timestamps: true });

// export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  userId: String,
  email: String,
  utr: { type: String, default: '' }, // Simple string to avoid validation blocks
  items: Array,
  quantity: Number,
  totalAmount: Number,
  paymentMethod: String,
  address: Object,
  status: {
    type: String,
    enum: ['New', 'Accepted', 'Rejected', 'Out for Delivery', 'Delivered','Cancelled'],
    default: 'New',
  },
}, { 
  timestamps: true, 
  strict: false // IMPORTANT: This ensures fields NOT in the schema still get saved
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
