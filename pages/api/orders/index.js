// // import dbConnect from '../../../lib/mongodb';
// // import Order from '../../../models/Order';

// // export default async function handler(req, res) {
// //   await dbConnect();

// //   if (req.method === 'GET') {
// //     const orders = await Order.find().sort({ createdAt: -1 });
// //     res.status(200).json(orders);
// //   } else if (req.method === 'POST') {
// //     try {
// //       const newOrder = new Order(req.body);
// //       await newOrder.save();
// //       res.status(201).json(newOrder);
// //     } catch (err) {
// //       res.status(400).json({ error: err.message });
// //     }
// //   } else {
// //     res.status(405).end(); // Method Not Allowed
// //   }
// // }
// import dbConnect from '../../../lib/mongodb';
// import Order from '../../../models/Order';

// export default async function handler(req, res) {
//   await dbConnect();

//   if (req.method === 'GET') {
//     try {
//       const orders = await Order.find().sort({ createdAt: -1 });
//       res.status(200).json(orders);
//     } catch (err) {
//       res.status(500).json({ error: "Failed to fetch orders" });
//     }
//   } else if (req.method === 'POST') {
//     try {
//       // Debug: This will show in your terminal/console
//       console.log("Order Data Received:", req.body);

//       // We pass the whole body. Since you added 'utr' to the Schema, 
//       // Mongoose will now accept it.
//       const newOrder = new Order(req.body);
//       await newOrder.save();
      
//       res.status(201).json(newOrder);
//     } catch (err) {
//       console.error("Order Save Error:", err);
//       res.status(400).json({ error: err.message });
//     }
//   } else {
//     res.status(405).end(); 
//   }
// }
import dbConnect from '../../../lib/mongodb';
import Order from '../../../models/Order';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      // 1. Manually construct the object to ensure nothing is missed
      const { utr, paymentMethod, ...otherData } = req.body;
      
      const newOrder = new Order({
        ...otherData,
        paymentMethod,
        // Force the UTR to be a string and trim it
        utr: paymentMethod === 'Online Payment' ? String(utr).trim() : ''
      });

      const savedOrder = await newOrder.save();
      console.log("SUCCESS: Order saved with UTR:", savedOrder.utr);
      return res.status(201).json(savedOrder);
    } catch (err) {
      console.error("DATABASE ERROR:", err.message);
      return res.status(400).json({ error: err.message });
    }
  } else {
    // GET request logic
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  }
}