import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import sendEmail from '@/lib/sendEmail';

export default async function handler(req, res) {
  await dbConnect();
  const { method, query } = req;

  switch (method) {

    // ✅ CREATE ORDER
    case 'POST': {
      try {
        const {
          orderId,
          email,
          utr,
          items,
          quantity,
          totalAmount,
          paymentMethod,
          address,
          mobile,
        } = req.body;

        if (!email || !items?.length || !mobile) {
          return res.status(400).json({ error: 'Missing fields' });
        }

        const order = await Order.create({
          orderId,
          userId: mobile,
          email,
          utr,
          items,
          quantity,
          totalAmount,
          paymentMethod,
          address,
        });

        await Cart.deleteOne({ mobile });

        // Build Email HTML
        const itemRows = items.map(i => `
          <tr>
            <td><img src="${i.image}" width="60" /></td>
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
          <table border="1" cellpadding="8" cellspacing="0">
            <thead style="background: #facc15;">
              <tr><th>Image</th><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          <p><strong>Grand Total: ₹${totalAmount}</strong></p>
        `;

        await sendEmail(email, '✅ Litties Order Confirmation', htmlMessage);
        await sendEmail(process.env.ADMIN_EMAIL, `📦 New Order: ${orderId}`, htmlMessage);

        return res.status(201).json({ message: 'Order placed', order });

      } catch (err) {
        console.error('Order POST Error:', err);
        return res.status(500).json({ error: 'Order creation failed' });
      }
    }

    // ✅ UPDATE ORDER STATUS (Admin)
    case 'PUT': {
      try {
        const { orderId, status } = req.body;
        const allowed = ['New', 'Accepted', 'Rejected', 'Out for Delivery', 'Delivered', 'Cancelled'];

        if (!orderId || !allowed.includes(status)) {
          return res.status(400).json({ error: 'Invalid status or orderId' });
        }

        const updatedOrder = await Order.findOneAndUpdate(
          { orderId },
          { status },
          { new: true }
        );

        if (!updatedOrder) {
          return res.status(404).json({ error: 'Order not found' });
        }

        const statusText = {
          Accepted: 'Your order has been accepted.',
          Rejected: 'Your order was rejected. Call 8059286361.',
          'Out for Delivery': 'Your order is out for delivery.',
          Delivered: 'Your order has been delivered.',
        };

        await sendEmail(
          updatedOrder.email,
          `📦 Order Update - ${status}`,
          `<p>Your order <strong>${orderId}</strong> is now <strong>${status}</strong>.</p><p>${statusText[status] || ''}</p>`
        );

        return res.status(200).json({ message: 'Status updated', order: updatedOrder });

      } catch (err) {
        console.error('Order PUT Error:', err);
        return res.status(500).json({ error: 'Update failed' });
      }
    }

    // ✅ GET ORDERS (User or Admin)
    case 'GET': {
      try {
        const { mobile } = query;

        let orders;
        if (mobile) {
          // User-specific orders
          orders = await Order.find({ userId: mobile }).sort({ createdAt: -1 });
        } else {
          // Admin - all orders
          orders = await Order.find().sort({ createdAt: -1 });
        }

        return res.status(200).json(orders);

      } catch (err) {
        console.error('Order GET Error:', err);
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
