import React from 'react';
import { useAppState } from '../../context/StateContext';
import { Bell, CalendarCheck, XCircle, CheckCircle, Star, Tag, Trash2, CheckCheck } from 'lucide-react';

const ICON_MAP = {
  booking_sent:      { icon: CalendarCheck, color: '#4F8EEF',             bg: 'rgba(79,142,239,0.1)'   },
  booking_approved:  { icon: CheckCircle,   color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  booking_rejected:  { icon: XCircle,       color: 'var(--color-danger)',  bg: 'var(--color-danger-bg)'  },
  booking_cancelled: { icon: XCircle,       color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  review_thanks:     { icon: Star,          color: 'var(--color-gold)',    bg: 'rgba(212,175,55,0.1)'   },
  promo:             { icon: Tag,           color: '#A855F7',              bg: 'rgba(168,85,247,0.1)'   },
  default:           { icon: Bell,          color: 'var(--text-muted)',    bg: 'var(--color-anthracite-light)' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications() {
  const { notifications, markNotificationRead, markAllRead, setNotifications } = useAppState();
  const { currentUser } = useAuth();
  
  const myNotifications = notifications.filter(n => {
    if (n.type === 'promo' && !n.customerPhone && !n.customerName) return true;
    if (currentUser?.phone && n.customerPhone === currentUser.phone) return true;
    if (currentUser?.name && n.customerName === currentUser.name) return true;
    return false;
  });

  const unreadCount = myNotifications.filter(n => !n.read).length;

  const clearAll = () => {
    // Only clear the user's personal notifications and keep others
    const myIds = new Set(myNotifications.map(n => n.id));
    setNotifications(prev => prev.filter(n => !myIds.has(n.id)));
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>Notifications</h1>
          {unreadCount > 0 && (
            <p style={{ fontSize: '0.82rem', color: 'var(--color-gold)', marginTop: '0.15rem' }}>
              {unreadCount} unread
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: '600', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'rgba(212,175,55,0.1)', cursor: 'pointer' }}
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {myNotifications.length > 0 && (
            <button
              onClick={clearAll}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: '600', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--color-danger-bg)', cursor: 'pointer' }}
            >
              <Trash2 size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {myNotifications.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <Bell size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No notifications yet</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.35rem' }}>
            We'll notify you when your bookings are approved or updated
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {myNotifications.map(n => {
            const cfg  = ICON_MAP[n.type] || ICON_MAP.default;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className="glass-panel"
                style={{
                  padding: '1rem 1.125rem',
                  display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                  cursor: 'pointer',
                  borderLeft: n.read ? '3px solid transparent' : `3px solid ${cfg.color}`,
                  opacity: n.read ? 0.72 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={cfg.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: n.read ? '600' : '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{n.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.4 }}>{n.body}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{timeAgo(n.createdAt)}</div>
                </div>
                {!n.read && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.color, flexShrink: 0, marginTop: '4px' }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
