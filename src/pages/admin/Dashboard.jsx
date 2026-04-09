import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, CalendarCheck, Clock, Plus, Star, CheckCircle, XCircle, Bell } from 'lucide-react';

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildWhatsAppMsg(booking, staffName, serviceName) {
  return `✂️ Dear ${booking.customerName},\n\nYour appointment has been confirmed! 🎉\n\n📅 Date: ${formatDate(booking.date)}\n⏰ Time: ${booking.time}${booking.endTime ? ' - ' + booking.endTime : ''}\n💇 Service: ${serviceName}\n👨‍💼 Your Barber: ${staffName}\n\nPlease arrive 10 minutes early. See you soon! 🙏\n\n— BarberBook Premium Salon ✂️`;
}

function openWhatsApp(phone, msg) {
  const cleaned = phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
  window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`, '_blank');
}

// Stub revenue data - could be made dynamic
const revenueData = [
  { day: 'Mon', amount: 0 },
  { day: 'Tue', amount: 0 },
  { day: 'Wed', amount: 0 },
  { day: 'Thu', amount: 0 },
  { day: 'Fri', amount: 0 },
  { day: 'Sat', amount: 55 },
  { day: 'Sun', amount: 0 },
];

const SERVICES_LIST = [
  { id: 's1', name: 'Kids Haircut',       duration: 20 },
  { id: 's2', name: 'Hair Coloring',      duration: 60 },
  { id: 's3', name: 'Hair & Beard Combo', duration: 45 },
  { id: 's4', name: 'Hot Shave',          duration: 30 },
  { id: 's5', name: 'Beard Trim',         duration: 20 },
  { id: 's6', name: 'Haircut',            duration: 30 },
];

export default function Dashboard() {
  const { bookings, services, staff, updateBookingStatus, addWalkIn } = useAppState();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('approvals');
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  // Walk-in form state
  const [wiName, setWiName]       = useState('');
  const [wiService, setWiService] = useState('');
  const [wiStaff, setWiStaff]     = useState('');
  const [wiTime, setWiTime]       = useState('');

  const todayStr     = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === todayStr);
  const pendingAll    = bookings.filter(b => b.status === 'pending');
  const pendingToday  = pendingAll.filter(b => b.date === todayStr);

  const totalRevenue  = bookings
    .filter(b => b.status === 'approved')
    .reduce((sum, b) => { const s = services.find(sv => sv.id === b.serviceId); return sum + (s?.price || 0); }, 0);
  const todayRevenue  = bookings
    .filter(b => b.status === 'approved' && b.date === todayStr)
    .reduce((sum, b) => { const s = services.find(sv => sv.id === b.serviceId); return sum + (s?.price || 0); }, 0);

  const weeklyTotal = revenueData.reduce((s, d) => s + d.amount, 0);
  const maxRevenue  = Math.max(...revenueData.map(d => d.amount), 1);

  const approve = (b) => {
    updateBookingStatus(b.id, 'approved');
    const svc      = services.find(s => s.id === b.serviceId);
    const member   = staff.find(s => s.id === b.staffId);
    if (b.customerPhone) {
      openWhatsApp(b.customerPhone, buildWhatsAppMsg(b, member?.name || 'Your Barber', svc?.name || ''));
    }
  };

  const reject = (id) => updateBookingStatus(id, 'rejected');

  const handleWalkIn = () => {
    if (!wiService || !wiStaff) return alert('Please select a service and staff member.');
    const svc = services.find(s => s.id === wiService);
    const now = new Date();
    const time = wiTime || `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const dur  = svc?.duration || 30;
    const [h, m] = time.split(':').map(Number);
    const endMin = m + dur;
    const endTime = `${String(h + Math.floor(endMin / 60)).padStart(2,'0')}:${String(endMin % 60).padStart(2,'0')}`;
    addWalkIn({
      date: todayStr, time, endTime,
      serviceId: wiService, staffId: wiStaff,
      customerName: wiName.trim() || 'Walk-in',
    });
    setWiName(''); setWiService(''); setWiStaff(''); setWiTime('');
    setShowWalkInModal(false);
  };

  const statusBadge = (status) => ({
    padding: '0.3rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700',
    background: status === 'approved' ? 'var(--color-success-bg)' : status === 'pending' ? 'var(--color-warning-bg)' : 'var(--color-danger-bg)',
    color:      status === 'approved' ? 'var(--color-success)'    : status === 'pending' ? 'var(--color-warning)'    : 'var(--color-danger)',
  });

  const inputStyle = {
    width: '100%', padding: '0.7rem 0.875rem',
    borderRadius: '10px', background: 'var(--color-anthracite-light)',
    border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)',
    fontSize: '0.875rem', outline: 'none',
  };

  return (
    <div className="animate-fade" style={{ padding: '0' }}>
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <DollarSign size={16} color="#D4AF37" style={{ marginBottom: '0.35rem' }} />
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)' }}>${todayRevenue}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Today</div>
        </div>
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <CalendarCheck size={16} color="#10B981" style={{ marginBottom: '0.35rem' }} />
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)' }}>{todayBookings.filter(b => b.status === 'approved').length}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Confirmed</div>
        </div>
        <div className="glass-panel" style={{ padding: '1rem', position: 'relative' }}>
          <Bell size={16} color="#F59E0B" style={{ marginBottom: '0.35rem' }} />
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: pendingAll.length > 0 ? 'var(--color-warning)' : 'var(--text-primary)' }}>{pendingAll.length}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pending</div>
          {pendingAll.length > 0 && (
            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-warning)', boxShadow: '0 0 6px var(--color-warning)' }} />
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', backgroundColor: 'var(--color-anthracite-light)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '1.25rem' }}>
        {[
          { key: 'approvals', label: `Approvals${pendingAll.length > 0 ? ` (${pendingAll.length})` : ''}` },
          { key: 'today',     label: 'Schedule' },
          { key: 'revenue',   label: 'Revenue' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.6rem 0.25rem', borderRadius: 'var(--radius-sm)', fontWeight: '600', fontSize: '0.78rem',
              color: activeTab === tab.key ? 'var(--color-midnight-dark)' : 'var(--text-secondary)',
              backgroundColor: activeTab === tab.key ? 'var(--color-gold)' : 'transparent',
              transition: 'all var(--transition-fast)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── APPROVALS TAB ─────────────────────────────────────────── */}
      {activeTab === 'approvals' && (
        <div>
          <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Pending Approval Requests
          </h3>
          {pendingAll.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending approvals</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingAll.map(b => {
                const svc    = services.find(s => s.id === b.serviceId);
                const member = staff.find(s => s.id === b.staffId);
                return (
                  <div key={b.id} className="glass-panel" style={{ padding: '1rem 1.125rem', borderLeft: '3px solid var(--color-warning)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{b.customerName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-gold)', marginTop: '0.1rem' }}>{svc?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          with {member?.name} · {formatDate(b.date)} at {b.time}
                        </div>
                        {b.customerPhone && (
                          <div style={{ fontSize: '0.72rem', color: '#25D366', marginTop: '0.2rem' }}>📱 {b.customerPhone}</div>
                        )}
                      </div>
                      <span style={statusBadge('pending')}>Pending</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button
                        onClick={() => approve(b)}
                        style={{ flex: 1, padding: '0.55rem', borderRadius: '10px', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                      >
                        <CheckCircle size={14} /> Approve{b.customerPhone ? ' & WhatsApp' : ''}
                      </button>
                      <button
                        onClick={() => reject(b.id)}
                        style={{ flex: 1, padding: '0.55rem', borderRadius: '10px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TODAY'S SCHEDULE TAB ─────────────────────────────────────── */}
      {activeTab === 'today' && (
        <>
          <button
            onClick={() => setShowWalkInModal(true)}
            style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--color-gold)', color: 'var(--color-midnight-dark)', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem', cursor: 'pointer' }}
          >
            <Plus size={18} /> Quick Add Walk-in
          </button>

          <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Today's Schedule
          </h3>
          {todayBookings.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.9rem' }}>
              No bookings today
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[...todayBookings].sort((a, b) => a.time.localeCompare(b.time)).map(b => {
                const svc    = services.find(s => s.id === b.serviceId);
                const member = staff.find(s => s.id === b.staffId);
                return (
                  <div key={b.id} className="glass-panel" style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{b.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {b.time}{b.endTime ? ` - ${b.endTime}` : ''} · {svc?.name} · {member?.name}
                      </div>
                    </div>
                    <span style={statusBadge(b.status)}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── REVENUE TAB ──────────────────────────────────────────── */}
      {activeTab === 'revenue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Total Revenue (All Time)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-gold)' }}>${totalRevenue}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              {bookings.filter(b => b.status === 'approved').length} approved bookings
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Weekly Overview</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: '100px', justifyContent: 'space-between' }}>
              {revenueData.map(d => (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '3px' }}>${d.amount}</div>
                  <div style={{
                    width: '100%',
                    height: `${Math.max((d.amount / maxRevenue) * 80, d.amount > 0 ? 8 : 3)}px`,
                    backgroundColor: d.amount > 0 ? 'var(--color-gold)' : 'var(--color-anthracite-light)',
                    borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease',
                  }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              {revenueData.map(d => (
                <div key={d.day} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.day}</div>
              ))}
            </div>
          </div>

          {/* Staff revenue breakdown */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Staff Revenue</h3>
            {staff.map(member => {
              const rev = bookings.filter(b => b.status === 'approved' && b.staffId === member.id).reduce((s, b) => { const sv = services.find(sv => sv.id === b.serviceId); return s + (sv?.price || 0); }, 0);
              const maxRev = Math.max(...staff.map(m => bookings.filter(b => b.status === 'approved' && b.staffId === m.id).reduce((s, b) => { const sv = services.find(sv => sv.id === b.serviceId); return s + (sv?.price || 0); }, 0)), 1);
              return (
                <div key={member.id} style={{ marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{member.name}</span>
                    <span style={{ fontWeight: '700', color: 'var(--color-gold)', fontSize: '0.85rem' }}>${rev}</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '99px', width: `${(rev / maxRev) * 100}%`, background: `linear-gradient(90deg, ${member.avatarColor}, var(--color-gold))`, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── WALK-IN MODAL ────────────────────────────────────────── */}
      {showWalkInModal && (
        <div onClick={() => setShowWalkInModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} className="glass-panel" style={{ padding: '1.5rem', width: '100%', maxWidth: '420px' }}>
            <h3 style={{ marginBottom: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Quick Add Walk-in</h3>

            <input
              type="text" placeholder="Customer name (optional)" value={wiName}
              onChange={e => setWiName(e.target.value)}
              style={{ ...inputStyle, marginBottom: '0.65rem' }}
            />

            <select value={wiService} onChange={e => setWiService(e.target.value)} style={{ ...inputStyle, marginBottom: '0.65rem', cursor: 'pointer' }}>
              <option value="">Select Service *</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} — ${s.price} ({s.duration}m)</option>)}
            </select>

            <select value={wiStaff} onChange={e => setWiStaff(e.target.value)} style={{ ...inputStyle, marginBottom: '0.65rem', cursor: 'pointer' }}>
              <option value="">Select Staff Member *</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.name} — {s.role}</option>)}
            </select>

            <input
              type="time" value={wiTime}
              onChange={e => setWiTime(e.target.value)}
              placeholder="Time (optional, defaults to now)"
              style={{ ...inputStyle, marginBottom: '1.25rem' }}
            />

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowWalkInModal(false)} style={{ flex: 1, padding: '0.875rem', borderRadius: 'var(--radius-sm)', background: 'var(--color-anthracite-light)', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleWalkIn} style={{ flex: 1, padding: '0.875rem', borderRadius: 'var(--radius-sm)', background: 'var(--color-gold)', color: 'var(--color-midnight-dark)', fontWeight: '700', cursor: 'pointer' }}>
                Add Walk-in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
