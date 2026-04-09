import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { CalendarCheck, LayoutDashboard, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StaffLayout.css';

export default function StaffLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="mobile-shell">
      <div className="mobile-header" style={{ background: 'var(--color-anthracite-dark)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="brand">
          <h2 style={{ color: 'var(--color-gold)' }}>BarberBook</h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: '600', marginLeft: '8px', background: 'var(--color-success-bg)', padding: '2px 8px', borderRadius: '99px' }}>Staff</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>{currentUser?.name}</div>
          </div>
          <button onClick={handleLogout} style={{ color: 'var(--text-muted)', display: 'flex', cursor: 'pointer', padding: '4px' }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="mobile-content">
        <Outlet />
      </div>

      <nav className="bottom-nav">
        <NavLink to="/staff" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <LayoutDashboard size={22} />
          <span>Overview</span>
        </NavLink>
        <NavLink to="/staff/bookings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <CalendarCheck size={22} />
          <span>Bookings</span>
        </NavLink>
        <NavLink to="/staff/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <User size={22} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
