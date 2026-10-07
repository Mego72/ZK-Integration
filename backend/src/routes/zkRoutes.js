import express from 'express';
import {
  getStatus,
  getUsers,
  getAttendances,
  clearLogs,
  enableDevice,
  disableDevice,
  syncTime,
  restartDevice,
  executeCommand
} from '../controllers/zkController.js';
import {
  previewEdaraPayload,
  syncToEdara
} from '../controllers/edaraController.js';
import schedulerService from '../services/schedulerService.js';

const router = express.Router();

// Device information and connection status
router.get('/status', getStatus);

// User management
router.get('/users', getUsers);

// Attendance logs
router.get('/attendances', getAttendances);

// Edara HR Integration Endpoints
router.get('/edara/preview', previewEdaraPayload);
router.post('/edara/sync', syncToEdara);
router.get('/edara/scheduler-status', (req, res) => {
  res.json({
    success: true,
    data: schedulerService.getSchedulerStatus()
  });
});
router.post('/edara/scheduler-trigger', async (req, res) => {
  const result = await schedulerService.runAutoSync('Manual Web Trigger');
  res.json(result);
});

// Maintenance & Control
router.post('/sync-time', syncTime);
router.post('/restart', restartDevice);
router.post('/clear-logs', clearLogs);
router.post('/enable', enableDevice);
router.post('/disable', disableDevice);
router.post('/execute-command', executeCommand);

export default router;

