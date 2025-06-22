import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import sendEmail from '@/lib/sendEmail';

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    // ✅ CREATE ORDER
    case 'POST':
      try {
        const {
          orderId,
          email,
          items,
          quantity,
          totalAmount,
          paymentMethod,
          address,
          mobile,
        } = req.body;

        // 1. Save the new order
        const order = await Order.create({
          orderId,
          userId: mobile,
          email,
          items,
          quantity,
          totalAmount,
          paymentMethod,
          address,
        });

        // 2. Remove user's cart after order
        const result = await Cart.deleteOne({ mobile });
        console.log('Cart deletion result:', result);

        // 3. Send confirmation emails
        await sendEmail(
          email,
          '✅ Your Litties Order Confirmation',
          `Hello,\n\nYour order ${orderId} has been placed successfully.\n\nTotal Amount: ₹${totalAmount}\n\nThank you for ordering with Litties!\n`
        );

        await sendEmail(
          process.env.ADMIN_EMAIL,
          `📦 New Order: ${orderId}`,
          `A new order has been placed:\n\nOrder ID: ${orderId}\nCustomer Email: ${email}\nMobile: ${mobile}\nTotal: ₹${totalAmount}\n\nItems:\n${items.map(i => `• ${i.name} x${i.quantity}`).join('\n')}`
        );

        return res.status(201).json({ message: 'Order placed', order });
      } catch (error) {
        console.error('Order Error:', error);

        // On failure, send email to user
        if (req.body?.email) {
          try {
            await sendEmail(
              req.body.email,
              '❌ Litties Order Failed',
              'Unfortunately, we encountered an issue while processing your order. Please try again later.'
            );
          } catch (e) {
            console.error('Failed to send failure email:', e);
          }
        }

        return res.status(500).json({ error: 'Order creation failed' });
      }

    // ✅ GET ORDERS
    case 'GET':
      try {
        const { orderId, userId } = req.query;

        if (orderId) {
          const order = await Order.findOne({ orderId });
          return order
            ? res.status(200).json(order)
            : res.status(404).json({ error: 'Order not found' });
        }

        if (userId) {
          const orders = await Order.find({ userId });
          return res.status(200).json(orders);
        }

        const allOrders = await Order.find();
        return res.status(200).json(allOrders);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }

    // ✅ UPDATE ORDER STATUS
    case 'PUT':
      try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
          return res.status(400).json({ error: 'orderId and status required' });
        }

        const allowed = ['New', 'Accepted', 'Rejected', 'Out for Delivery', 'Delivered'];
        if (!allowed.includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }

        const updated = await Order.findOneAndUpdate(
          { orderId },
          { status },
          { new: true }
        );

        return updated
          ? res.status(200).json({ message: 'Status updated', order: updated })
          : res.status(404).json({ error: 'Order not found' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update order' });
      }

    // ✅ DELETE ORDER
    case 'DELETE':
      try {
        const { orderId } = req.query;

        if (!orderId) {
          return res.status(400).json({ error: 'orderId is required' });
        }

        const deleted = await Order.findOneAndDelete({ orderId });
        return deleted
          ? res.status(200).json({ message: 'Order deleted' })
          : res.status(404).json({ error: 'Order not found' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete order' });
      }

    // ❌ Unsupported method
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
