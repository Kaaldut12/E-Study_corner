// backend/models/Leave.js
import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userRole: { type: String, enum: ['student', 'teacher'], required: true },
  leaveType: {
    type: String,
    enum: ['sick', 'casual', 'academic', 'emergency', 'vacation'],
    default: 'casual'
  },
  startDate: { type: String, required: true }, // Format: YYYY-MM-DD
  endDate: { type: String, required: true },   // Format: YYYY-MM-DD
  totalDays: { type: Number, default: 1 },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: { type: String, default: null },
  reviewerNotes: { type: String, default: '' },
  reviewedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

leaveSchema.index({ userId: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ userRole: 1 });
leaveSchema.index({ createdAt: -1 });

export default mongoose.model('Leave', leaveSchema);
