import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { orderId, userId, email, items, quantity, totalAmount } = req.body;

      const newOrder = await Order.create({
        orderId,
        userId,
        email,
        items,
        quantity,
        totalAmount,
        // status will be set to 'New' by default
      });

      res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
      console.error('Order creation failed:', error);
      res.status(500).json({ success: false, message: 'Order creation failed.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
