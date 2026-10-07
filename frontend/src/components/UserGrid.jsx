import React, { useState } from 'react';
import { Search, Shield, User, CreditCard } from 'lucide-react';

export default function UserGrid({ users, onSelectUser, loading }) {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(user => {
    const name = (user.name || '').toLowerCase();
    const id = String(user.userId || '');
    const card = String(user.cardno || '');
    const q = search.toLowerCase();
    return name.includes(q) || id.includes(q) || card.includes(q);
  });

  return (
    <div className="card animate-fade-in">
      <div className="toolbar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="input input-with-icon"
            placeholder="Search enrolled employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Showing {filteredUsers.length} of {users.length} enrolled users
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner" style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%' }} />
          <p style={{ marginTop: 12 }}>Loading enrolled biometric users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <User size={48} />
          <h3>No users found</h3>
          <p>Try searching for a different employee name or user ID.</p>
        </div>
      ) : (
        <div className="user-grid">
          {filteredUsers.map((user) => {
            const isAdmin = user.role === 14;
            const initials = user.name
              ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              : `U${user.userId}`;

            return (
              <div 
                key={user.userId} 
                className={`user-card ${isAdmin ? 'admin' : ''}`}
                onClick={() => onSelectUser && onSelectUser(user.userId)}
                style={{ cursor: 'pointer' }}
                title="Click to filter punches for this user"
              >
                <div className="user-avatar">
                  {initials}
                </div>
                <div className="user-details">
                  <div className="user-name">
                    {user.name || `User ID #${user.userId}`}
                  </div>
                  <div className="user-meta">
                    <span className="mono">ID: {user.userId}</span>
                    <span>•</span>
                    {user.cardno && user.cardno !== 0 ? (
                      <span className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <CreditCard size={12} /> {user.cardno}
                      </span>
                    ) : (
                      <span>Biometric</span>
                    )}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {isAdmin ? (
                      <span className="badge badge-admin">
                        <Shield size={11} />
                        Device Admin
                      </span>
                    ) : (
                      <span className="badge badge-user">
                        <User size={11} />
                        Standard User
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
