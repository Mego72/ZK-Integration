import React from 'react';
import { Fingerprint, RefreshCw, Radio, HardDrive } from 'lucide-react';

export default function Navbar({ statusData, loading, onRefresh }) {
  const isOnline = statusData?.success && statusData?.data?.status === 'online';
  const ip = statusData?.data?.ip || '192.168.1.147';
  const port = statusData?.data?.port || '4370';

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon-wrapper">
          <Fingerprint size={26} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="brand-title">ZKTeco MB2000</h1>
          <div className="brand-subtitle">
            <Radio size={13} color="#06b6d4" />
            <span>Biometric Attendance Station</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span className="mono">{ip}:{port}</span>
          </div>
        </div>
      </div>

      <div className="nav-actions">
        <div className={`status-pill ${isOnline ? 'online' : 'offline'}`}>
          <span className="beacon-dot" />
          <span>{isOnline ? 'Device Connected (TCP)' : 'Device Disconnected'}</span>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={onRefresh} 
          disabled={loading}
          title="Refresh Device Data"
        >
          <RefreshCw size={16} className={loading ? 'spinner' : ''} />
          <span>{loading ? 'Syncing...' : 'Sync'}</span>
        </button>
      </div>
    </header>
  );
}
