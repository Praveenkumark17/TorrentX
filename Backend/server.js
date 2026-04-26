import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { torrentRoutes, initTorrents } from './routes/torrentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { getAllTorrents } from './controllers/torrentController.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow if origin matches FRONTEND_URL or if it's development/null
      const frontend = process.env.FRONTEND_URL;
      if (!origin || origin === frontend || frontend === "*" || origin.includes('devtunnels.ms')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

global.io = io;

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'Torrentx'
})
  .then(() => {
    console.log('Connected to MongoDB');
    initTorrents(io);
  })
  .catch((err) => console.error('Could not connect to MongoDB:', err));

app.use(cors({
  origin: (origin, callback) => {
    const frontend = process.env.FRONTEND_URL;
    if (!origin || origin === frontend || frontend === "*" || origin.includes('devtunnels.ms')) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback to true for development
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/torrent', torrentRoutes(io));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', async (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
      const userTorrents = await getAllTorrents(userId);
      socket.emit('initial_state', userTorrents);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
