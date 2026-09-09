// backend/models/Enrollment.js
import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, default: '' },
  courseId: { type: String, required: true },
  courseTitle: { type: String, default: '' },
  enrolledAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['enrolled', 'completed', 'dropped'], default: 'enrolled' },
  progressPercentage: { type: Number, default: 0 },
  completedLessons: [{ type: String }],
  completedAt: { type: Date, default: null }
}, { timestamps: true });

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ studentId: 1 });
enrollmentSchema.index({ courseId: 1 });

export default mongoose.model('Enrollment', enrollmentSchema);
