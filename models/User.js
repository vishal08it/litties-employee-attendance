import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  empId: String,
  password: String,
  role: String,
});

export default mongoose.models.User || mongoose.model('User', userSchema);
