import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  category: String,
  stock: {
    type: String,
    enum: ['In Stock', 'Out of Stock'],
    default: 'In Stock',
  }
}, { timestamps: true });

// ✅ FORCE Mongoose to reload the model (fix cache issue)
export default mongoose.models?.Item || mongoose.model('Item', itemSchema);
