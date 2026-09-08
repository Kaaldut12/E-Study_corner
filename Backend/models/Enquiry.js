// backend/models/Enquiry.js
import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  enquiryId: { type: Number },
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobileNo: { type: String },
  message: { type: String, required: true },
  enquiryDt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Enquiry', enquirySchema);
