// models/Address.js
import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  name: String,
  streetNumber: String,
  wardNo: String,
  place: String,
  pinCode: String,
  mobileNumber: String,
});

export default mongoose.models.Address || mongoose.model("Address", AddressSchema);
