// pages/api/address/save.js
import dbConnect from "@/lib/mongodb";
import Address from "@/models/Address";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { _id, name, streetNumber, wardNo, place, pinCode, mobileNumber } = req.body;

  if (!name || !streetNumber || !wardNo || !place || !pinCode || !mobileNumber) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    let savedAddress;

    if (_id) {
      // Edit existing address
      savedAddress = await Address.findByIdAndUpdate(
        _id,
        { name, streetNumber, wardNo, place, pinCode, mobileNumber },
        { new: true }
      );
    } else {
      // Add new address
      const newAddress = new Address({ name, streetNumber, wardNo, place, pinCode, mobileNumber });
      savedAddress = await newAddress.save();
    }

    if (!savedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    const plainAddress = savedAddress.toObject();
    plainAddress._id = plainAddress._id.toString();

    res.status(200).json(plainAddress);
  } catch (error) {
    res.status(500).json({ message: "Error saving address", error });
  }
}
