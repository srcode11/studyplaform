const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// استيراد الموديلات
const Subject = require('../models/Subject');
const Question = require('../models/Question');

// قراءة ملف الإكسل
const workbook = XLSX.readFile(path.join(__dirname, '../data/question_bank_AOU.xlsx'));

// 1️⃣ قراءة ورقة المواد (subjects)
const subjectsSheet = workbook.Sheets['subjects'];
const subjectsData = XLSX.utils.sheet_to_json(subjectsSheet);

// 2️⃣ قراءة ورقة الأسئلة (questions)
const questionsSheet = workbook.Sheets['questions'];
const questionsData = XLSX.utils.sheet_to_json(questionsSheet);

// 3️⃣ قراءة ورقة الاختيارات (choices) للأسئلة MCQ
const choicesSheet = workbook.Sheets['choices'];
const choicesData = XLSX.utils.sheet_to_json(choicesSheet);

// تحويل بيانات المواد إلى الموديل
async function seedSubjects() {
  console.log('📚 Seeding subjects...');
  let count = 0;
  for (const row of subjectsData) {
    const subjectId = row.subject_id;
    const subjectName = row.subject_name;
    
    if (!subjectId || !subjectName) continue;
    
    const existing = await Subject.findOne({ name: subjectId });
    if (!existing) {
      await Subject.create({
        name: subjectId,
        description: subjectName,
        totalQuestions: 0
      });
      count++;
    }
  }
  console.log(`✅ Added ${count} new subjects`);
}

// تحويل بيانات الأسئلة (نصوص طويلة) إلى الموديل
async function seedTextQuestions() {
  console.log('📝 Seeding text questions...');
  let count = 0;
  let skipped = 0;
  
  for (const row of questionsData) {
    const subjectIdCode = row.subject_id;
    const examType = row.exam_type;
    const questionText = row.question_text;
    const answer = row.answer;
    
    if (!subjectIdCode || !questionText || !answer) {
      skipped++;
      continue;
    }
    
    // البحث عن المادة بالـ code
    const subject = await Subject.findOne({ name: subjectIdCode });
    if (!subject) {
      console.log(`⚠️ Subject not found: ${subjectIdCode}`);
      skipped++;
      continue;
    }
    
    // التأكد من عدم وجود السؤال مسبقاً (حسب النص)
    const existing = await Question.findOne({ 
      subjectId: subject._id, 
      question: questionText 
    });
    
    if (!existing) {
      await Question.create({
        subjectId: subject._id,
        question: questionText,
        options: [],
        correctAnswer: answer,
        difficulty: examType === 'Final' ? 'hard' : 'medium'
      });
      count++;
      
      // تحديث عدد الأسئلة في المادة
      await Subject.findByIdAndUpdate(subject._id, {
        $inc: { totalQuestions: 1 }
      });
    }
  }
  console.log(`✅ Added ${count} new text questions (skipped ${skipped} invalid)`);
}

// تحويل أسئلة MCQ
async function seedMCQQuestions() {
  console.log('❓ Seeding MCQ questions...');
  let count = 0;
  let skipped = 0;
  
  for (const row of choicesData) {
    const subjectIdCode = row.subject_id;
    const correctAnswer = row.correct_answer;
    const optionA = row.A;
    const optionB = row.B;
    const optionC = row.C;
    const optionD = row.D;
    const questionText = row.question_MCQ;
    const examType = row.exam_type;
    
    // التحقق من البيانات الأساسية
    if (!subjectIdCode || !questionText || !correctAnswer) {
      skipped++;
      continue;
    }
    
    const subject = await Subject.findOne({ name: subjectIdCode });
    if (!subject) {
      console.log(`⚠️ Subject not found for MCQ: ${subjectIdCode}`);
      skipped++;
      continue;
    }
    
    const options = [optionA, optionB, optionC, optionD].filter(opt => opt && opt !== 'Null' && opt !== 'null');
    
    // البحث عن الحرف الصحيح (A,B,C,D) وتحويله إلى النص
    let correctAnswerText = '';
    if (correctAnswer === 'A') correctAnswerText = optionA;
    else if (correctAnswer === 'B') correctAnswerText = optionB;
    else if (correctAnswer === 'C') correctAnswerText = optionC;
    else if (correctAnswer === 'D') correctAnswerText = optionD;
    else correctAnswerText = correctAnswer;
    
    // التأكد من وجود إجابة صحيحة وخيارات كافية
    if (!correctAnswerText || options.length < 2) {
      skipped++;
      continue;
    }
    
    const existing = await Question.findOne({ 
      subjectId: subject._id, 
      question: questionText 
    });
    
    if (!existing) {
      try {
        await Question.create({
          subjectId: subject._id,
          question: questionText,
          options: options,
          correctAnswer: correctAnswerText,
          difficulty: examType === 'Final' ? 'hard' : 'medium'
        });
        count++;
        
        await Subject.findByIdAndUpdate(subject._id, {
          $inc: { totalQuestions: 1 }
        });
      } catch (err) {
        console.log(`⚠️ Failed to add MCQ: ${questionText.substring(0, 50)}... Error: ${err.message}`);
        skipped++;
      }
    }
  }
  console.log(`✅ Added ${count} new MCQ questions (skipped ${skipped} invalid)`);
}

// دالة رئيسية لتشغيل كل شيء
async function seedAll() {
  try {
    await seedSubjects();
    await seedTextQuestions();
    await seedMCQQuestions();
    console.log('🎉 All data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
}

// الاتصال بقاعدة البيانات ثم التشغيل
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    seedAll();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });