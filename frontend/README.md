# ZKTeco MB2000 Dashboard Frontend

Modern web dashboard built with **React + Vite** to visualize and manage attendance data from the **ZKTeco MB2000** device.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run the Development Server
Make sure the backend is running on `http://localhost:5000`, then start the frontend:
```bash
npm run dev
```

The frontend will start at **`http://localhost:5173`**.

---

## ✨ Features

- **Real-Time Machine Status**: Live connection beacon with IP `192.168.1.147` on port `4370`.
- **Attendance Records Table**:
  - Filter by Employee / User ID.
  - Filter by date.
  - Full-text search by name.
  - Export filtered attendance logs to **CSV**.
- **Enrolled Users Directory**:
  - Employee cards with initials avatars.
  - Role badges (Device Admin vs Standard User).
  - One-click punch filtering by user card.
- **Diagnostics & Operations**:
  - Live device capacity and memory usage counters.
  - Enable / Disable terminal input.
  - Clear device logs with safety prompts.
