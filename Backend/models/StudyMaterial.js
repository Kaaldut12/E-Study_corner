// backend/models/StudyMaterial.js
import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  materialId: { type: Number },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  fileName: { type: String, default: 'Document.pdf' },
  fileUrl: { type: String, default: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  uploadDt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('StudyMaterial', studyMaterialSchema);
