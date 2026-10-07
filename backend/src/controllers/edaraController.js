import zkService from '../services/zkService.js';
import edaraService from '../services/edaraService.js';

/**
 * Preview attendance records formatted for Edara HR API
 */
export const previewEdaraPayload = async (req, res, next) => {
  try {
    const { userId, startDate, endDate, limit } = req.query;
    const logs = await zkService.getAttendances();
    let filteredLogs = Array.isArray(logs) ? logs : [];

    if (userId) {
      filteredLogs = filteredLogs.filter(log => String(log.deviceUserId || log.userSn) === String(userId));
    }
    if (startDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.recordTime) >= new Date(startDate));
    }
    if (endDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.recordTime) <= new Date(`${endDate}T23:59:59`));
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(0, parseInt(limit, 10));
    }

    const formattedRecords = edaraService.formatRecords(filteredLogs);

    res.status(200).json({
      success: true,
      count: formattedRecords.length,
      targetEndpoint: edaraService.apiUrl,
      data: {
        records: formattedRecords
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to preview Edara HR payload',
      error: error.message || error
    });
  }
};

/**
 * Send attendance records directly from ZK MB2000 to Edara HR API
 */
export const syncToEdara = async (req, res, next) => {
  try {
    const { records, userId, startDate, endDate, apiKey, apiUrl } = req.body;
    let recordsToSend = records;

    // If records array was not provided directly in body, fetch from MB2000 device
    if (!recordsToSend || !Array.isArray(recordsToSend) || recordsToSend.length === 0) {
      const logs = await zkService.getAttendances();
      let filteredLogs = Array.isArray(logs) ? logs : [];

      if (userId) {
        filteredLogs = filteredLogs.filter(log => String(log.deviceUserId || log.userSn) === String(userId));
      }
      if (startDate) {
        filteredLogs = filteredLogs.filter(log => new Date(log.recordTime) >= new Date(startDate));
      }
      if (endDate) {
        filteredLogs = filteredLogs.filter(log => new Date(log.recordTime) <= new Date(`${endDate}T23:59:59`));
      }

      recordsToSend = edaraService.formatRecords(filteredLogs);
    }

    if (recordsToSend.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No attendance records found to synchronize.'
      });
    }

    const result = await edaraService.syncAttendanceRecords(recordsToSend, apiKey, apiUrl);

    res.status(200).json({
      success: true,
      message: `Successfully synchronized ${recordsToSend.length} attendance records to Edara HR!`,
      syncedCount: recordsToSend.length,
      edaraResponse: result
    });
  } catch (error) {
    console.error('Edara Sync Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to sync attendance records to Edara HR',
      error: error.data || error
    });
  }
};
