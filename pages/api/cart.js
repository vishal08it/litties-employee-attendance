import dbConnect from '@/lib/mongodb';
import Cart from '@/models/Cart';

export default async function handler(req, res) {
  await dbConnect();

  const method = req.method;

  if (method === 'POST') {
    const { mobile, items } = req.body;
    if (!mobile || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }
    try {
      const existing = await Cart.findOne({ mobile });
      if (existing) {
        existing.items = items;
        await existing.save();
      } else {
        await Cart.create({ mobile, items });
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Save failed' });
    }
  }

  if (method === 'GET') {
    const { mobile } = req.query;
    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Invalid query' });
    }
    try {
      const cart = await Cart.findOne({ mobile });
      return res.status(200).json({ success: true, items: cart?.items || [] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Fetch failed' });
    }
  }

  return res.status(405).end();
}
