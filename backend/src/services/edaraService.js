import dotenv from 'dotenv';

dotenv.config();

class EdaraService {
  constructor() {
    this.apiUrl = process.env.EDARA_API_URL || 'https://ysqqnkbgkrjoxrzlejxy.supabase.co/functions/v1/api-zk-attendance';
    this.apiKey = process.env.EDARA_API_KEY || 'ek_fgo0f5l1ah4vzda6mbxgezhwu90iznmm';
  }

  /**
   * Format ZKTeco logs into Edara HR Attendance payload
   * Specification:
   * records: [
   *   {
   *     employee_code: string,
   *     date: "YYYY-MM-DD",
   *     time: "HH:MM:SS" or "HH:MM",
   *     record_type: "entry" | "exit" | "unknown"
   *   }
   * ]
   */
  formatRecords(logs, usersMap = {}) {
    return logs.map((log) => {
      const d = new Date(log.recordTime);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');

      const dateStr = `${year}-${month}-${day}`;
      const timeStr = `${hours}:${minutes}:${seconds}`;
      const employeeCode = String(log.deviceUserId || log.userSn || '');

      return {
        employee_code: employeeCode,
        date: dateStr,
        time: timeStr,
        record_type: log.record_type || 'unknown'
      };
    });
  }

  /**
   * Sync attendance records to Edara HR API
   */
  async syncAttendanceRecords(records, customApiKey = null, customUrl = null) {
    const targetUrl = customUrl || this.apiUrl;
    const key = customApiKey || this.apiKey;

    const payload = {
      records: records
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': key,
      'x-api-key': key
    };

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        message: responseData.message || responseData.error || `Edara API responded with status ${response.status}`
      };
    }

    return responseData;
  }
}

export const edaraService = new EdaraService();
export default edaraService;
