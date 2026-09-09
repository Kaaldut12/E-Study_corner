// backend/models/Assignment.js
import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  teacherId: { type: String, required: true },
  teacherName: { type: String, required: true },
  dueDate: { type: Date, required: true },
  totalPoints: { type: Number, default: 100 },
  resourceLink: { type: String, default: '' },
  attachmentUrl: { type: String, default: '' },
  attachmentName: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

assignmentSchema.index({ teacherId: 1 });
assignmentSchema.index({ subject: 1 });

export default mongoose.model('Assignment', assignmentSchema);
