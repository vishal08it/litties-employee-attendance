import dbConnect from '../../../lib/mongodb';
import Order from '../../../models/Order';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } else if (req.method === 'POST') {
    try {
      const newOrder = new Order(req.body);
      await newOrder.save();
      res.status(201).json(newOrder);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
