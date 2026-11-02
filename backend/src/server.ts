import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { initDatabase } from './db/index.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (config.nodeEnv !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'LankaLocate API',
    version: '1.0.0',
    dbType: config.dbType,
    time: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRouter);

// Serve built frontend if exists
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

// Start server after DB initialization
async function startServer() {
  try {
    await initDatabase();
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`=========================================`);
      console.log(`🇱🇰 LankaLocate Backend Server running!`);
      console.log(`📡 URL: http://localhost:${config.port}`);
      console.log(`🏥 Health: http://localhost:${config.port}/api/health`);
      console.log(`⚡ Mode: ${config.nodeEnv}`);
      console.log(`💾 Database: ${config.dbType}`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
