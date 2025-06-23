import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import sendEmail from '@/lib/sendEmail';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // ❌ Cancel allowed only within 3 minutes
    if (status === 'Cancelled') {
      const ageMs = Date.now() - new Date(order.createdAt).getTime();
      const limitMs = 3 * 60 * 1000;
      if (ageMs > limitMs) {
        return res.status(400).json({ error: 'Cancel period (3 min) expired' });
      }
    }

    // ✅ Update status
    order.status = status;
    await order.save();

    // 📧 Email Notification
    const emailMap = {
      Accepted: {
        subject: '✅ Litties Order Accepted',
        message: `Hi ${order.address?.name || 'Customer'},\n\nYour order ${order.orderId} has been accepted and is being prepared.\n\nThank you for ordering from Litties!`
      },
      Rejected: {
        subject: '❌ Litties Order Rejected',
        message: `Hi ${order.address?.name || 'Customer'},\n\nUnfortunately, your order ${order.orderId} has been rejected.\n\nWe apologize for the inconvenience.`
      },
      'Out for Delivery': {
        subject: '🚚 Litties Order Dispatched',
        message: `Hi ${order.address?.name || 'Customer'},\n\nYour order ${order.orderId} is out for delivery and will reach you soon.\n\nThank you!`
      },
      Delivered: {
        subject: '✅ Litties Order Delivered',
        message: `Hi ${order.address?.name || 'Customer'},\n\nYour order ${order.orderId} has been successfully delivered.\n\nEnjoy your meal!`
      },
      Cancelled: {
        subject: '❌ Litties Order Cancelled',
        message: `Hi ${order.address?.name || 'Customer'},\n\nYour order ${order.orderId} has been cancelled as per your request.\n\nWe hope to serve you again soon!`
      }
    };

    if (order.email && emailMap[status]) {
      await sendEmail(order.email, emailMap[status].subject, emailMap[status].message);
    }

    return res.status(200).json({ message: `Order ${status} successfully` });

  } catch (err) {
    console.error('Status update error:', err);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
}
