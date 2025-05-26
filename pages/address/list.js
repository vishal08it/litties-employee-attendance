// pages/api/address/list.js
import dbConnect from "@/lib/mongodb";
import Address from "@/models/Address";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { mobileNumber } = req.body;
  if (!mobileNumber) {
    return res.status(400).json({ message: "mobileNumber is required" });
  }

  try {
    const addresses = await Address.find({ mobileNumber });

    // convert mongoose docs to plain objects
    const plainAddresses = addresses.map((doc) => {
      const obj = doc.toObject();
      obj._id = obj._id.toString();
      return obj;
    });

    res.status(200).json(plainAddresses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching addresses", error });
  }
}
