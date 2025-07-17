import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import compression from 'compression';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './db/db.js';
import { setupSocket } from './config/socketConfig.js';
import { predefinedIssues } from './data/issues.js';

import userRoutes from './routes/userRoutes.js';
import manufacturerRoutes from './routes/manufacturerRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Load env vars
dotenv.config();

const app = express();
// After creating the server
const server = createServer(app);
const io = setupSocket(server);
app.set('io', io);

// Setup Socket.io
// const io = setupSocket(server);

// Security Middleware
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiter to API routes
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Request timeout
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).send('Request Timeout');
  });
  next();
});

// Security middleware
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/manufacturers', manufacturerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

app.post('/api/chat', (req, res) => {
  const { userInput } = req.body;
  
  // Simple matching algorithm - can be enhanced with fuzzy search
  const matchedIssue = predefinedIssues.find(item => 
    item.issue.toLowerCase().includes(userInput.toLowerCase())
  );
  
  if (matchedIssue) {
    res.json({ response: matchedIssue.response });
  } else {
    res.json({ 
      response: "I'm sorry, I couldn't find a matching solution. Please try rephrasing or contact support."
    });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Connect to Database
connectDB();

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

export default app;