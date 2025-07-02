export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { tokens, title, body } = req.body;

  if (!tokens || tokens.length === 0) {
    return res.status(400).json({ error: 'No FCM tokens provided' });
  }

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${process.env.FCM_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registration_ids: tokens,
        notification: {
          title,
          body,
          sound: 'default', // 🔔 Optional: ensures notification makes sound
        },
        priority: 'high',
      }),
    });

    const data = await response.json();

    if (data.failure > 0) {
      console.warn('Some tokens failed:', data.results);
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('FCM Error:', error);
    res.status(500).json({ error: 'Failed to send notification', details: error.message });
  }
}
