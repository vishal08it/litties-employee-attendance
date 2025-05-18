import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  empId: String,
  name: { type: String, required: true },
  date: String,
  punchIn: Date,
  punchOut: Date,
  timeDiff: String,
});

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
