import React, { useState } from 'react';
import { Lock, Unlock, RefreshCw, AlertTriangle, CheckCircle, Terminal } from 'lucide-react';
import { enableDevice, disableDevice, clearAttendanceLogs, executeDeviceCommand } from '../services/api';

export default function DeviceControl({ statusData, onRefresh }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleAction = async (actionName, apiFn) => {
    try {
      setActionLoading(true);
      setFeedback(null);
      const res = await apiFn();
      setFeedback({ success: true, message: res.message || `${actionName} succeeded` });
      if (onRefresh) onRefresh();
    } catch (err) {
      setFeedback({ success: false, message: err.message || `${actionName} failed` });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to CLEAR all attendance punch logs from the MB2000 device? This action cannot be undone.')) {
      handleAction('Clear Logs', clearAttendanceLogs);
    }
  };

  return (
    <div className="card animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: 6, fontWeight: 700 }}>
        Device Diagnostics & Control
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>
        Direct operational triggers sent to ZKTeco MB2000 via TCP port 4370.
      </p>

      {feedback && (
        <div 
          style={{ 
            padding: 14, 
            borderRadius: 'var(--radius-md)', 
            marginBottom: 20, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10,
            background: feedback.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${feedback.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            color: feedback.success ? '#34d399' : '#fb7185'
          }}
        >
          {feedback.success ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{feedback.message}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: 18, borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Unlock size={16} color="#10b981" /> Enable Terminal
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 14 }}>
            Unlocks keypad and sensor for live punches.
          </p>
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%' }}
            disabled={actionLoading}
            onClick={() => handleAction('Enable Device', enableDevice)}
          >
            Enable Device
          </button>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: 18, borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={16} color="#f59e0b" /> Disable Terminal
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 14 }}>
            Temporarily pauses device punch verification.
          </p>
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%' }}
            disabled={actionLoading}
            onClick={() => handleAction('Disable Device', disableDevice)}
          >
            Disable Device
          </button>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: 18, borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, color: '#fb7185' }}>
            <AlertTriangle size={16} /> Purge Records
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 14 }}>
            Clear all attendance logs from the machine memory.
          </p>
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
            disabled={actionLoading}
            onClick={handleClearLogs}
          >
            Clear Device Logs
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
          <Terminal size={15} /> Device Parameters
        </div>
        <pre className="mono" style={{ fontSize: '0.82rem', color: '#38bdf8', overflowX: 'auto', margin: 0 }}>
          {JSON.stringify(statusData?.data || {}, null, 2)}
        </pre>
      </div>
    </div>
  );
}
