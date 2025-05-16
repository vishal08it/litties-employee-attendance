import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';

export default async function handler(req, res) {
  await dbConnect();
  const records = await Attendance.find().sort({ date: -1 });
  res.status(200).json(records);
}
