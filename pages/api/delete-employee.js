// /pages/api/delete-employee.js
import dbConnect from '../../lib/mongodb';
import Employee from '../../models/Employee';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { empId } = req.query;

  if (!empId) {
    return res.status(400).json({ message: 'Employee ID is required' });
  }

  try {
    const result = await Employee.deleteOne({ empId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
