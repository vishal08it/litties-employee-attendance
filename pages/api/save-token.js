import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  const { mobile, token } = req.body;

  try {
    await dbConnect();
    const db = mongoose.connection.db;

    await db.collection('fcm_tokens').updateOne(
      { mobile },
      { $set: { token } },
      { upsert: true }
    );

    res.status(200).json({ success: true, message: 'Token saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Token saving failed', details: error.message });
  }
}
