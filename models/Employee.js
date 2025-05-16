import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  empId: String,
  name: String,
  password: String,
  role: String,
});

export default mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
