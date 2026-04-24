const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// ========== Test Route ==========
app.get('/', (req, res) => {
  res.json({ message: 'API is working ✅' });
});

// ========== Routes ==========
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/ai', require('./routes/ai'));  // Route للـ AI

// ========== Seed Default Subjects ==========
const seedSubjects = async () => {
  try {
    const Subject = mongoose.model('Subject');
    const count = await Subject.countDocuments();
    
    if (count === 0) {
      const subjects = [
        { name: 'Mathematics', description: 'Algebra, Calculus, Geometry' },
        { name: 'Physics', description: 'Mechanics, Electricity, Waves' },
        { name: 'Computer Science', description: 'Programming, Algorithms, Data Structures' },
        { name: 'English', description: 'Grammar, Literature, Writing' },
        { name: 'Chemistry', description: 'Organic, Inorganic, Physical' }
      ];
      
      await Subject.insertMany(subjects);
      console.log('✅ Default subjects added');
    }
  } catch (err) {
    console.log('⚠️ Seed error:', err.message);
  }
};

// ========== Connect to MongoDB ==========
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    // Load models
    require('./models/User');
    require('./models/Subject');
    require('./models/Question');
    require('./models/Progress');
    
    // Add default subjects
    await seedSubjects();
    
    // Start server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });