// import mongoose from 'mongoose';

// const employeeSchema = new mongoose.Schema({
//   empId: String,
//   name: String,
//   password: String,
//   role: String,
// });

// export default mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'employee' },
  image: { type: String, default: '' },
});

export default mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
