import dbConnect from "@/lib/mongodb";
import Address from "@/models/Address";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "PUT") {
    try {
      const { _id, ...updateData } = req.body;
      if (!_id) return res.status(400).json({ error: "Address ID missing" });

      const updatedAddress = await Address.findByIdAndUpdate(_id, updateData, {
        new: true,
      });
      if (!updatedAddress)
        return res.status(404).json({ error: "Address not found" });

      res.status(200).json(updatedAddress);
    } catch (error) {
      res.status(500).json({ error: "Failed to update address" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
