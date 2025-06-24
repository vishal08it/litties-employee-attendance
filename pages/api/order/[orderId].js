import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import sendEmail from '@/lib/sendEmail';

export default async function handler(req, res) {
  const { orderId } = req.query;

  await connectDB();

  if (req.method === 'PUT') {
    try {
      const { status, cancelledBy } = req.body;

      // Allow only user to cancel
      if (status !== 'Cancelled' || cancelledBy !== 'user') {
        return res.status(403).json({ message: 'Only users can cancel orders.' });
      }

      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      if (!order.email) {
        return res.status(400).json({ message: 'User email is missing in the order.' });
      }

      // Update status
      order.status = 'Cancelled';
      await order.save();

      // Send email to user
      const userEmailHTML = `
        <h3>Order Cancelled</h3>
        <p>Hi ${order.customerName || order.userId},</p>
        <p>Your order <strong>#${order.orderId}</strong> has been successfully <span style="color:red;">cancelled</span>.</p>
        <p>If this was a mistake, please contact support.</p>
        <p>Thank you for choosing Litties Restaurant.</p>
      `;
      await sendEmail(order.email, 'Your Order Has Been Cancelled', userEmailHTML);

      // Send email to admin
      const adminEmailHTML = `
        <h3>Order Cancelled by User</h3>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>User Mobile:</strong> ${order.userId}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Status:</strong> Cancelled</p>
      `;
      await sendEmail(process.env.ADMIN_EMAIL, 'User Cancelled an Order', adminEmailHTML);

      return res.status(200).json({ success: true, data: order });
    } catch (err) {
      console.error('Order cancellation failed:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
