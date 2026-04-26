const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ✅ أضيفي هذا السطر — يسمح لكل المواقع تتصل بالباك-اند
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

app.use(express.json());

app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/ai', require('./routes/ai'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
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
