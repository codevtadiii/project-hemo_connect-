import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import bloodRequestRoutes from './routes/blood-requests.js';
import donorBloodRoutes from './routes/donor-blood.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import collectionRoutes from './routes/collections.js';
import dynamicModelRoutes from './routes/dynamic-models.js';
import { authenticateSocket } from './middleware/auth.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blood-requests', bloodRequestRoutes);
app.use('/api/donor-blood', donorBloodRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/dynamic-models', dynamicModelRoutes);
import notificationRoutes from './routes/notifications.js';
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// MongoDB Connection
const connectDB = async () => {
  try {
  await mongoose.connect('mongodb://localhost:27017/sai_new');
    console.log('Database connected successfully');
    await ensureCollections();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Ensure required collections exist using the collection manager
const ensureCollections = async () => {
  const { createMultipleCollections } = await import('./utils/collectionManager.js');
  const required = [
    'users', 
    'bloodrequests', 
    'notifications', 
    'contacts',
    'contactmessages',
    'donorblood'
  ];
  
  try {
    const results = await createMultipleCollections(required);
    const successCount = Object.values(results).filter(r => r.success).length;
    console.log(`✅ Ensured ${successCount}/${required.length} required collections exist`);
  } catch (error) {
    console.warn('Could not ensure all required collections:', error?.message || error);
  }
};

// Socket.IO Connection
io.use(authenticateSocket);
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
  
  // Join user to their personal room for notifications
  socket.join(`user_${socket.userId}`);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Make io available to routes
app.set('io', io);

export default app;