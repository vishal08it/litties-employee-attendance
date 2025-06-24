import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import sendEmail from '@/lib/sendEmail';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  await dbConnect();

  const employee = await Employee.findOne({ emailId: email });

  if (!employee) {
    return res.status(404).json({ message: 'Employee with this email not found' });
  }

  const html = `
    <h3>Hello ${employee.name},</h3>
    <p>Your User Id is: <strong>${employee.mobileNumber}</strong></p>
    <p>Your password is: <strong>${employee.password}</strong></p>
    <p>Please log in...</p>
    <p>Thank you for choosing Litties Multi Cuisine Restaurant!</p>
  `;

  try {
    await sendEmail(email, 'Forgot Password - Litties Restaurant', html);
    return res.status(200).json({ message: 'Password sent to your email.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send email' });
  }
}
