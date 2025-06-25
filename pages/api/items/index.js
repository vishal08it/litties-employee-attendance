import dbConnect from '@/lib/mongodb';
import Item from '@/models/Item';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { name, price, image, category, stock } = req.body;

      if (!name || !price || !image || !category) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const item = new Item({
        name,
        price,
        image,
        category,
        stock: stock || 'In Stock',  // ✅ Ensure default
      });

      await item.save();
      return res.status(201).json(item);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (req.method === 'GET') {
    const items = await Item.find().sort({ createdAt: -1 });
    return res.status(200).json(items);
  }

  res.status(405).end();
}