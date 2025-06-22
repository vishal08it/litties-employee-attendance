import dbConnect from '@/lib/mongodb';
import Address from '@/models/Address';

export default async function handler(req, res) {
  await dbConnect();

  const {
    query: { id },
    method,
  } = req;

  try {
    switch (method) {
      // ✅ UPDATE ADDRESS
      case 'PUT':
        const updated = await Address.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!updated) return res.status(404).json({ success: false, error: 'Address not found' });
        return res.status(200).json(updated);

      // ✅ DELETE ADDRESS
      case 'DELETE':
        const deleted = await Address.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, error: 'Address not found' });
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
