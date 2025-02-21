import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
// import taskRoutes from './routes/taskRoutes.js';
// import emailRoutes from './routes/emailRoutes.js';
import { logger , stream } from './utils/logger.js';
import { checkDatabaseHealth } from './config/arango.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Health Check Endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  const systemHealth = {
    status: 'healthy',
    timestamp: new Date(),
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: dbHealth,
    memory: {
      used: process.memoryUsage().heapUsed / 1024 / 1024,
      total: process.memoryUsage().heapTotal / 1024 / 1024,
      unit: 'MB'
    }
  };

  const isHealthy = dbHealth.status === 'healthy';
  res.status(isHealthy ? 200 : 503).json(systemHealth);
});

// API Documentation
app.get('/api-docs', (req, res) => {
  res.json({
    version: process.env.npm_package_version,
    endpoints: {
      '/health': 'Health check endpoint',
      '/api/tasks': 'Task management endpoints',
      '/api/emails': 'Email management endpoints'
    }
  });
});

// Routes
// app.use('/api/tasks', taskRoutes);
// app.use('/api/emails', emailRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

export default app;