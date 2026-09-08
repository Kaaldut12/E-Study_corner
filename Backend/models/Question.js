// backend/models/Question.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  quizId: { type: String, required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  explanation: { type: String, default: '' },
  points: { type: Number, default: 10 }
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
