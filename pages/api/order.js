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

        if (!email || !items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ error: 'Invalid order data' });
        }

        // Save the order
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

        // Clear user's cart
        await Cart.deleteOne({ mobile });

        // Format items for email
        const itemTableRows = items.map(i => `
          <tr>
            <td><img src="${i.image}" width="60" style="border-radius:6px;" /></td>
            <td>${i.name}</td>
            <td>${i.quantity}</td>
            <td>₹${i.price}</td>
            <td>₹${(i.price * i.quantity).toFixed(2)}</td>
          </tr>
        `).join('');

        const htmlMessage = `
          <h2>Thank you for your order!</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Payment:</strong> ${paymentMethod}</p>
          <p><strong>Delivery Address:</strong> ${address.name}, ${address.address}, ${address.mobile}</p>
          <table border="1" cellpadding="8" cellspacing="0" style="margin-top: 1rem; border-collapse: collapse;">
            <thead style="background: #facc15;">
              <tr>
                <th>Image</th><th>Item</th><th>Qty</th><th>Price</th><th>Total</th>
              </tr>
            </thead>
            <tbody>${itemTableRows}</tbody>
          </table>
          <p style="margin-top: 1rem;"><strong>Grand Total: ₹${totalAmount}</strong></p>
          <p>Team Litties Multi Cuisine Family Restaurant</p>
        `;

        // Send email to customer
        await sendEmail(email, '✅ Litties Order Confirmation', htmlMessage);

        // Send email to admin
        await sendEmail(
          process.env.ADMIN_EMAIL,
          `📦 New Order Received: ${orderId}`,
          `<p>New order from ${email} (Mobile: ${mobile})</p>` + htmlMessage
        );

        return res.status(201).json({ message: 'Order placed', order });

      } catch (error) {
        console.error('❌ Order Creation Error:', error);

        if (req.body?.email) {
          try {
            await sendEmail(
              req.body.email,
              '❌ Litties Order Failed',
              'We encountered an issue placing your order. Please try again later.'
            );
          } catch (err) {
            console.error('❌ Failed to send failure email:', err);
          }
        }

        return res.status(500).json({ error: 'Order creation failed' });
      }

    // ✅ UPDATE ORDER STATUS (Admin)
    case 'PUT':
      try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
          return res.status(400).json({ error: 'orderId and status are required' });
        }

        const allowed = ['New', 'Accepted', 'Rejected', 'Out for Delivery', 'Delivered'];
        if (!allowed.includes(status)) {
          return res.status(400).json({ error: 'Invalid status value' });
        }

        const updatedOrder = await Order.findOneAndUpdate(
          { orderId },
          { status },
          { new: true }
        );

        if (!updatedOrder) {
          return res.status(404).json({ error: 'Order not found' });
        }

        // Status-based message
        const statusText = {
          Accepted: 'Your order has been accepted and is being prepared.',
          Rejected: 'Unfortunately, your order has been rejected. Please contact on 8059286361.',
          'Out for Delivery': 'Your order is out for delivery!',
          Delivered: 'Your order has been delivered. Enjoy your meal!',
        };

        await sendEmail(
          updatedOrder.email,
          `📦 Litties Order Update - ${status}`,
          `
            <p>Hi,</p>
            <p>Your order <strong>${orderId}</strong> status is now: <strong>${status}</strong></p>
            <p>${statusText[status]}</p>
            <p>Team Litties Multi Cuisine Family Restaurant</p>
          `
        );

        return res.status(200).json({ message: 'Order status updated', order: updatedOrder });

      } catch (error) {
        console.error('❌ Status Update Error:', error);
        return res.status(500).json({ error: 'Failed to update order status' });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
