import React from 'react';
import { useAppState } from '../../context/StateContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, Clock, DollarSign, CalendarCheck, Users } from 'lucide-react';

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

// Convert "HH:MM" to minutes from midnight for positioning
function toMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export default function StaffDashboard() {
  const { currentUser } = useAuth();
  const { bookings, services, staff, updateBookingStatus } = useAppState();

  const myStaff      = staff.find(s => s.id === currentUser?.staffId);
  const myBookings   = bookings.filter(b => b.staffId === currentUser?.staffId);
  const todayStr     = new Date().toISOString().split('T')[0];
  const todayAll     = myBookings.filter(b => b.date === todayStr);
  const todayApproved = todayAll.filter(b => b.status === 'approved');
  const pendingBookings = myBookings.filter(b => b.status === 'pending');

  const todayRevenue = todayApproved.reduce((sum, b) => {
    const s = services.find(sv => sv.id === b.serviceId);
    return sum + (s?.price || 0);
  }, 0);

  // Customer visit counts (all bookings across all time)
  const visitCount = (name) =>
    bookings.filter(b => b.customerName === name && b.status === 'approved' && b.staffId === currentUser?.staffId).length;

  const getService = id => services.find(s => s.id === id);

  const approveBooking = (b) => {
    updateBookingStatus(b.id, 'approved');
    const svc = getService(b.serviceId);
    if (b.customerPhone) {
      openWhatsApp(b.customerPhone, buildWhatsAppMsg(b, myStaff?.name || 'Your Barber', svc?.name || ''));
    }
  };

  const rejectBooking = id => updateBookingStatus(id, 'rejected');

  // ── Timeline: slots from 09:00 to 20:00 ──────────────────────
  const DAY_START = 9 * 60;   // 09:00
  const DAY_END   = 20 * 60;  // 20:00
  const DAY_SPAN  = DAY_END - DAY_START;
  const HOUR_HEIGHT = 52; // px per hour
  const TIMELINE_HEIGHT = (DAY_SPAN / 60) * HOUR_HEIGHT;
  const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 9..20

  return (
    <div className="animate-fade">
      {/* Greeting */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          Hello, {currentUser?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '1.5rem' }}>
        {[
          { label: "Today's\nBookings", value: todayApproved.length, icon: CalendarCheck, color: 'var(--color-gold)' },
          { label: "Today's\nRevenue",  value: `$${todayRevenue}`,   icon: DollarSign,    color: 'var(--color-success)' },
          { label: "Pending\nApproval", value: pendingBookings.length, icon: Clock,        color: pendingBookings.length > 0 ? 'var(--color-warning)' : 'var(--text-muted)' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel" style={{ padding: '0.875rem 0.75rem', textAlign: 'center', position: 'relative' }}>
              <Icon size={18} color={stat.color} style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{stat.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'pre-line', lineHeight: 1.3 }}>{stat.label}</div>
              {i === 2 && pendingBookings.length > 0 && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-warning)', boxShadow: '0 0 5px var(--color-warning)' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Pending Approvals */}
      {pendingBookings.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            📋 Pending Approvals
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {pendingBookings.map(b => {
              const svc   = getService(b.serviceId);
              const visits = visitCount(b.customerName);
              return (
                <div key={b.id} className="glass-panel" style={{ padding: '1rem 1.125rem', borderLeft: '3px solid var(--color-warning)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{b.customerName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {svc?.name} · {formatDate(b.date)} · {b.time}
                      </div>
                      {b.customerPhone && (
                        <div style={{ fontSize: '0.72rem', color: '#25D366', marginTop: '0.15rem' }}>📱 {b.customerPhone}</div>
                      )}
                      {visits > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                          <Users size={11} color="var(--color-gold)" />
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)', fontWeight: '600' }}>
                            {visits} previous visit{visits !== 1 ? 's' : ''} with you
                          </span>
                        </div>
                      )}
                    </div>
                    <span style={{ padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: '700', background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>Pending</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button onClick={() => approveBooking(b)} style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                      <CheckCircle size={14} /> Approve & WhatsApp
                    </button>
                    <button onClick={() => rejectBooking(b.id)} style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline */}
      <h2 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.875rem', color: 'var(--text-primary)' }}>
        📅 Today's Timeline
      </h2>

      {todayApproved.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No approved bookings for today. Enjoy your day! ✂️
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {/* Hour labels */}
            <div style={{ width: '36px', flexShrink: 0, position: 'relative', height: `${TIMELINE_HEIGHT}px` }}>
              {hours.map(h => (
                <div key={h} style={{ position: 'absolute', top: `${((h - 9) / 11) * TIMELINE_HEIGHT}px`, fontSize: '0.62rem', color: 'var(--text-muted)', transform: 'translateY(-50%)', textAlign: 'right', width: '100%', paddingRight: '4px' }}>
                  {h}:00
                </div>
              ))}
            </div>

            {/* Gridlines + bookings */}
            <div style={{ flex: 1, position: 'relative', height: `${TIMELINE_HEIGHT}px` }}>
              {/* Hour lines */}
              {hours.map(h => (
                <div key={h} style={{ position: 'absolute', top: `${((h - 9) / 11) * TIMELINE_HEIGHT}px`, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
              ))}

              {/* Booking blocks */}
              {todayApproved.map(b => {
                const svc      = getService(b.serviceId);
                const startMin = Math.max(toMinutes(b.time) - DAY_START, 0);
                const dur      = svc?.duration || 30;
                const topPct   = (startMin / DAY_SPAN) * TIMELINE_HEIGHT;
                const heightPx = Math.max((dur / DAY_SPAN) * TIMELINE_HEIGHT, 28);
                const visits   = visitCount(b.customerName);
                return (
                  <div key={b.id} style={{
                    position: 'absolute',
                    top: `${topPct}px`,
                    left: '4px', right: '4px',
                    height: `${heightPx}px`,
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.12))',
                    border: '1px solid rgba(212,175,55,0.35)',
                    padding: '4px 8px',
                    overflow: 'hidden',
                  }}>
                    <div style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.customerName}
                      {visits > 1 && <span style={{ marginLeft: '4px', fontSize: '0.65rem', color: 'var(--color-gold)' }}>★{visits}</span>}
                    </div>
                    {heightPx > 36 && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {svc?.name} · {b.time}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Current time indicator */}
              {(() => {
                const now = new Date();
                const nowMin = now.getHours() * 60 + now.getMinutes() - DAY_START;
                if (nowMin < 0 || nowMin > DAY_SPAN) return null;
                const topPx = (nowMin / DAY_SPAN) * TIMELINE_HEIGHT;
                return (
                  <div style={{ position: 'absolute', top: `${topPx}px`, left: 0, right: 0, height: '2px', background: 'var(--color-danger)', zIndex: 2 }}>
                    <div style={{ position: 'absolute', left: '-4px', top: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-danger)' }} />
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
