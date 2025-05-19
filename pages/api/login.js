import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Employee from '@/models/Employee';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await dbConnect();

  const { empId, password } = req.body;
  const user = await Employee.findOne({ empId, password });

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  res.status(200).json({ role: user.role, name: user.name ,image:user.image});
  }
