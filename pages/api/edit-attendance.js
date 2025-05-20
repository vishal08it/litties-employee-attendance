import connectMongo from '../../lib/mongodb';
import Attendance from '@/models/Attendance';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await connectMongo();

  const { empId, date, punchIn, punchOut } = req.body;

  if (!empId || !date) {
    return res.status(400).json({ message: 'empId and date are required' });
  }

  try {
    const updated = await Attendance.findOneAndUpdate(
      { empId, date },
      { $set: { punchIn, punchOut } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Attendance not found' });
    }

    return res.status(200).json({ message: 'Attendance updated successfully', updated });
  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
