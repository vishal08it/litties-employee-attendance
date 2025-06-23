import dbConnect from '@/lib/mongodb';
import Customer from '@/models/CustomerRegister';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, emailId, mobileNumber, password } = req.body;

    if (!name || !emailId || !mobileNumber || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await Customer.findOne({
      $or: [{ emailId }, { mobileNumber }],
    });

    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newCustomer = new Customer({ name, emailId, mobileNumber, password });
    await newCustomer.save();

    return res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('REGISTRATION ERROR:', err);
    return res.status(500).json({ message: 'Registration failed' });
  }
}
