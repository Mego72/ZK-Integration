import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import zkRoutes from './routes/zkRoutes.js';
import schedulerService from './services/schedulerService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/zk', zkRoutes);

// Serve Frontend Static Production Assets
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// API Info Endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'ZKTeco MB2000 Integration API',
    version: '1.0.0',
    deviceTarget: `${process.env.ZK_IP || '192.168.1.147'}:${process.env.ZK_PORT || '4370'}`,
    scheduler: schedulerService.getSchedulerStatus(),
    endpoints: {
      status: 'GET /api/zk/status',
      users: 'GET /api/zk/users',
      attendances: 'GET /api/zk/attendances?userId=&startDate=&endDate=',
      edaraPreview: 'GET /api/zk/edara/preview',
      edaraSync: 'POST /api/zk/edara/sync',
      edaraSchedulerStatus: 'GET /api/zk/edara/scheduler-status',
      clearLogs: 'POST /api/zk/clear-logs',
      enable: 'POST /api/zk/enable',
      disable: 'POST /api/zk/disable',
      executeCommand: 'POST /api/zk/execute-command'
    }
  });
});

// Single Page Application (SPA) Fallback for Frontend Routing
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 ZKTeco MB2000 API Server running`);
  console.log(`📡 Local URL: http://localhost:${PORT}`);
  console.log(`📟 Target Device: ${process.env.ZK_IP || '192.168.1.147'}:${process.env.ZK_PORT || '4370'}`);
  console.log(`=========================================`);

  // Start automated cron jobs (11:00 AM and 08:00 PM)
  schedulerService.initScheduler();
});
