const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Config CORS with Credentials (Critical for HTTPOnly JWT Cookies across ports!)
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Port configuration
const PORT = process.env.PORT || 5000;

// Connect to MongoDB with multiple retries and local fallback
const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sportnest';

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(dbURI);
    console.log('MongoDB successfully connected!');
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`);
    // If the Atlas URI fails, attempt to connect to a local MongoDB
    if (dbURI.includes('mongodb+srv://')) {
      console.log('Attempting local MongoDB connection fallback...');
      try {
        await mongoose.connect('mongodb://127.0.0.1:27017/sportnest');
        console.log('Fallback local MongoDB successfully connected!');
      } catch (localErr) {
        console.error(`Local fallback failed: ${localErr.message}`);
        console.log('Server starting in offline mode (DB unavailable).');
      }
    } else {
      console.log('Server starting in offline mode (DB unavailable).');
    }
  }
};

connectDB();

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SportNest Sports Facility Booking Platform API',
    status: 'Operational',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/facilities', require('./routes/facilities'));
app.use('/api/bookings', require('./routes/bookings'));

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
});
