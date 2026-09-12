// backend/models/Attendance.js
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, enum: ['student', 'teacher', 'admin', 'superadmin'], required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  checkInTime: { type: String, required: true }, // e.g. 09:30 AM
  status: { type: String, enum: ['present', 'late', 'on_leave', 'absent'], default: 'present' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ userRole: 1 });

export default mongoose.model('Attendance', attendanceSchema);
