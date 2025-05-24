import dbConnect from '@/lib/mongodb';
import Cart from '@/models/Cart';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { mobile, items } = req.body;

    if (!mobile || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    try {
      for (const item of items) {
        const existing = await Cart.findOne({ mobile, 'item._id': item._id });

        if (existing) {
          existing.quantity += item.quantity;
          await existing.save();
        } else {
          await Cart.create({
            mobile,
            item: {
              _id: item._id,
              name: item.name,
              image: item.image,
              price: item.price
            },
            quantity: item.quantity
          });
        }
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error saving cart:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
