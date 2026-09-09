// backend/models/Progress.js
import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  courseId: { type: String, required: true },
  courseTitle: { type: String, required: true },
  completedLessons: [{ type: String }],
  percentage: { type: Number, default: 0 },
  studyStreakDays: { type: Number, default: 1 },
  totalStudyMinutes: { type: Number, default: 120 },
  lastActiveAt: { type: Date, default: Date.now }
}, { timestamps: true });

progressSchema.index({ studentId: 1 });
progressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);
