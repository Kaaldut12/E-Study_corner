// backend/models/Bookmark.js
import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  itemType: { type: String, enum: ['course', 'material', 'note', 'quiz'], required: true },
  itemId: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Bookmark', bookmarkSchema);
