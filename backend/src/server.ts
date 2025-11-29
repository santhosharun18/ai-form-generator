import dotenv from 'dotenv';
dotenv.config();

// Add these debug lines
console.log('📁 Current directory:', __dirname);
console.log('🔑 GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'EXISTS ✅' : 'MISSING ❌');
console.log('🔑 MONGODB_URI:', process.env.MONGODB_URI ? 'EXISTS ✅' : 'MISSING ❌');
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/auth';
import formRoutes from './routes/forms';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', // Local development
    'https://ai-form-generator-38m7.vercel.app/', // Your production URL
    'https://*.vercel.app', // All Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('✅ MongoDB connected');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
