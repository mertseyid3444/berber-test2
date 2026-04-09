import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Star, Zap, Heart, ChevronRight, CalendarCheck, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/StateContext';

const TIERS = [
  { name: 'Bronze',   min: 0,    max: 100,  color: '#CD7F32', emoji: '🥉' },
  { name: 'Silver',   min: 100,  max: 300,  color: '#A8A9AD', emoji: '🥈' },
  { name: 'Gold',     min: 300,  max: 600,  color: '#D4AF37', emoji: '🥇' },
  { name: 'Platinum', min: 600,  max: 9999, color: '#B0C4DE', emoji: '💎' },
];

function getTier(pts) {
  return TIERS.find(t => pts >= t.min && pts < t.max) || TIERS[0];
}

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { bookings, services, staff, reviews, getLoyaltyPoints } = useAppState();

  const customerIdentity = currentUser || { name: 'Customer', phone: '' };
  const customerName = customerIdentity.name;
  const loyaltyPts   = getLoyaltyPoints(customerIdentity);
  const tier         = getTier(loyaltyPts);
  const nextTier     = TIERS.find(t => t.min > loyaltyPts) || TIERS[TIERS.length - 1];
  const progress     = Math.min(((loyaltyPts - tier.min) / (nextTier.min - tier.min)) * 100, 100);

  const myBookings = bookings.filter(b => 
    ((b.customerPhone && b.customerPhone === customerIdentity.phone) || b.customerName === customerIdentity.name) && 
    b.status === 'approved'
  );
  const totalSpent = myBookings.reduce((sum, b) => { const s = services.find(sv => sv.id === b.serviceId); return sum + (s?.price || 0); }, 0);
  const myReviews  = reviews.filter(r => r.customerName === customerIdentity.name);

  // Favorite barber = most booked
  const staffCounts = staff.map(m => ({ ...m, count: myBookings.filter(b => b.staffId === m.id).length }));
  const favoriteBarber = staffCounts.sort((a, b) => b.count - a.count)[0];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="animate-fade">
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--text-primary)', fontWeight: '700' }}>My Profile</h1>

      {/* User Card */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: `linear-gradient(135deg, ${tier.color}, var(--color-gold))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0F14', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0, boxShadow: `0 4px 16px ${tier.color}40` }}>
          {customerName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>{customerName}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: tier.color, fontWeight: '700' }}>{tier.emoji} {tier.name} Member</span>
          </div>
          {currentUser?.phone && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>📱 {currentUser.phone}</div>
          )}
        </div>
      </div>

      {/* Loyalty Card */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} color="var(--color-gold)" />
            <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Loyalty Points</span>
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-gold)' }}>{loyaltyPts}</span>
        </div>

        {/* Progress bar */}
        <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '0.5rem' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${tier.color}, var(--color-gold))`, borderRadius: '99px', transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>{tier.emoji} {tier.name}</span>
          {loyaltyPts < 600 && <span>{nextTier.min - loyaltyPts} pts to {nextTier.emoji} {nextTier.name}</span>}
          {loyaltyPts >= 600 && <span>💎 Maximum tier reached!</span>}
        </div>
        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.875rem', borderRadius: '8px', background: 'rgba(212,175,55,0.1)', fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: '600' }}>
          💡 You earn 1 point for every $1 spent
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '1rem' }}>
        {[
          { label: 'Appointments', value: myBookings.length, icon: CalendarCheck, color: '#4F8EEF' },
          { label: 'Total Spent',  value: `$${totalSpent}`,  icon: DollarSign,    color: 'var(--color-success)' },
          { label: 'Reviews',      value: myReviews.length,  icon: Star,          color: 'var(--color-gold)' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel" style={{ padding: '0.875rem', textAlign: 'center' }}>
              <Icon size={18} color={stat.color} style={{ marginBottom: '0.3rem' }} />
              <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>{stat.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Favorite Barber */}
      {favoriteBarber && favoriteBarber.count > 0 && (
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Heart size={16} color="var(--color-danger)" fill="var(--color-danger)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Favorite Barber</div>
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.1rem' }}>{favoriteBarber.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)' }}>{favoriteBarber.count} visit{favoriteBarber.count !== 1 ? 's' : ''} · {favoriteBarber.role}</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: favoriteBarber.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem', color: 'white', flexShrink: 0 }}>
            {favoriteBarber.initials}
          </div>
        </div>
      )}

      {/* Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div onClick={() => navigate('/app/booking')} className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(79,142,239,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarCheck size={18} color="#4F8EEF" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>My Bookings</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>View & manage appointments</div>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" />
        </div>
        <div onClick={() => navigate('/app/notifications')} className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="var(--color-gold)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Notifications</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Booking updates & alerts</div>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" />
        </div>
      </div>

      {/* Sign Out */}
      <button onClick={handleLogout} style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-danger)', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}
