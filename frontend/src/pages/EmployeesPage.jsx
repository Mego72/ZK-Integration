import React, { useState } from 'react';
import { Search, Shield, User, CreditCard, Download, UserPlus, Filter } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export default function EmployeesPage({ users, attendances, onSelectEmployee }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Count punches per employee
  const punchCounts = {};
  attendances.forEach(a => {
    const id = String(a.deviceUserId);
    punchCounts[id] = (punchCounts[id] || 0) + 1;
  });

  const filteredUsers = users.filter(user => {
    const name = (user.name || '').toLowerCase();
    const id = String(user.userId || '');
    const card = String(user.cardno || '');
    const q = search.toLowerCase();
    const matchesSearch = name.includes(q) || id.includes(q) || card.includes(q);

    if (!matchesSearch) return false;
    if (roleFilter === 'admin') return user.role === 14;
    if (roleFilter === 'user') return user.role !== 14;
    return true;
  });

  const exportCSV = () => {
    const headers = [t('userId'), 'UID', t('employeeName'), t('status'), t('card'), t('totalPunchesCol')];
    const rows = filteredUsers.map(u => [
      u.userId,
      u.uid,
      `"${u.name || ''}"`,
      u.role === 14 ? t('adminBadge') : t('userBadge'),
      u.cardno || 0,
      punchCounts[String(u.userId)] || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ZK_Employees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('empTitle')}</h1>
          <p className="page-subtitle">{t('empSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={exportCSV}>
            <Download size={16} />
            <span>{t('exportStaff')}</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="toolbar" style={{ margin: 0 }}>
          <div className="filter-group">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                type="text"
                className="input input-with-icon"
                placeholder={t('searchEmpPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select 
              className="input"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">{t('allRoles')} ({users.length})</option>
              <option value="admin">{t('adminOnly')}</option>
              <option value="user">{t('userOnly')}</option>
            </select>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {t('showingEmployees').replace('{count}', filteredUsers.length)}
          </div>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="user-grid">
        {filteredUsers.map((user) => {
          const isAdmin = user.role === 14;
          const totalPunches = punchCounts[String(user.userId)] || 0;
          const initials = user.name
            ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            : `U${user.userId}`;

          return (
            <div 
              key={user.userId} 
              className={`user-card ${isAdmin ? 'admin' : ''}`}
              onClick={() => onSelectEmployee && onSelectEmployee(user.userId)}
              style={{ cursor: 'pointer' }}
            >
              <div className="user-avatar">
                {initials}
              </div>
              <div className="user-details">
                <div className="user-name">
                  {user.name || `${t('userId')} #${user.userId}`}
                </div>
                <div className="user-meta">
                  <span className="mono">{t('userId')}: {user.userId}</span>
                  <span>•</span>
                  {user.cardno && user.cardno !== 0 ? (
                    <span className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <CreditCard size={12} /> {user.cardno}
                    </span>
                  ) : (
                    <span>{t('biometric')}</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  {isAdmin ? (
                    <span className="badge badge-admin">
                      <Shield size={11} /> {t('adminBadge')}
                    </span>
                  ) : (
                    <span className="badge badge-user">
                      <User size={11} /> {t('userBadge')}
                    </span>
                  )}

                  <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {totalPunches} {t('logsCount')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
