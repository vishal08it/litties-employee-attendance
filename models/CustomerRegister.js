import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'customer' },
  emailId: { type: String, required: true, unique: true, sparse: true },
  mobileNumber: { type: String, required: true, unique: true, sparse: true },
}, {
  collection: 'employees'  // use same collection as employees
});

export default mongoose.models.Customer || mongoose.model('Customer', customerSchema);
