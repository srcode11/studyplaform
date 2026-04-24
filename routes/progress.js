const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Subject = require('../models/Subject');

// POST /api/progress - تحديث التقدم
router.post('/', async (req, res) => {
  try {
    let { userId, subjectId, isCorrect } = req.body;
    
    // تحويل subjectId إذا كان نصاً (اسم المادة) إلى ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(subjectId);
    let subjectDoc;
    
    if (isObjectId) {
      subjectDoc = await Subject.findById(subjectId);
    } else {
      subjectDoc = await Subject.findOne({ name: subjectId });
    }
    
    if (!subjectDoc) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    let progress = await Progress.findOne({ 
      userId: userId, 
      subjectId: subjectDoc._id 
    });
    
    if (!progress) {
      progress = new Progress({ 
        userId: userId, 
        subjectId: subjectDoc._id,
        answered: 0,
        correct: 0
      });
    }
    
    progress.answered += 1;
    if (isCorrect) progress.correct += 1;
    
    await progress.save();
    res.json(progress);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/progress/:userId/:subjectId - عرض التقدم (يقبل اسم المادة أو ObjectId)
router.get('/:userId/:subjectId', async (req, res) => {
  try {
    const { userId, subjectId } = req.params;
    
    // تحويل subjectId إذا كان نصاً إلى ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(subjectId);
    let subjectDoc;
    
    if (isObjectId) {
      subjectDoc = await Subject.findById(subjectId);
    } else {
      subjectDoc = await Subject.findOne({ name: subjectId });
    }
    
    if (!subjectDoc) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    let progress = await Progress.findOne({ 
      userId: userId, 
      subjectId: subjectDoc._id 
    });
    
    if (!progress) {
      return res.json({ answered: 0, correct: 0, percent: 0 });
    }
    
    const percent = subjectDoc.totalQuestions > 0
      ? (progress.answered / subjectDoc.totalQuestions) * 100
      : 0;
    
    res.json({
      answered: progress.answered,
      correct: progress.correct,
      percent: Math.round(percent)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;