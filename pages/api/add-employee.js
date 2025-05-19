// import dbConnect from '@/lib/mongodb';
// import Employee from '@/models/Employee';
// import User from '@/models/User';

// export default async function handler(req, res) {
//   if (req.method !== 'POST') return res.status(405).end();

//   await dbConnect();
//   const { empId, name, password, role } = req.body;

//   const exists = await Employee.findOne({ empId });
//   if (exists) return res.status(400).json({ message: 'Employee already exists' });

//   await Employee.create({ empId, name, password, role });
//   await User.create({ empId, password, role });

//   res.status(200).json({ message: 'Employee added' });
// }
import dbConnect from '@/lib/mongodb';// Fixed import path
import Employee from '@/models/Employee'    // Adjust if your model path differs

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await dbConnect();

    const { empId, name, password, role, image } = req.body;

    // Check for existing employee
    const existing = await Employee.findOne({ empId });
    if (existing) {
      return res.status(400).json({ message: 'Employee already exists.' });
    }

    const newEmployee = new Employee({ empId, name, password, role, image });
    await newEmployee.save();

    return res.status(200).json({ message: 'Employee added successfully.' });
  } catch (error) {
    console.error('Error adding employee:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
