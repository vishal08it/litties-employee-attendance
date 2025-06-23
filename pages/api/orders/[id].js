import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import sendEmail from '@/lib/sendEmail'; // make sure this exists

export default async function handler(req, res) {
  await dbConnect();

  const {
    query: { id },
    method,
  } = req;

  if (method === 'PUT') {
    try {
      const { status } = req.body;

      const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

      if (!order) return res.status(404).json({ error: 'Order not found' });

      const emailMap = {
        'Accepted': {
          subject: '✅ Litties Order Accepted',
          message: `Hi ${order.address?.name || 'Customer'},\n\nYour order ${order.orderId} has been accepted and is being prepared.\n\nThank you for ordering from Litties!`
        },
        'Rejected': {
          subject: '❌ Litties Order Rejected',
          message: `Hi ${order.address?.name || 'Customer'},\n\nUnfortunately, your order ${order.orderId} has been rejected.\n\nWe apologize for the inconvenience.`
        },
        'Out for Delivery': {
          subject: '🚚 Litties Order Dispatched',
          message: `Hi ${order.address?.name || 'Customer'},\n\nYour order ${order.orderId} is out for delivery and will reach you soon.\n\nThank you!`
        },
        'Delivered': {
          subject: '✅ Litties Order Delivered',
          message: `Hi ${order.address?.name || 'Customer'},\n\nYour order ${order.orderId} has been successfully delivered.\n\nEnjoy your meal!`
        },
      };

      if (order.email && emailMap[status]) {
        await sendEmail(order.email, emailMap[status].subject, emailMap[status].message);
      }

      res.status(200).json(order);

    } catch (err) {
      console.error('Status update error:', err);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  } else {
    res.status(405).end();
  }
}
