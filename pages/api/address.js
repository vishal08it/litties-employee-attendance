import dbConnect from '@/lib/mongodb';
import Address from '@/models/Address';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const addresses = await Address.find();
      res.status(200).json(addresses);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch addresses' });
    }
  }

  else if (req.method === 'POST') {
    const { name, address, mobile } = req.body;

    if (!name || !address || !mobile) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      const newAddress = new Address({ name, address, mobile });
      await newAddress.save();
      res.status(201).json({ message: 'Address added successfully', address: newAddress });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add address' });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
