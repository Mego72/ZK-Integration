import zkService from '../services/zkService.js';

export const getStatus = async (req, res, next) => {
  try {
    const info = await zkService.getDeviceInfo();
    res.status(200).json({
      success: true,
      message: 'Connected to ZKTeco MB2000 successfully',
      data: info
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: `Failed to connect to ZKTeco device at ${zkService.ip}:${zkService.port}`,
      error: error.message || error
    });
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await zkService.getUsers();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users from device',
      error: error.message || error
    });
  }
};

export const getAttendances = async (req, res, next) => {
  try {
    const logs = await zkService.getAttendances();
    const { userId, startDate, endDate } = req.query;

    let filteredLogs = Array.isArray(logs) ? logs : [];

    if (userId) {
      filteredLogs = filteredLogs.filter(log => String(log.deviceUserId || log.userSn || log.userId) === String(userId));
    }

    if (startDate) {
      const start = new Date(startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.recordTime) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.recordTime) <= end);
    }

    res.status(200).json({
      success: true,
      totalDeviceLogs: Array.isArray(logs) ? logs.length : 0,
      count: filteredLogs.length,
      data: filteredLogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance logs from device',
      error: error.message || error
    });
  }
};


export const clearLogs = async (req, res, next) => {
  try {
    const { confirm } = req.body;
    if (confirm !== true && confirm !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'Explicit confirmation required. Send { "confirm": true } in request body.'
      });
    }

    const result = await zkService.clearAttendanceLogs();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear attendance logs from device',
      error: error.message || error
    });
  }
};

export const disableDevice = async (req, res, next) => {
  try {
    const result = await zkService.disableDevice();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to disable device',
      error: error.message || error
    });
  }
};

export const enableDevice = async (req, res, next) => {
  try {
    const result = await zkService.enableDevice();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to enable device',
      error: error.message || error
    });
  }
};

export const syncTime = async (req, res, next) => {
  try {
    const customTime = req.body.time ? new Date(req.body.time) : new Date();
    const result = await zkService.setTime(customTime);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to synchronize device time',
      error: error.message || error
    });
  }
};

export const restartDevice = async (req, res, next) => {
  try {
    const result = await zkService.restartDevice();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to restart device',
      error: error.message || error
    });
  }
};

export const executeCommand = async (req, res, next) => {
  try {
    const { commandId, data } = req.body;
    if (commandId === undefined) {
      return res.status(400).json({
        success: false,
        message: 'commandId is required in request body (e.g. 1004 for restart, 31 for unlock)'
      });
    }
    const result = await zkService.executeCustomCommand(Number(commandId), data || '');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to execute command on device',
      error: error.message || error
    });
  }
};
