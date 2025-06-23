// /pages/api/address/user.js
import dbConnect from '@/lib/mongodb';
import Address from '@/models/Address';

export default async function handler(req, res) {
  await dbConnect();

  const { method, query: { mobile } } = req;

  if (method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!mobile) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  try {
    const addresses = await Address.find({ mobile });
    return res.status(200).json(addresses);
  } catch (err) {
    console.error('ADDRESS FETCH ERROR:', err);
    return res.status(500).json({ message: 'Failed to fetch addresses' });
  }
}
