import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Star, CalendarCheck, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/StateContext';

export default function StaffProfile() {
  const { currentUser, logout } = useAuth();
  const { bookings, services, staff } = useAppState();
  const navigate = useNavigate();

  const myStaff = staff.find(s => s.id === currentUser?.staffId);
  const myBookings = bookings.filter(b => b.staffId === currentUser?.staffId && b.status === 'approved');
  const myRevenue = myBookings.reduce((sum, b) => {
    const svc = services.find(s => s.id === b.serviceId);
    return sum + (svc?.price || 0);
  }, 0);

  // Service breakdown
  const serviceCounts = services.map(svc => ({
    ...svc,
    count: myBookings.filter(b => b.serviceId === svc.id).length,
  })).filter(s => s.count > 0);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="animate-fade">
      <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        My Profile
      </h1>

      {/* Staff card */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          backgroundColor: myStaff?.avatarColor || 'var(--color-anthracite-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '700', fontSize: '1rem', color: 'white', flexShrink: 0,
          border: '2px solid rgba(212,175,55,0.3)',
        }}>
          {myStaff?.initials}
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{currentUser?.name}</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', marginTop: '0.15rem', fontWeight: '600' }}>{myStaff?.role}</div>
          {myStaff && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
              <Star size={12} fill="var(--color-gold)" color="var(--color-gold)" />
              <span style={{ fontSize: '0.78rem', color: 'var(--color-gold)', fontWeight: '600' }}>{myStaff.rating}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({myStaff.reviews} reviews)</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Bookings', value: myBookings.length, icon: CalendarCheck, color: 'var(--color-gold)' },
          { label: 'Total Revenue',  value: `$${myRevenue}`,   icon: DollarSign,    color: 'var(--color-success)' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${stat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={stat.color} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Services performed */}
      {serviceCounts.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.125rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.875rem' }}>Services Performed</div>
          {serviceCounts.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem' }}>{s.emoji}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.name}</span>
              </div>
              <span style={{ fontWeight: '700', color: 'var(--color-gold)', fontSize: '0.82rem' }}>{s.count}x</span>
            </div>
          ))}
        </div>
      )}

      {/* Bio */}
      {myStaff?.bio && (
        <div className="glass-panel" style={{ padding: '1.125rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Expertise</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{myStaff.bio}</div>
        </div>
      )}

      <button onClick={handleLogout} style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-danger)', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}
