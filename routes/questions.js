const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Subject = require('../models/Subject');

// GET /api/questions/subject/:subjectId - جلب أسئلة مادة (يقبل اسم المادة أو ObjectId)
router.get('/subject/:subjectId', async (req, res) => {
  try {
    let subjectId = req.params.subjectId;
    let subjectDoc;
    
    // التحقق: إذا كان النص يطابق ObjectId (24 حرف Hex)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(subjectId);
    
    if (isObjectId) {
      // إذا كان ObjectId، نبحث مباشرة
      subjectDoc = await Subject.findById(subjectId);
    } else {
      // إذا كان نص عادي، نبحث بالاسم (name)
      subjectDoc = await Subject.findOne({ name: subjectId });
    }
    
    if (!subjectDoc) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    const questions = await Question.find({ subjectId: subjectDoc._id });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/questions - إضافة سؤال
router.post('/', async (req, res) => {
  try {
    let subjectId = req.body.subjectId;
    let subjectDoc;
    
    // التحقق: إذا كان النص يطابق ObjectId (24 حرف Hex)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(subjectId);
    
    if (isObjectId) {
      subjectDoc = await Subject.findById(subjectId);
    } else {
      subjectDoc = await Subject.findOne({ name: subjectId });
    }
    
    if (!subjectDoc) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    const question = new Question({
      ...req.body,
      subjectId: subjectDoc._id
    });
    
    await question.save();
    
    // تحديث عدد الأسئلة في المادة
    await Subject.findByIdAndUpdate(subjectDoc._id, {
      $inc: { totalQuestions: 1 }
    });
    
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;