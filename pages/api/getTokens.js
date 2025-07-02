import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userMobile, adminMobile } = req.body;

  try {
    await dbConnect();
    const db = mongoose.connection.db;

    const user = await db.collection('fcm_tokens').findOne({ mobile: userMobile });
    const admin = await db.collection('fcm_tokens').findOne({ mobile: adminMobile });

    const tokens = [];
    if (user?.token) tokens.push(user.token);
    if (admin?.token) tokens.push(admin.token);

    res.status(200).json({ tokens });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tokens', details: error.message });
  }
}
