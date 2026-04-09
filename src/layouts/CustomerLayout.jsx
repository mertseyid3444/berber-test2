import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, CalendarCheck, MessageCircle, User, Bell } from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { useAuth } from '../context/AuthContext';
import './CustomerLayout.css';

export default function CustomerLayout() {
  const location = useLocation();
  const navigate  = useNavigate();
  const isHome    = location.pathname === '/app' || location.pathname === '/app/';
  const { notifications } = useAppState();
  const { currentUser } = useAuth();

  const unread = notifications.filter(n => {
    if (n.read) return false;
    if (n.type === 'promo' && !n.customerPhone && !n.customerName) return true;
    if (currentUser?.phone && n.customerPhone === currentUser.phone) return true;
    if (currentUser?.name && n.customerName === currentUser.name) return true;
    return false;
  }).length;

  return (
    <div className="mobile-shell">
      {/* Header — shown on non-home pages */}
      {!isHome && (
        <div className="mobile-header">
          <div className="brand">
            <h2>BarberBook</h2>
          </div>
          {/* Bell icon in header */}
          <button
            onClick={() => navigate('/app/notifications')}
            style={{ position: 'relative', color: 'var(--text-muted)', display: 'flex', padding: '4px', cursor: 'pointer' }}
          >
            <Bell size={20} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: '-2px', right: '-2px',
                width: '16px', height: '16px', borderRadius: '50%',
                background: 'var(--color-danger)', fontSize: '0.6rem',
                fontWeight: '800', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid var(--color-anthracite-dark)',
              }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        </div>
      )}

      <div className="mobile-content">
        <Outlet />
      </div>

      <nav className="bottom-nav">
        <NavLink to="/app" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <Home size={22} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/app/booking" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <CalendarCheck size={22} />
          <span>Bookings</span>
        </NavLink>
        <NavLink to="/app/chat" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <MessageCircle size={22} />
          <span>Chat</span>
        </NavLink>
        <NavLink to="/app/notifications" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'} style={{ position: 'relative' }}>
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <Bell size={22} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: 'var(--color-danger)', fontSize: '0.55rem',
                fontWeight: '800', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </span>
          <span>Alerts</span>
        </NavLink>
        <NavLink to="/app/profile" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <User size={22} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
