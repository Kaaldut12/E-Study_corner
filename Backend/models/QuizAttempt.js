// backend/models/QuizAttempt.js
import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  quizId: { type: String, required: true },
  quizTitle: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  score: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  percentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  timeTakenSeconds: { type: Number, default: 300 },
  answers: [{
    questionId: String,
    selectedOption: Number,
    isCorrect: Boolean
  }],
}, { timestamps: true });

quizAttemptSchema.index({ studentId: 1 });
quizAttemptSchema.index({ quizId: 1 });
quizAttemptSchema.index({ studentId: 1, quizId: 1 });

export default mongoose.model('QuizAttempt', quizAttemptSchema);
