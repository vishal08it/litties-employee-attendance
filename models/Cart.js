import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
  mobile: { type: String, required: true },
  item: {
    _id: String,
    name: String,
    image: String,
    price: Number
  },
  quantity: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);
