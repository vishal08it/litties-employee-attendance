import mongoose from 'mongoose';

const SpecialOfferSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  offerType: { type: String, enum: ['day', 'time'], required: true },
  dayOfWeek: { type: String }, // Only if offerType === 'day'
  startDateTime: { type: Date }, // Only if offerType === 'time'
  endDateTime: { type: Date },   // Only if offerType === 'time'
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.SpecialOffer || mongoose.model('SpecialOffer', SpecialOfferSchema);
