const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  totalQuestions: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);