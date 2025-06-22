import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/, // optional: validates Indian mobile numbers
    },
  },
  { timestamps: true }
);

export default mongoose.models.Address || mongoose.model('Address', AddressSchema);

