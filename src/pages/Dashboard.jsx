import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, LogOut, RefreshCw, Trash2, Archive, Eye, EyeOff,
  Inbox, CheckCircle, ArchiveIcon, AlertCircle, Zap, Clock,
  User, Filter, ChevronDown, X,
} from 'lucide-react';

import { API_BASE_URL as API_BASE } from '../config';


// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('aab_admin_token') ?? 'my-secret-admin-key';
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const STATUS_META = {
  unread:   { label: 'Unread',   color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   icon: Mail },
  read:     { label: 'Read',     color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: CheckCircle },
  archived: { label: 'Archived', color: '#64748b', bg: 'rgba(100,116,139,0.12)', icon: ArchiveIcon },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.unread;
  const Icon = meta.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.6rem', borderRadius: '9999px',
      background: meta.bg, color: meta.color,
      fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.02em',
    }}>
      <Icon size={11} />
      {meta.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{
      background: 'rgba(13, 21, 38, 0.8)',
      border: '1px solid rgba(30, 41, 59, 0.8)',
      borderRadius: '1rem', padding: '1.25rem 1.5rem',
      display: 'flex', alignItems: 'center', gap: '1rem',
    }}>
      <div style={{
        width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem',
        background: bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color, flexShrink: 0,
      }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>{label}</div>
      </div>
    </div>
  );
}

