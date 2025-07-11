import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });
  await dbConnect();

  try {
    const data = await Employee.find({ role: 'employee' }).sort({ name: 1 });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
} 