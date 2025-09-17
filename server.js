const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger
require('./swagger')(app);

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');  // ✅ thêm dòng này

// Dùng routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);   // ✅ CRUD user

// Route mặc định cho trang chủ
app.get('/', (req, res) => {
  res.json({ message: 'API is running!' });
});

// Kết nối MongoDB và start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
  })
  .finally(() => {
    // Dù DB fail vẫn khởi động server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
