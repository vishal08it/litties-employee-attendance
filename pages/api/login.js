// import dbConnect from '@/lib/mongodb';
// import User from '@/models/User';
// import Employee from '@/models/Employee';

// export default async function handler(req, res) {
//   if (req.method !== 'POST') return res.status(405).end();

//   await dbConnect();

//   const { empId, password } = req.body;
//   const user = await Employee.findOne({ empId, password });

//   if (!user) return res.status(401).json({ message: 'Invalid credentials' });

//   res.status(200).json({ role: user.role, name: user.name ,image:user.image});
//   }
// pages/api/login.js
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await dbConnect();
  const { identifier, password } = req.body;

  // Try employee/admin login by empId
  let user = await Employee.findOne({ empId: identifier, password });

  // If not found, try other-user login by mobileNumber
  if (!user) {
    user = await Employee.findOne({ mobileNumber: identifier, password });
  }

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Determine redirect
  let destination = '/itemspage';
  if (user.role === 'admin')       destination = '/admin';
  else if (user.role === 'employee') destination = '/employee';

  return res.status(200).json({
    role:          user.role,
    name:          user.name,
    image:         user.image,
    emailId:       user.emailId,
    empId:         user.empId || '',
    mobileNumber:  user.mobileNumber || '',
    destination,
  });
}
