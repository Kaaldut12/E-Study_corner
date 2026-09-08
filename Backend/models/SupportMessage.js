// backend/models/SupportMessage.js
import mongoose from 'mongoose';

const supportMessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  subject: { type: String, required: true },
  category: { type: String, default: 'General Support' },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  adminReply: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('SupportMessage', supportMessageSchema);
