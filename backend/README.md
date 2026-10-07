# ZKTeco MB2000 Integration API Backend

REST API server built in Node.js / Express to connect and interact with the **ZKTeco MB2000** Time Attendance & Access Control machine.

---

## ⚙️ Configuration

Check or edit [backend/.env](file:///c:/CurrentProjects/ZK%20-%20Integration/backend/.env):

```env
PORT=5000
ZK_IP=192.168.1.147
ZK_PORT=4370
ZK_TIMEOUT=10000
ZK_IN_PORT=5200
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the API Server
```bash
# Production start
npm start

# Development (auto-reload on changes)
npm run dev
```

---

## 📡 API Endpoints

### 1. **Device Status & Info**
- **`GET /api/zk/status`**
- Returns connection status, serial number, firmware version, and device time.

### 2. **Get Users**
- **`GET /api/zk/users`**
- Returns all registered biometric users / user records on the MB2000 device.

### 3. **Get Attendance Logs**
- **`GET /api/zk/attendances`**
- Query parameters (optional):
  - `userId`: Filter logs for a specific user ID (e.g. `?userId=101`)
  - `startDate`: Filter logs from ISO date (e.g. `?startDate=2026-01-01`)
  - `endDate`: Filter logs up to ISO date (e.g. `?endDate=2026-09-16`)

### 4. **Synchronize Device Time**
- **`POST /api/zk/sync-time`**
- Body (optional):
  ```json
  {
    "time": "2026-09-16T14:30:00Z"
  }
  ```
  *(If omitted, syncs with current server time)*

### 5. **Clear Attendance Logs**
- **`POST /api/zk/clear-logs`**
- Body:
  ```json
  {
    "confirm": true
  }
  ```

### 6. **Restart Device**
- **`POST /api/zk/restart`**

### 7. **Unlock Door Relay**
- **`POST /api/zk/unlock`**
- Body (optional):
  ```json
  {
    "seconds": 5
  }
  ```
