// backend/models/User.js
import mongoose from 'mongoose';
import { hashPassword, isBcryptHash } from '../src/utils/password.js';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin', 'superadmin'], default: 'student' },
  permissions: { type: [String], default: [] },
  gender: { type: String, default: 'Male' },
  collegeName: { type: String, default: 'National Institute of Technology & Advanced Studies' },
  course: { type: String, default: 'Computer Science & Engineering' },
  courseYear: { type: String, default: '1st Year' },
  mobileNo: { type: String },
  dob: { type: String },
  addressP: { type: String },
  userpic: { type: String, default: 'default.jpg' },
  status: { type: String, default: 'active' },
  joinedAt: { type: Date, default: Date.now },
  resetCode: { type: String, default: null },
  resetExpires: { type: Number, default: null }
}, { timestamps: true });

// Auto-encrypt password with bcrypt before saving if not already hashed
userSchema.pre('save', function (next) {
  if (this.isModified('password') && !isBcryptHash(this.password)) {
    this.password = hashPassword(this.password);
  }
  if (typeof next === 'function') {
    next();
  }
});

export default mongoose.model('User', userSchema);
