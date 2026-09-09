// backend/models/TeacherQuestion.js
import mongoose from 'mongoose';

const teacherQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String },
  teacherId: { type: String, required: true },
  teacherName: { type: String, required: true },
  assignmentId: { type: String, default: '' },
  assignmentTitle: { type: String, default: '' },
  subject: { type: String, default: 'General Academic' },
  title: { type: String, required: true },
  question: { type: String, required: true },
  status: { type: String, enum: ['pending', 'answered'], default: 'pending' },
  teacherReply: { type: String, default: '' },
  repliedAt: { type: Date, default: null }
}, { timestamps: true });

teacherQuestionSchema.index({ studentId: 1 });
teacherQuestionSchema.index({ teacherId: 1 });
teacherQuestionSchema.index({ status: 1 });

export default mongoose.model('TeacherQuestion', teacherQuestionSchema);
