import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';

export default async function handler(req, res) {
  await dbConnect();

  const {
    query: { id },
    method,
  } = req;

  switch (method) {
    case 'PUT':
      try {
        const updated = await Employee.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!updated)
          return res.status(404).json({ success: false, message: 'Employee not found' });

        return res.status(200).json({ success: true, data: updated });
      } catch (error) {
        console.error('PUT error:', error);
        return res.status(500).json({ success: false, message: 'Update failed' });
      }

    case 'DELETE':
      try {
        const deleted = await Employee.findByIdAndDelete(id);
        if (!deleted)
          return res.status(404).json({ success: false, message: 'Employee not found' });

        return res.status(200).json({ success: true, message: 'Employee deleted' });
      } catch (error) {
        console.error('DELETE error:', error);
        return res.status(500).json({ success: false, message: 'Delete failed' });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
