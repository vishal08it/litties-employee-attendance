// pages/api/add-employee.js
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await dbConnect();

    const { empId, name, password, role, image, document, status } = req.body;

    // Check for duplicate empId
    const exists = await Employee.findOne({ empId });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Employee already exists.' });
    }

    const newEmployee = new Employee({
      empId,
      name,
      password,
      role,
      image,
      document,
      status: status || 'yes', // fallback default
    });

    await newEmployee.save();

    return res.status(200).json({ success: true, message: 'Employee added successfully.' });
  } catch (error) {
    console.error('Error adding employee:', error);
    return res.status(500).json({ success: false, message: 'Failed to save employee' });
  }
}
