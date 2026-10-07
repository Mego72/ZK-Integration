# ZKTeco MB2000 Full Attendance & Management System
# نظام إدارة الحضور والانصراف لماكينة ZKTeco MB2000

Full-stack enterprise application to integrate with **ZKTeco MB2000** biometric time attendance devices over TCP (port 4370) and automatically sync punch logs to **Edara Cloud HR (شؤون الموظفين - أدارة)**.

---

## 🌟 Key Features

- **Biometric Socket Communication**: Direct TCP socket link to ZKTeco MB2000 (`node-zklib`).
- **Automated Background Sync**: Dual-schedule automated sync (`node-cron`) to Edara HR API at **11:00 AM** and **08:00 PM** daily.
- **Bilingual Interface**: Full **Arabic (العربية)** and **English** support with complete RTL layout adaptation and Cairo Arabic typography.
- **Executive Dashboard**: Real-time presence indicators, punch distribution, and live transaction ledger.
- **Daily Attendance Matrix**: Automatic **First-In (Arrival)** and **Last-Out (Departure)** shift pairing with work hours duration.
- **Employees Directory**: Full staff profiles, biometric enrollment IDs, card numbers, and roles.
- **Raw Transaction Ledger**: Searchable, filterable log records with date range filters and UTF-8 CSV exports.
- **Timesheet Reports**: Monthly aggregated work hours, average hours/day, and missing punch analytics.
- **Device Management**: Hardware time synchronization, reboot triggers, and terminal lock controls.

---

## 🏗️ Project Architecture

```
ZK - Integration/
├── backend/                  # Express.js REST API & ZK Socket Services
│   ├── src/
│   │   ├── controllers/      # Route controllers (ZK & Edara)
│   │   ├── routes/           # Express API endpoints
│   │   ├── services/         # ZKLib service, Edara API client, Cron scheduler
│   │   └── server.js         # Server entry point & Static SPA server
│   ├── .env.example          # Environment variables template
│   └── package.json
├── frontend/                 # React + Vite Bilingual Dashboard
│   ├── src/
│   │   ├── components/       # Layout, Navbar, Sidebar, UI Cards
│   │   ├── context/          # LanguageContext (AR/EN & RTL toggle)
│   │   ├── locales/          # Bilingual translation dictionaries
│   │   ├── pages/            # Dashboard, Daily, Staff, Logs, Reports, Device, Edara
│   │   └── services/         # Frontend API client
│   ├── dist/                 # Production compiled assets
│   └── package.json
├── START_SERVER.bat          # 1-Click Windows production launcher
├── DEPLOYMENT_GUIDE.md       # Windows Server deployment instructions
└── README.md
```

---

## 🚀 Quick Start (Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- ZKTeco MB2000 reachable on network (`192.168.1.147:4370`)

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 📦 Production Deployment

To run both Frontend and Backend on a single port (**5000**):

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Run unified backend
cd ../backend
npm start
```
Access the application at **`http://localhost:5000`** (or `http://YOUR_SERVER_IP:5000`).
