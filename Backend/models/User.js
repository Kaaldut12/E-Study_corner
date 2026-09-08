// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  gender: { type: String, default: 'Male' },
  collegeName: { type: String, default: 'Government Polytechnic Aurai, Bhadohi' },
  course: { type: String, default: 'Diploma in Computer Science & Engineering' },
  courseYear: { type: String, default: '3rd Year' },
  mobileNo: { type: String },
  dob: { type: String },
  addressP: { type: String },
  userpic: { type: String, default: 'default.jpg' },
  status: { type: String, default: 'active' },
  joinedAt: { type: Date, default: Date.now },
  resetCode: { type: String, default: null },
  resetExpires: { type: Number, default: null }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
