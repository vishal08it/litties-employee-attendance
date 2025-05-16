import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  empId: String,
  date: String,
  punchIn: Date,
  punchOut: Date,
  timeDiff: String,
});

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
