
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
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import connectDB from './db/db.js';
import Razorpay from 'razorpay';

import userRoutes from './routes/userRoutes.js';
import manufacturerRoutes from './routes/manufacturerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import issueRoutes from './routes/issueRoute.js';
import chatRoutes from './routes/chatRoutes.js';
import careerRoutes from './routes/careerRoutes/careerRoutes.js';
import registrationRoutes from './routes/careerRoutes/registration.js';
import organizationRoutes from './routes/careerRoutes/organizationRoutes.js';
import postRoutes from './routes/postRoutes.js';
// Import cargo routes
import companyRoutes from './routes/cargo/companyRoutes.js';
import shipmentRoutes from './routes/cargo/shipmentRoutes.js';
import quoteRoutes from './routes/cargo/quoteRoutes.js';
import cargoAdminRoutes from './routes/cargo/cargoAdminRoutes.js';
import cargoPaymentRoutes from './routes/cargo/cargoPaymentRoutes.js';
import loanProviderRoutes from './routes/cargo/loanProviderRoutes.js';

// import finance routes
import financeRoutes from './routes/finance/financeRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

global.razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || 
           ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('user-join', (userData) => {
    const { userId, userType, userName } = userData;
    onlineUsers.set(socket.id, { userId, userType, userName, socketId: socket.id });
    console.log(`${userName} (${userType}) joined`);
    io.emit('online-users-count', onlineUsers.size);
  });
  
  socket.on('join-chat', (chatRoomId) => {
    socket.join(chatRoomId);
    console.log(`Socket ${socket.id} joined chat room: ${chatRoomId}`);
  });
  
  socket.on('leave-chat', (chatRoomId) => {
    socket.leave(chatRoomId);
    console.log(`Socket ${socket.id} left chat room: ${chatRoomId}`);
  });
  
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
  
  socket.on('message-read', (data) => {
    socket.to(data.chatRoomId).emit('message-read-receipt', {
      messageId: data.messageId,
      readBy: data.userId
    });
  });
  
  socket.on('new-message', (data) => {
    socket.to(data.chatRoomId).emit('message-received', data);
  });
  
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      console.log(`${user.userName} (${user.userType}) disconnected`);
      onlineUsers.delete(socket.id);
      io.emit('online-users-count', onlineUsers.size);
    }
  });
});

app.set('io', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

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

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(
  cors({
    origin: function(origin, callback) {
      // Development mein sab allow
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      // Production mein sirf allowed origins
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS blocked'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

const uploadDir = './uploads/chat-images';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    onlineUsers: onlineUsers.size,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/users', userRoutes);
app.use('/api/manufacturers', manufacturerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/cargo/companies', companyRoutes);
app.use('/api/cargo/shipments', shipmentRoutes);
app.use('/api/cargo/quotes', quoteRoutes);
app.use('/api/cargo/payments', cargoPaymentRoutes);
app.use('/api/cargo/admin', cargoAdminRoutes);
app.use('/api/cargo/loan-providers', loanProviderRoutes);
app.use('/api/finance', financeRoutes);


app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }
  
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

connectDB();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION!');
  console.error('Error:', err.name, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }
  gracefulShutdown('UNHANDLED REJECTION');
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', err.name, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }
  process.exit(1);
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { app, io, server };
export default app;