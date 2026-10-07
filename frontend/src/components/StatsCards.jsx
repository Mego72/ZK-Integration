import React from 'react';
import { Users, Clock, Database, Activity } from 'lucide-react';

export default function StatsCards({ statusData, userCount, logCount, logsToday }) {
  const deviceInfo = statusData?.data?.deviceInfo || {};
  const maxCapacity = deviceInfo.logCapacity || 100000;
  const usedPercent = ((logCount / maxCapacity) * 100).toFixed(1);

  const stats = [
    {
      label: 'Registered Users',
      value: userCount ?? deviceInfo.userCounts ?? '--',
      sub: 'Enrolled in MB2000',
      icon: Users,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.15)',
    },
    {
      label: 'Total Attendance Logs',
      value: logCount ?? deviceInfo.logCounts ?? '--',
      sub: `${usedPercent}% device memory used`,
      icon: Clock,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.15)',
    },
    {
      label: 'Today\'s Punches',
      value: logsToday,
      sub: 'Activity recorded today',
      icon: Activity,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
    },
    {
      label: 'Device Capacity',
      value: maxCapacity.toLocaleString(),
      sub: 'Max attendance buffer',
      icon: Database,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)',
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="card stat-card">
            <div className="stat-info">
              <div className="stat-label">{item.label}</div>
              <div className="stat-value">{item.value}</div>
              <div className="stat-sub">{item.sub}</div>
            </div>
            <div 
              className="stat-icon" 
              style={{ backgroundColor: item.bgColor, color: item.color }}
            >
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
