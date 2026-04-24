const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// 1. إنشاء تطبيق express (هذا السطر كان مفقوداً أو في غير مكانه)
const app = express(); 

app.use(express.json());

// 2. استيراد الـ Routes
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/ai', require('./routes/ai'));

// 3. الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    
    // 4. تشغيل الخادم (السيرفر) بعد نجاح الاتصال
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    }).on('error', (err) => {
      console.error("❌ Server failed to start:", err);
      process.exit(1);
    });
    
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });
