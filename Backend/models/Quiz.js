// backend/models/Quiz.js
import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  courseId: { type: String },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  timeLimitMinutes: { type: Number, default: 15 },
  totalQuestions: { type: Number, default: 5 },
  passingScore: { type: Number, default: 70 },
  teacherId: { type: String, required: true },
  teacherName: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
