import dbConnect from '@/lib/mongodb';
import Customer from '@/models/CustomerRegister';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, emailId, mobileNumber, password, image } = req.body;

    if (!name || !emailId || !mobileNumber || !password || !image) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await Customer.findOne({
      $or: [{ emailId }, { mobileNumber }],
    });

    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newCustomer = new Customer({ name, emailId, mobileNumber, password, image });
    await newCustomer.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const userMailOptions = {
      from: `"Litties Restaurant" <${process.env.EMAIL_USER}>`,
      to: emailId,
      subject: '🎉 Registration Successful!',
      html: `
        <h3>Hello ${name},</h3>
        <p>Your registration was successful.</p>
        <p><strong>Login ID:</strong> ${mobileNumber}</p>
        <p><strong>Password:</strong> ${password}</p>
      `,
    };

    const adminMailOptions = {
      from: `"Litties System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: '📥 New Customer Registered',
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${emailId}</p>
        <p><strong>Mobile:</strong> ${mobileNumber}</p>
      `,
    };

    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    return res.status(201).json({ message: 'Registration successful' });

  } catch (err) {
    console.error('REGISTRATION ERROR:', err);
    return res.status(500).json({ message: 'Registration failed' });
  }
}
