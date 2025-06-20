import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  items: [
    {
      _id: String,
      name: String,
      image: String,
      price: Number,
      quantity: Number
    }
  ]
}, { timestamps: true });

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);
