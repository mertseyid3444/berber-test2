import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, TrendingUp, Settings } from 'lucide-react';
import './AdminLayout.css';

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-placeholder">✂️</div>
          <h2>Control Panel</h2>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/admin" end className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/calendar" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <CalendarDays size={20} />
            <span>Calendar</span>
          </NavLink>
          <div className="admin-nav-item">
            <Users size={20} />
            <span>Clients</span>
          </div>
          <div className="admin-nav-item">
            <TrendingUp size={20} />
            <span>Revenue</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </div>
          <div className="user-profile-mini">
            <div className="avatar">AM</div>
            <div className="info">
              <span className="name">Admin User</span>
              <span className="role">Manager</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-topbar">
          <h3>Your Workspace</h3>
          <div className="topbar-actions">
            <button className="btn-primary">
              + Quick Walk-in
            </button>
          </div>
        </header>
        <div className="admin-content-scroll">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
