import cron from 'node-cron';
import zkService from './zkService.js';
import edaraService from './edaraService.js';

class SchedulerService {
  constructor() {
    this.jobs = [];
    this.lastSync = null;
    this.lastStatus = 'Idle';
    this.lastCount = 0;
  }

  /**
   * Run automated sync job from MB2000 to Edara HR
   */
  async runAutoSync(triggerSource = 'Scheduled Job') {
    const timestamp = new Date().toLocaleString();
    console.log(`\n⏰ [CRON] ${triggerSource} triggered at ${timestamp}`);

    try {
      this.lastStatus = `Syncing (${triggerSource})...`;
      
      // 1. Fetch latest attendance punches from ZKTeco MB2000
      const logs = await zkService.getAttendances();
      const records = Array.isArray(logs) ? logs : [];

      if (records.length === 0) {
        console.log(`ℹ️ [CRON] No attendance records found on MB2000.`);
        this.lastStatus = `Completed: 0 records found`;
        this.lastSync = new Date().toISOString();
        return { success: true, count: 0 };
      }

      // 2. Format to Edara HR schema
      const edaraFormatted = edaraService.formatRecords(records);

      // 3. Dispatch to Edara Cloud HR API
      const result = await edaraService.syncAttendanceRecords(edaraFormatted);

      this.lastSync = new Date().toISOString();
      this.lastStatus = `Success: Synced ${edaraFormatted.length} records`;
      this.lastCount = edaraFormatted.length;

      console.log(`✅ [CRON] Auto-sync SUCCESS! Sent ${edaraFormatted.length} punches to Edara HR.`);
      console.log(`📄 Response:`, JSON.stringify(result));

      return {
        success: true,
        count: edaraFormatted.length,
        result
      };
    } catch (error) {
      this.lastStatus = `Failed: ${error.message || 'Error'}`;
      console.error(`❌ [CRON] Auto-sync FAILED:`, error.message || error);
      return {
        success: false,
        error: error.message || error
      };
    }
  }

  /**
   * Initialize daily scheduled cron tasks
   * Schedules:
   * 1. 11:00 AM every day ('0 11 * * *')
   * 2. 08:00 PM every day ('0 20 * * *')
   */
  initScheduler() {
    console.log('⏳ Initializing Edara HR Auto-Sync Scheduler...');

    // 11:00 AM Cron
    const job11AM = cron.schedule('0 11 * * *', () => {
      this.runAutoSync('Daily 11:00 AM Schedule');
    });

    // 08:00 PM Cron (20:00)
    const job08PM = cron.schedule('0 20 * * *', () => {
      this.runAutoSync('Daily 08:00 PM Schedule');
    });

    this.jobs.push({ name: '11:00 AM Job', expression: '0 11 * * *', job: job11AM });
    this.jobs.push({ name: '08:00 PM Job', expression: '0 20 * * *', job: job08PM });

    console.log('✅ Scheduler active:');
    console.log('   - 🕒 Job 1: Every day at 11:00 AM (0 11 * * *)');
    console.log('   - 🕒 Job 2: Every day at 08:00 PM (0 20 * * *)');
  }

  getSchedulerStatus() {
    return {
      activeSchedules: [
        { time: '11:00 AM Daily', cron: '0 11 * * *' },
        { time: '08:00 PM Daily', cron: '0 20 * * *' }
      ],
      lastSync: this.lastSync,
      lastStatus: this.lastStatus,
      lastCount: this.lastCount
    };
  }
}

export const schedulerService = new SchedulerService();
export default schedulerService;
