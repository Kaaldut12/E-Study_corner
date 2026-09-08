// backend/models/Submission.js
import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  assignmentId: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  submissionText: { type: String, default: '' },
  attachmentUrl: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
  grade: { type: Number, default: null },
  totalPoints: { type: Number, default: 100 },
  feedback: { type: String, default: '' },
  gradedAt: { type: Date, default: null },
  gradedBy: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);
