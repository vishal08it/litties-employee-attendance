import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
}, {
  collection: 'categories' // 🔒 force to use your 'categories' collection
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
