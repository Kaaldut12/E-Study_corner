// backend/models/Note.js
import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'General' },
  tags: [{ type: String }],
  courseId: { type: String, default: null },
  lessonId: { type: String, default: null },
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  color: { type: String, default: '#ffffff' }
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);
