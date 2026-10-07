import ZKLib from 'node-zklib';
import dotenv from 'dotenv';

dotenv.config();

class ZKService {
  constructor() {
    this.ip = process.env.ZK_IP || '192.168.1.147';
    this.port = parseInt(process.env.ZK_PORT || '4370', 10);
    this.timeout = parseInt(process.env.ZK_TIMEOUT || '10000', 10);
    this.inPort = parseInt(process.env.ZK_IN_PORT || '5200', 10);
    this.zkInstance = null;
    this.isConnected = false;
  }

  /**
   * Helper to execute operations with safe connect/disconnect lifecycle
   */
  async executeWithDevice(operationCallback) {
    const zk = new ZKLib(this.ip, this.port, this.timeout, this.inPort);
    try {
      await zk.createSocket();
      const result = await operationCallback(zk);
      await zk.disconnect();
      return result;
    } catch (error) {
      try {
        await zk.disconnect();
      } catch (err) {
        // Ignore secondary disconnect error
      }
      throw error;
    }
  }

  /**
   * Test connection and retrieve device basic info
   */
  async getDeviceInfo() {
    return await this.executeWithDevice(async (zk) => {
      let info = {};
      try {
        info = await zk.getInfo();
      } catch (err) {
        info = { note: 'Extended info not available' };
      }

      return {
        ip: this.ip,
        port: this.port,
        connectionType: zk.connectionType,
        status: 'online',
        deviceInfo: info
      };
    });
  }

  /**
   * Get all registered users from device
   */
  async getUsers() {
    return await this.executeWithDevice(async (zk) => {
      const usersData = await zk.getUsers();
      return usersData.data || usersData;
    });
  }

  /**
   * Get attendance punch logs
   */
  async getAttendances() {
    return await this.executeWithDevice(async (zk) => {
      const attendancesData = await zk.getAttendances();
      const logs = attendancesData.data || attendancesData;
      return logs;
    });
  }

  /**
   * Clear all attendance records from device
   */
  async clearAttendanceLogs() {
    return await this.executeWithDevice(async (zk) => {
      await zk.clearAttendanceLog();
      return { success: true, message: 'Device attendance logs cleared successfully' };
    });
  }

  /**
   * Disable/Lock device inputs
   */
  async disableDevice() {
    return await this.executeWithDevice(async (zk) => {
      await zk.disableDevice();
      return { success: true, message: 'Device disabled' };
    });
  }

  /**
   * Enable device inputs
   */
  async enableDevice() {
    return await this.executeWithDevice(async (zk) => {
      await zk.enableDevice();
      return { success: true, message: 'Device enabled' };
    });
  }

  /**
   * Set device clock
   */
  async setTime(date = new Date()) {
    return await this.executeWithDevice(async (zk) => {
      // CMD_SET_TIME = 202
      // Time format: (year - 2000) * 12 * 31 + ((month - 1) * 31) + day - 1) * (24 * 60 * 60) + (hour * 60 + minute) * 60 + second
      const t = Math.floor(
        ((date.getFullYear() % 100) * 12 * 31 + date.getMonth() * 31 + date.getDate() - 1) * 86400 +
        date.getHours() * 3600 +
        date.getMinutes() * 60 +
        date.getSeconds()
      );
      const buf = Buffer.alloc(4);
      buf.writeUInt32LE(t, 0);
      await zk.executeCmd(202, buf);
      return { success: true, message: `Device clock set to ${date.toISOString()}` };
    });
  }

  /**
   * Restart device
   */
  async restartDevice() {
    return await this.executeWithDevice(async (zk) => {
      // CMD_RESTART = 1004
      await zk.executeCmd(1004, '');
      return { success: true, message: 'Device restarting...' };
    });
  }

  /**
   * Execute custom/raw command
   */
  async executeCustomCommand(commandId, data = '') {
    return await this.executeWithDevice(async (zk) => {
      const result = await zk.executeCmd(commandId, data);
      return { success: true, commandId, result };
    });
  }
}

export const zkService = new ZKService();
export default zkService;
