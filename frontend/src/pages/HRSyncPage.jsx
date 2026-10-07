import React, { useState, useMemo } from 'react';
import { 
  Send, 
  CloudUpload, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Calendar, 
  Eye, 
  ShieldCheck, 
  Code2,
  Clock,
  Building2,
  Lock
} from 'lucide-react';
import { syncToEdaraHR } from '../services/api';
import { useTranslation } from '../context/LanguageContext';

export default function HRSyncPage({ users, attendances }) {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState('all');
  const [startDate, setStartDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState('');
  const [recordTypeDefault, setRecordTypeDefault] = useState('unknown');

  const [apiUrl, setApiUrl] = useState('https://ysqqnkbgkrjoxrzlejxy.supabase.co/functions/v1/api-zk-attendance');
  const [apiKey, setApiKey] = useState('ek_fgo0f5l1ah4vzda6mbxgezhwu90iznmm');
  const [showConfig, setShowConfig] = useState(false);

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [activeView, setActiveView] = useState('table');

  const usersMap = useMemo(() => {
    const map = {};
    users.forEach(u => {
      map[String(u.userId)] = u.name || `${t('employee')} #${u.userId}`;
    });
    return map;
  }, [users, t]);

  const preparedRecords = useMemo(() => {
    return attendances
      .filter(log => {
        const uId = String(log.deviceUserId || log.userSn || '');
        const matchesUser = selectedUser === 'all' || uId === selectedUser;

        let matchesDate = true;
        if (startDate) {
          matchesDate = matchesDate && new Date(log.recordTime) >= new Date(startDate);
        }
        if (endDate) {
          matchesDate = matchesDate && new Date(log.recordTime) <= new Date(`${endDate}T23:59:59`);
        }

        return matchesUser && matchesDate;
      })
      .map(log => {
        const d = new Date(log.recordTime);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return {
          employee_code: String(log.deviceUserId || log.userSn || ''),
          date: `${year}-${month}-${day}`,
          time: `${hours}:${minutes}:${seconds}`,
          record_type: recordTypeDefault
        };
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [attendances, selectedUser, startDate, endDate, recordTypeDefault]);

  const handleSendToEdara = async () => {
    if (preparedRecords.length === 0) {
      alert(t('noRecordsDateRange'));
      return;
    }

    if (!window.confirm(t('pushToEdara').replace('{count}', preparedRecords.length) + '?')) {
      return;
    }

    setSyncing(true);
    setSyncResult(null);

    try {
      const response = await syncToEdaraHR({
        records: preparedRecords,
        apiUrl: apiUrl,
        apiKey: apiKey
      });

      setSyncResult({
        success: true,
        message: response.message || t('pushToEdara').replace('{count}', preparedRecords.length) + ' ✅',
        details: response
      });
    } catch (error) {
      setSyncResult({
        success: false,
        message: error.message || 'Error syncing to Edara',
        details: error
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building2 size={24} color="#6366f1" />
            <h1 className="page-title">{t('edaraTitle')}</h1>
          </div>
          <p className="page-subtitle">{t('edaraSubtitle')}</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Lock size={15} />
            <span>{showConfig ? t('hideConfig') : t('apiCredentials')}</span>
          </button>

          <button 
            className="btn btn-primary"
            onClick={handleSendToEdara}
            disabled={syncing || preparedRecords.length === 0}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
          >
            <Send size={16} className={syncing ? 'spinner' : ''} />
            <span>{syncing ? t('transmitting') : t('pushToEdara').replace('{count}', preparedRecords.length)}</span>
          </button>
        </div>
      </div>

      {/* Automated Cron Schedule Banner */}
      <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.08))', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#ffffff' }}>
                {t('autoCronActive')}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {t('autoCronDesc')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-punch" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              {t('schedule11AM')}
            </span>
            <span className="badge badge-punch" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              {t('schedule08PM')}
            </span>
          </div>
        </div>
      </div>

      {/* Sync Result Banner */}
      {syncResult && (
        <div 
          style={{ 
            padding: 16, 
            borderRadius: 'var(--radius-md)', 
            marginBottom: 20, 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 12,
            background: syncResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${syncResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            color: syncResult.success ? '#34d399' : '#fb7185'
          }}
        >
          {syncResult.success ? <CheckCircle2 size={22} style={{ flexShrink: 0, marginTop: 2 }} /> : <AlertTriangle size={22} style={{ flexShrink: 0, marginTop: 2 }} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{syncResult.message}</div>
            {syncResult.details?.edaraResponse && (
              <pre className="mono" style={{ marginTop: 8, fontSize: '0.78rem', background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 6, overflowX: 'auto', color: '#f8fafc' }}>
                {JSON.stringify(syncResult.details.edaraResponse, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* API Configuration Drawer */}
      {showConfig && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(99, 102, 241, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontWeight: 700 }}>
            <ShieldCheck size={18} color="#6366f1" />
            <span>{t('apiCredentials')}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                {t('endpointLabel')}
              </label>
              <input 
                type="text"
                className="input mono"
                style={{ width: '100%', fontSize: '0.82rem' }}
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                {t('authKeyLabel')}
              </label>
              <input 
                type="password"
                className="input mono"
                style={{ width: '100%', fontSize: '0.82rem' }}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter & Preparation Toolbar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="toolbar" style={{ margin: 0 }}>
          <div className="filter-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={16} color="#6366f1" />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('from')}</span>
              <input 
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('to')}</span>
              <input 
                type="date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <select 
              className="input"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="all">{t('allStaff')} ({Object.keys(usersMap).length})</option>
              {Object.entries(usersMap).map(([id, name]) => (
                <option key={id} value={id}>
                  {name} ({t('userId')}: {id})
                </option>
              ))}
            </select>

            <select 
              className="input"
              value={recordTypeDefault}
              onChange={(e) => setRecordTypeDefault(e.target.value)}
            >
              <option value="unknown">{t('typeUnknown')}</option>
              <option value="entry">{t('typeEntry')}</option>
              <option value="exit">{t('typeExit')}</option>
            </select>

            {(startDate || endDate) && (
              <button className="btn btn-secondary" onClick={() => { setStartDate(''); setEndDate(''); }}>
                {t('clearDates')}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              className={`btn ${activeView === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveView('table')}
            >
              <Eye size={15} />
              <span>{t('gridView')}</span>
            </button>

            <button 
              className={`btn ${activeView === 'json' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveView('json')}
            >
              <Code2 size={15} />
              <span>{t('jsonPayload')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payload Preview */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CloudUpload size={18} color="#10b981" />
            <span>{t('preparedBatch').replace('{count}', preparedRecords.length)}</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {t('specNote')}
          </div>
        </div>

        {preparedRecords.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle size={40} color="#f59e0b" />
            <h3>{t('noRecordsDateRange')}</h3>
            <p>{t('noRecordsDateDesc')}</p>
          </div>
        ) : activeView === 'table' ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>employee_code</th>
                  <th>{t('employeeName')}</th>
                  <th>{t('punchDate')} (YYYY-MM-DD)</th>
                  <th>{t('punchTime')} (HH:MM:SS)</th>
                  <th>record_type</th>
                  <th>{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {preparedRecords.map((r, idx) => {
                  const employeeName = usersMap[r.employee_code] || 'Unassigned';
                  return (
                    <tr key={idx}>
                      <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                      <td>
                        <span className="badge badge-punch mono">
                          {r.employee_code}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{employeeName}</td>
                      <td className="mono" style={{ color: 'var(--text-secondary)' }}>{r.date}</td>
                      <td className="mono" style={{ color: '#22d3ee', fontWeight: 600 }}>{r.time}</td>
                      <td>
                        <span className="badge badge-user mono">
                          {r.record_type}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={13} /> {t('edaraReady')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <pre 
            className="mono" 
            style={{ 
              background: 'rgba(15, 23, 42, 0.85)', 
              padding: 18, 
              borderRadius: 'var(--radius-md)', 
              fontSize: '0.82rem', 
              color: '#38bdf8', 
              maxHeight: 500, 
              overflowY: 'auto',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {JSON.stringify({ records: preparedRecords }, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
