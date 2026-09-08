// backend/models/Feedback.js
import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String },
  studentName: { type: String, required: true },
  topic: { type: String, default: 'General Coursework Feedback' },
  assignmentTitle: { type: String, default: 'E-Study Corner' },
  rating: { type: Number, default: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);
