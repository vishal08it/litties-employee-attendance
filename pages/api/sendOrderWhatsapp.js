import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = 'whatsapp:+14155238886';
const adminNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP;

const client = twilio(accountSid, authToken);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { orderId, name, mobile, address, items, total, deliveryCharge = 0 } = req.body;

  try {
    const itemList = items.map(
      (item, i) =>
        `${i + 1}. *${item.name}* (x${item.quantity}) - ₹${item.price}`
    ).join('\n');

    const deliveryLine = deliveryCharge > 0
      ? `\n🚚 *Delivery Charge:* ₹${deliveryCharge}`
      : '';

    const userMsg = `👋 Hello *${name}*,

Thank you for ordering at *Litties Multi Cuisine Family Restaurant*! 🎉

📦 *Order ID:* ${orderId}
🏠 *Address:* ${address?.address}
📱 *Mobile:* ${mobile}

🛒 *Items Ordered:*
${itemList}
${deliveryLine}

💰 *Total Amount:* ₹${total + deliveryCharge}

We'll deliver your food shortly. 🍽️`;

    const adminMsg = `📥 *New Order Received!*

📦 *Order ID:* ${orderId}
👤 *Customer:* ${name}
📱 *Mobile:* ${mobile}
🏠 *Address:* ${address?.address}

🛒 *Items:*
${itemList}
${deliveryLine}

💰 *Total:* ₹${total + deliveryCharge}

Please prepare for delivery. ✅`;

    // Send message to user
    await client.messages.create({
      from: fromNumber,
      to: `whatsapp:+91${mobile}`,
      body: userMsg,
    });

    // Send message to admin
    await client.messages.create({
      from: fromNumber,
      to: adminNumber ,
      body: adminMsg,
    });

    console.log('✅ WhatsApp messages sent to user & admin');

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
