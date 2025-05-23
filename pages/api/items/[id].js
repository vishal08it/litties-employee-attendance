import dbConnect from '../../../lib/mongodb';
import Item from '../../../models/Item';

export default async function handler(req, res) {
  await dbConnect();

  const {
    query: { id },
    method,
  } = req;

  switch (method) {
    case 'PUT':
      try {
        const item = await Item.findByIdAndUpdate(
          id,
          req.body,
          { new: true }
        );
        if (!item) {
          return res.status(404).json({ message: 'Item not found' });
        }
        return res.status(200).json(item);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }

    case 'DELETE':
      try {
        const deletedItem = await Item.findByIdAndDelete(id);
        if (!deletedItem) {
          return res.status(404).json({ message: 'Item not found' });
        }
        return res.status(200).json({ message: 'Item deleted' });
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
