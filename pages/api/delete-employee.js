import connectMongo from '../../lib/mongodb';
import Employee from '@/models/Employee';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await connectMongo();

  const { empId } = req.body;

  if (!empId) {
    return res.status(400).json({ message: 'empId is required' });
  }

  try {
    const deleted = await Employee.findOneAndDelete({ empId });

    if (!deleted) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
