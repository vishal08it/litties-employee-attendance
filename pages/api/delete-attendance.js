import dbConnect from '../../lib/mongodb';
import Attendance from '../../models/Attendance';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { id } = req.body;
      await Attendance.findByIdAndDelete(id);
      res.status(200).json({ message: 'Attendance record deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete attendance' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
