import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import compression from 'compression';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';

// Database and configurations
import connectDB from './db/db.js';
import { setupSocket } from './config/socketConfig.js';
import { predefinedIssues } from './data/issues.js';

import adminRoutes from './routes/adminRoutes.js';
// Routes
import userRoutes from './routes/userRoutes.js';
import manufacturerRoutes from './routes/manufacturerRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import issueRoutes from './routes/issueRoute.js';
import chatRoutes from './routes/chatRoutes.js';
import career from './routes/careerRoutes/careerRoutes.js';
import registerIndividual  from './routes/careerRoutes/registration.js';
import organizationRoutes from './routes/careerRoutes/organizationRoutes.js';
import postRoutes from './routes/postRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || 
           ['http://localhost:5173', 'http://localhost:5174',],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store online users
const onlineUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // User joins with their details
  socket.on('user-join', (userData) => {
    const { userId, userType, userName } = userData;
    
    onlineUsers.set(socket.id, {
      userId,
      userType,
      userName,
      socketId: socket.id
    });
    console.log(`${userName} (${userType}) joined`);
    
    // Broadcast online users count
    io.emit('online-users-count', onlineUsers.size);
  });
  
  // Join specific chat room
  socket.on('join-chat', (chatRoomId) => {
    socket.join(chatRoomId);
    console.log(`Socket ${socket.id} joined chat room: ${chatRoomId}`);
  });
  
  // Leave chat room
  socket.on('leave-chat', (chatRoomId) => {
    socket.leave(chatRoomId);
    console.log(`Socket ${socket.id} left chat room: ${chatRoomId}`);
  });
  
  // Handle typing indicators
  socket.on('typing-start', (data) => {
    socket.to(data.chatRoomId).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
      isTyping: true
    });
  });
  
  socket.on('typing-stop', (data) => {
    socket.to(data.chatRoomId).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
      isTyping: false
    });
  });
  
  // Handle message read receipts
  socket.on('message-read', (data) => {
    socket.to(data.chatRoomId).emit('message-read-receipt', {
      messageId: data.messageId,
      readBy: data.userId
    });
  });
  
  // Handle new message broadcast
  socket.on('new-message', (data) => {
    socket.to(data.chatRoomId).emit('message-received', data);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      console.log(`${user.userName} (${user.userType}) disconnected`);
      onlineUsers.delete(socket.id);
      
      // Broadcast updated online users count
      io.emit('online-users-count', onlineUsers.size);
    }
  });
});

// Make io accessible throughout the app
app.set('io', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Security Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

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



// Body parser middleware
app.use(express.json({ limit: '10mb' })); // Increased for chat images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Security middleware
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Create uploads directory for chat images
const uploadDir = './uploads/chat-images';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    onlineUsers: onlineUsers.size
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/manufacturers', manufacturerRoutes);
app.use('/api/admin', adminRoutes);   
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/careers', career);
app.use('/api/registration', registerIndividual );
app.use('/api/organizations', organizationRoutes);
app.use('/api', postRoutes);

// Simple chatbot endpoint for predefined issues
app.post('/api/chatbot', (req, res) => {
  const { userInput } = req.body;
  
  if (!userInput) {
    return res.status(400).json({
      status: 'error',
      message: 'User input is required'
    });
  }

  app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
  
  // Simple matching algorithm - can be enhanced with fuzzy search
  const matchedIssue = predefinedIssues.find(item => 
    item.issue.toLowerCase().includes(userInput.toLowerCase())
  );
  
  if (matchedIssue) {
    res.json({ 
      status: 'success',
      response: matchedIssue.response 
    });
  } else {
    res.json({ 
      status: 'success',
      response: "I'm sorry, I couldn't find a matching solution. Please try rephrasing or contact support for further assistance."
    });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Don't log stack trace in production
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }
  
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404 - Route not found
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Connect to Database
connectDB();

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 Socket.IO server is ready for connections`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close(() => {
    console.log('💤 HTTP server closed.');
    
    // Close database connection
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥');
  console.error('Error:', err.name, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }
  gracefulShutdown('UNHANDLED REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error('Error:', err.name, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }
  process.exit(1);
});

// Handle process termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Export for testing
export { app, io, server };
export default app;