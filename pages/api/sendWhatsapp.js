// pages/api/sendWhatsapp.js
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = 'whatsapp:+14155238886'; // Twilio Sandbox Number

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.log('❌ Invalid request method:', req.method);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userName, userPhone,userId,userPassword } = req.body;
  const adminNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP;



  if (!userName || !userPhone ||!userId || !userPassword) {
    console.log('❌ Missing user data');
    return res.status(400).json({ success: false, message: 'Missing user data' });
  }

  const client = twilio(accountSid, authToken);

  try {
    // ✅ Send message to USER
    const toUser = `whatsapp:+91${userPhone}`;
    console.log(`📤 Sending message to user: ${toUser}`);

    const userMsg = await client.messages.create({
      from: fromNumber,
      to: toUser,
      body: `👋 Hello ${userName},\n\n🆔 Your User ID: ${userPhone}\n🔒 Password: ${userPassword}\n\nThank you for registering with Litties Multi Cuisine Family Restaurant!`

    });

    console.log('✅ User message sent! SID:', userMsg.sid);

    // ✅ Send message to ADMIN
    console.log(`📤 Sending message to admin: ${adminNumber}`);

    const adminMsg = await client.messages.create({
      from: fromNumber,
      to: adminNumber,
      body: `📥 New Registration:\n👤 Name: ${userName}\n📱 Phone: +91${userPhone}`,
    });

    console.log('✅ Admin message sent! SID:', adminMsg.sid);

    return res.status(200).json({ success: true, userSID: userMsg.sid, adminSID: adminMsg.sid });
  } catch (error) {
    console.error('❌ WhatsApp send failed:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}