function QueryCard({ query, onStatusChange, onDelete, isSelected, onToggleSelect }) {
  const [expanded, setExpanded] = useState(false);
  const [actioning, setActioning] = useState(false);

  const handleStatus = async (newStatus) => {
    setActioning(true);
    await onStatusChange(query.id, newStatus);
    setActioning(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete inquiry from ${query.name}? This cannot be undone.`)) return;
    setActioning(true);
    await onDelete(query.id);
  };

  const isUnread = query.status === 'unread';

  return (
    <div style={{
      background: isUnread ? 'rgba(6,182,212,0.04)' : 'rgba(13, 21, 38, 0.6)',
      border: isUnread ? '1px solid rgba(6,182,212,0.18)' : '1px solid rgba(30,41,59,0.7)',
      borderRadius: '0.875rem',
      overflow: 'hidden',
      transition: 'border-color 0.2s, background 0.2s',
      opacity: actioning ? 0.6 : 1,
    }}>
      {/* Card header */}
      <div
        onClick={(e) => {
          if (e.target.tagName.toLowerCase() === 'input') return;
          setExpanded(p => !p);
        }}
        style={{
          padding: '1.1rem 1.4rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => onToggleSelect(query.id)}
          style={{ cursor: 'pointer', width: '1.1rem', height: '1.1rem', accentColor: '#06b6d4', flexShrink: 0 }}
        />
        {/* Avatar */}
        <div style={{
          width: '2.25rem', height: '2.25rem', borderRadius: '50%',
          background: 'linear-gradient(135deg, #06b6d4, #10b981)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#0a0f1a', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
        }}>
          {query.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem' }}>{query.name}</span>
            {isUnread && (
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#06b6d4', display: 'inline-block',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }} />
            )}
            <StatusBadge status={query.status} />
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
            {query.email}
          </div>
        </div>

        {/* Meta */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#475569', fontSize: '0.75rem', justifyContent: 'flex-end' }}>
            <Clock size={12} />
            {timeAgo(query.createdAt)}
          </div>
          <div style={{ marginTop: '0.35rem', color: '#475569' }}>
            <ChevronDown
              size={15}
              style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}
            />
          </div>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{
          padding: '0 1.4rem 1.2rem 1.4rem',
          borderTop: '1px solid rgba(30,41,59,0.6)',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          {/* Message */}
          <p style={{
            marginTop: '1rem',
            color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {query.message}
          </p>

          {/* Action bar */}
          <div style={{
            marginTop: '1.1rem', display: 'flex', alignItems: 'center',
            gap: '0.5rem', flexWrap: 'wrap',
          }}>
            {query.status !== 'read' && (
              <ActionBtn
                onClick={() => handleStatus('read')}
                icon={Eye} label="Mark Read"
                color="#10b981" bg="rgba(16,185,129,0.1)"
                borderColor="rgba(16,185,129,0.25)"
              />
            )}
            {query.status !== 'unread' && (
              <ActionBtn
                onClick={() => handleStatus('unread')}
                icon={EyeOff} label="Mark Unread"
                color="#06b6d4" bg="rgba(6,182,212,0.1)"
                borderColor="rgba(6,182,212,0.25)"
              />
            )}
            {query.status !== 'archived' && (
              <ActionBtn
                onClick={() => handleStatus('archived')}
                icon={Archive} label="Archive"
                color="#94a3b8" bg="rgba(100,116,139,0.1)"
                borderColor="rgba(100,116,139,0.2)"
              />
            )}
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${query.email}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.4rem 0.8rem', borderRadius: '0.5rem',
                background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
                color: '#06b6d4', fontSize: '0.78rem', fontWeight: 500,
                textDecoration: 'none', transition: 'background 0.2s',
              }}
            >
              <Mail size={13} />
              Reply
            </a>
            <ActionBtn
              onClick={handleDelete}
              icon={Trash2} label="Delete"
              color="#ef4444" bg="rgba(239,68,68,0.1)"
              borderColor="rgba(239,68,68,0.25)"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ onClick, icon: Icon, label, color, bg, borderColor }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        padding: '0.4rem 0.8rem', borderRadius: '0.5rem',
        background: bg, border: `1px solid ${borderColor}`,
        color, fontSize: '0.78rem', fontWeight: 500,
        cursor: 'pointer', transition: 'background 0.2s, transform 0.15s',
      }}
      onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

const TABS = [
  { key: 'all',      label: 'All',      icon: Inbox },
  { key: 'unread',   label: 'Unread',   icon: Mail },
  { key: 'read',     label: 'Read',     icon: CheckCircle },
  { key: 'archived', label: 'Archived', icon: ArchiveIcon },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [queries,   setQueries]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchQueries = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/inquiries`, {
        headers: { 'X-Admin-Key': getToken() },
        cache: 'no-store',
      });
      if (res.status === 401) {
        localStorage.removeItem('aab_admin_token');
        navigate('/login', { replace: true });
        return;
      }
      const data = await res.json();
      if (data.success) setQueries(data.data);
      else setError(data.error ?? 'Failed to load queries.');
    } catch {
      setError('Cannot connect to the backend. Please check the network connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => { fetchQueries(); }, [fetchQueries]);

  const handleLogout = () => {
    localStorage.removeItem('aab_admin_token');
    navigate('/login', { replace: true });
  };

  const handleStatusChange = async (id, status) => {
    try {
      await fetch(`${API_BASE}/api/inquiries/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': getToken() },
        body: JSON.stringify({ action: status, ids: [id] }),
      });
      setQueries(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    } catch {
      setError('Failed to update status. Check your connection.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/api/inquiries/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Key': getToken() },
      });
      setQueries(prev => prev.filter(q => q.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } catch {
      setError('Failed to delete. Check your connection.');
    }
  };

  const handleBulkAction = async (action) => {
    if (action === 'delete') {
      if (!window.confirm(`Delete ${selectedIds.length} inquiries? This cannot be undone.`)) return;
    }
    try {
      await fetch(`${API_BASE}/api/inquiries/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': getToken() },
        body: JSON.stringify({ action, ids: selectedIds }),
      });
      setSelectedIds([]);
      fetchQueries(true);
    } catch {
      setError('Bulk action failed. Check your connection.');
    }
  };

  // Counts
  const counts = {
    all:      queries.length,
    unread:   queries.filter(q => q.status === 'unread').length,
    read:     queries.filter(q => q.status === 'read').length,
    archived: queries.filter(q => q.status === 'archived').length,
  };

  // Filtered list
  const filtered = activeTab === 'all'
    ? queries
    : queries.filter(q => q.status === activeTab);

  return (
    <div style={{ minHeight: '100vh', background: '#080d18', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Nav ──────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8, 13, 24, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(30, 41, 59, 0.8)',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '4rem',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2rem', height: '2rem', borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, #06b6d4, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={14} color="#0a0f1a" />
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9', lineHeight: 1 }}>
              Portfolio Admin
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>AAB Dashboard</div>
          </div>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => fetchQueries(true)}
            disabled={refreshing}
            title="Refresh"
            style={{
              background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(30,41,59,0.8)',
              borderRadius: '0.5rem', padding: '0.45rem',
              color: '#64748b', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#f1f5f9'}
            onMouseOut={e => e.currentTarget.style.color = '#64748b'}
          >
            <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.35rem 0.75rem', borderRadius: '0.5rem',
            background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(30,41,59,0.6)',
          }}>
            <User size={13} style={{ color: '#64748b' }} />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Abdul Ahad Butt</span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '0.5rem', padding: '0.45rem 0.85rem',
              color: '#f87171', fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>

        {/* Page title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: '1.6rem', color: '#f1f5f9', marginBottom: '0.35rem',
          }}>
            Incoming Inquiries
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            {counts.all} submission{counts.all !== 1 ? 's' : ''} total
            {counts.unread > 0 && (
              <span style={{ color: '#06b6d4', marginLeft: '0.5rem', fontWeight: 600 }}>
                · {counts.unread} unread
              </span>
            )}
          </p>
        </div>

        {/* Stat cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem', marginBottom: '2rem',
        }}>
          <StatCard icon={Inbox}       label="Total"    value={counts.all}      color="#94a3b8" bg="rgba(100,116,139,0.15)" />
          <StatCard icon={Mail}        label="Unread"   value={counts.unread}   color="#06b6d4" bg="rgba(6,182,212,0.15)"   />
          <StatCard icon={CheckCircle} label="Read"     value={counts.read}     color="#10b981" bg="rgba(16,185,129,0.15)"  />
          <StatCard icon={ArchiveIcon} label="Archived" value={counts.archived} color="#64748b" bg="rgba(100,116,139,0.12)" />
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '0.75rem', padding: '0.875rem 1.25rem',
            color: '#f87171', fontSize: '0.85rem', marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={15} />
              {error}
            </div>
            <button
              onClick={() => setError('')}
              style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ── Tabs ───────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '0.4rem',
          background: 'rgba(13,21,38,0.8)',
          border: '1px solid rgba(30,41,59,0.7)',
          borderRadius: '0.875rem', padding: '0.35rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSelectedIds([]); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                  padding: '0.55rem 1rem', borderRadius: '0.6rem',
                  border: 'none', cursor: 'pointer',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  background: isActive ? 'rgba(6,182,212,0.15)' : 'transparent',
                  color: isActive ? '#06b6d4' : '#64748b',
                  whiteSpace: 'nowrap',
                }}
                onMouseOver={e => { if (!isActive) e.currentTarget.style.color = '#94a3b8'; }}
                onMouseOut={e => { if (!isActive) e.currentTarget.style.color = '#64748b'; }}
              >
                <Icon size={14} />
                {tab.label}
                <span style={{
                  padding: '0.05rem 0.45rem', borderRadius: '9999px',
                  background: isActive ? 'rgba(6,182,212,0.2)' : 'rgba(30,41,59,0.6)',
                  color: isActive ? '#06b6d4' : '#475569',
                  fontSize: '0.72rem', fontWeight: 700,
                }}>
                  {counts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>

        {selectedIds.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
            borderRadius: '0.875rem', padding: '0.75rem 1rem', marginBottom: '1.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>
              {selectedIds.length} selected
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <ActionBtn onClick={() => handleBulkAction('read')} icon={CheckCircle} label="Mark Read" color="#10b981" bg="rgba(16,185,129,0.15)" borderColor="rgba(16,185,129,0.3)" />
              <ActionBtn onClick={() => handleBulkAction('unread')} icon={Mail} label="Mark Unread" color="#06b6d4" bg="rgba(6,182,212,0.15)" borderColor="rgba(6,182,212,0.3)" />
              <ActionBtn onClick={() => handleBulkAction('archived')} icon={ArchiveIcon} label="Archive" color="#94a3b8" bg="rgba(100,116,139,0.15)" borderColor="rgba(100,116,139,0.3)" />
              <a
                href={`mailto:?bcc=${queries.filter(q => selectedIds.includes(q.id)).map(q => q.email).join(',')}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.4rem 0.8rem', borderRadius: '0.5rem',
                  background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
                  color: '#06b6d4', fontSize: '0.78rem', fontWeight: 500,
                  textDecoration: 'none', transition: 'background 0.2s',
                }}
              >
                <Mail size={13} />
                Reply
              </a>
              <ActionBtn onClick={() => handleBulkAction('delete')} icon={Trash2} label="Delete" color="#ef4444" bg="rgba(239,68,68,0.15)" borderColor="rgba(239,68,68,0.3)" />
            </div>
          </div>
        )}

        {/* ── Query list ─────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}>
              <circle cx="12" cy="12" r="10" stroke="#06b6d4" strokeWidth="3"
                strokeDasharray="60" strokeDashoffset="40" />
            </svg>
            <p style={{ color: '#475569', fontSize: '0.875rem' }}>Loading inquiries...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 0',
            color: '#475569',
          }}>
            <Filter size={36} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ fontWeight: 500, marginBottom: '0.35rem' }}>No {activeTab === 'all' ? '' : activeTab} inquiries yet</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              {activeTab === 'all'
                ? 'Contact form submissions will appear here once received.'
                : `Switch to a different tab to see other messages.`}
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0 0.5rem 0.75rem 0.5rem', color: '#94a3b8', fontSize: '0.85rem'
            }}>
              <input 
                type="checkbox" 
                checked={filtered.length > 0 && filtered.every(q => selectedIds.includes(q.id))} 
                ref={el => el && (el.indeterminate = selectedIds.length > 0 && !filtered.every(q => selectedIds.includes(q.id)))}
                onChange={() => {
                  if (filtered.every(q => selectedIds.includes(q.id))) {
                    setSelectedIds([]);
                  } else {
                    setSelectedIds(filtered.map(q => q.id));
                  }
                }} 
                style={{ cursor: 'pointer', width: '1.1rem', height: '1.1rem', accentColor: '#06b6d4' }} 
              />
              <span 
                style={{ cursor: 'pointer', userSelect: 'none' }} 
                onClick={() => {
                  if (filtered.every(q => selectedIds.includes(q.id))) {
                    setSelectedIds([]);
                  } else {
                    setSelectedIds(filtered.map(q => q.id));
                  }
                }}
              >
                Select All
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map(q => (
                <QueryCard
                  key={q.id}
                  query={q}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  isSelected={selectedIds.includes(q.id)}
                  onToggleSelect={(id) => {
                    setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '1.25rem',
        borderTop: '1px solid rgba(30,41,59,0.5)',
        color: '#334155', fontSize: '0.75rem',
      }}>
        Portfolio Admin · Abdul Ahad Butt · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
