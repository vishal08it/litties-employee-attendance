import connectMongo from '@/lib/mongodb';
import Employee from '@/models/Employee';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectMongo();
    const employees = await Employee.find({}, 'empId name'); // only fetch empId and name
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
