import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  userId: String,
  orderId: String,
  itemId: String,
  feedback: String,
  rating: Number, // ✅ Add this line
  createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
export default Feedback;
