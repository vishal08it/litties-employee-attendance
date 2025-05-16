import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import User from '@/models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await dbConnect();
  const { empId, name, password, role } = req.body;

  const exists = await Employee.findOne({ empId });
  if (exists) return res.status(400).json({ message: 'Employee already exists' });

  await Employee.create({ empId, name, password, role });
  await User.create({ empId, password, role });

  res.status(200).json({ message: 'Employee added' });
}
