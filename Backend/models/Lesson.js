// backend/models/Lesson.js
import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  courseId: { type: String, required: true },
  moduleTitle: { type: String, required: true },
  lessonOrder: { type: Number, default: 1 },
  title: { type: String, required: true },
  description: { type: String, required: true },
  contentType: { type: String, enum: ['video', 'pdf', 'article'], default: 'article' },
  contentUrl: { type: String, default: '' },
  durationMinutes: { type: Number, default: 20 },
  isFreePreview: { type: Boolean, default: true }
}, { timestamps: true });

lessonSchema.index({ courseId: 1, lessonOrder: 1 });

export default mongoose.model('Lesson', lessonSchema);
