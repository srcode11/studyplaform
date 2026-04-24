const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: { 
    type: String,  // changed from ObjectId to String
    required: true 
  },
  subjectId: { 
    type: String,  // changed from ObjectId to String
    required: true 
  },
  answered: { 
    type: Number, 
    default: 0 
  },
  correct: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

// منع تكرار نفس المستخدم ونفس المادة
ProgressSchema.index({ userId: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);