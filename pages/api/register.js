import dbConnect from '@/lib/mongodb';
import Customer from '@/models/CustomerRegister';
import nodemailer from 'nodemailer';

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

    // ✅ Send Email to User & Admin
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,       // e.g. litties.cafe2024@gmail.com
        pass: process.env.EMAIL_PASS,       // app password from Gmail
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
        <p>Thank you for choosing Litties Multi Cuisine Restaurant!</p>
      `,
    };

    const adminMailOptions = {
      from: `"Litties System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: '📥 New Customer Registered',
      html: `
        <h4>New Customer Details</h4>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${emailId}</p>
        <p><strong>Mobile:</strong> ${mobileNumber}</p>
      `,
    };

    // Send both emails
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    return res.status(201).json({ message: 'Registration successful' });

  } catch (err) {
    console.error('REGISTRATION ERROR:', err);
    return res.status(500).json({ message: 'Registration failed' });
  }
}
