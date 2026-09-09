// backend/models/Course.js
import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  department: { type: String, default: 'Computer Science & Engineering' },
  courseYear: { type: String, default: '3rd Year' },
  teacherId: { type: String, required: true },
  teacherName: { type: String, required: true },
  thumbnail: { type: String, default: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop' },
  modulesCount: { type: Number, default: 4 },
  lessonsCount: { type: Number, default: 12 },
  enrolledCount: { type: Number, default: 45 },
  rating: { type: Number, default: 4.8 },
  status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' }
}, { timestamps: true });

courseSchema.index({ code: 1 });
courseSchema.index({ teacherId: 1 });
courseSchema.index({ subject: 1 });

export default mongoose.model('Course', courseSchema);
