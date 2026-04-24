const express = require('express');
const router = express.Router();

// عنوان الـ AI (Python)
const AI_API_URL = 'http://localhost:5002';

// 1. اختبار اتصال الـ AI
router.get('/health', async (req, res) => {
  try {
    const response = await fetch(`${AI_API_URL}/health`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'AI service not reachable', details: err.message });
  }
});

// 2. توليد أسئلة من الـ AI وحفظها
router.post('/generate-questions', async (req, res) => {
  try {
    const { subject, difficulty } = req.body;
    
    if (!subject) {
      return res.status(400).json({ error: 'subject is required' });
    }
    
    // 1. طلب من الـ AI
    const aiResponse = await fetch(`${AI_API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, difficulty: difficulty || 'medium' })
    });
    
    const aiData = await aiResponse.json();
    
    // 2. البحث عن المادة في قاعدة البيانات
    const Subject = require('../models/Subject');
    const Question = require('../models/Question');
    
    let subjectDoc = await Subject.findOne({ name: subject });
    
    // إذا المادة مو موجودة، ننشئها
    if (!subjectDoc) {
      subjectDoc = new Subject({ name: subject, description: `Questions about ${subject}` });
      await subjectDoc.save();
      console.log(`📚 Created new subject: ${subject}`);
    }
    
    // 3. حفظ الأسئلة في قاعدة البيانات
    const savedQuestions = [];
    for (const q of aiData.questions) {
      const newQuestion = new Question({
        subjectId: subjectDoc._id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: difficulty || 'medium'
      });
      await newQuestion.save();
      savedQuestions.push(newQuestion);
    }
    
    // 4. تحديث عدد الأسئلة في المادة
    await Subject.findByIdAndUpdate(subjectDoc._id, {
      $inc: { totalQuestions: savedQuestions.length }
    });
    
    res.json({
      success: true,
      message: `✅ ${savedQuestions.length} questions generated and saved`,
      subject: subjectDoc.name,
      questions: savedQuestions
    });
    
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;