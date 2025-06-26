import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    try {
      const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Category already exists' });
      }

      const newCategory = await Category.create({ name });
      return res.status(201).json({ success: true, data: newCategory });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const categories = await Category.find().sort({ name: 1 });
      return res.status(200).json({ success: true, data: categories });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, message: 'ID is required' });

    try {
      await Category.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
