import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Clock, CheckCircle, XCircle, MessageSquare, Save } from 'lucide-react';

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildWhatsAppMsg(booking, staffName, serviceName) {
  return `✂️ Dear ${booking.customerName},\n\nYour appointment has been confirmed! 🎉\n\n📅 Date: ${formatDate(booking.date)}\n⏰ Time: ${booking.time}${booking.endTime ? ' - ' + booking.endTime : ''}\n💇 Service: ${serviceName}\n👨‍💼 Your Barber: ${staffName}\n\nPlease arrive at the salon 10 minutes before your appointment. See you soon! 🙏\n\n— BarberBook Premium Salon ✂️`;
}

function openWhatsApp(phone, msg) {
  const cleaned = phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
  window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`, '_blank');
}

export default function StaffBookings() {
  const { currentUser } = useAuth();
  const { bookings, services, staff, updateBookingStatus, updateBookingNote } = useAppState();
  const [activeTab, setActiveTab] = useState('pending');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');

  const myStaff = staff.find(s => s.id === currentUser?.staffId);
  const myBookings = bookings.filter(b => b.staffId === currentUser?.staffId);
  const todayStr = new Date().toISOString().split('T')[0];

  const tabs = {
    pending:  myBookings.filter(b => b.status === 'pending'),
    upcoming: myBookings.filter(b => b.status === 'approved' && b.date >= todayStr),
    past:     myBookings.filter(b => b.date < todayStr && b.status === 'approved'),
  };

  const approve = (b) => {
    updateBookingStatus(b.id, 'approved');
    const svc = services.find(s => s.id === b.serviceId);
    if (b.customerPhone) {
      openWhatsApp(b.customerPhone, buildWhatsAppMsg(b, myStaff?.name || 'Your Barber', svc?.name || ''));
    }
  };

  const reject  = (id) => updateBookingStatus(id, 'rejected');
  const getService = (id) => services.find(s => s.id === id);
  const displayed = tabs[activeTab] || [];

  const startNote = (b) => { setEditingNoteId(b.id); setNoteText(b.note || ''); };
  const saveNote  = (id) => { updateBookingNote(id, noteText); setEditingNoteId(null); };

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>My Bookings</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          {tabs.pending.length > 0 ? `${tabs.pending.length} awaiting approval` : 'No pending approvals'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', backgroundColor: 'var(--color-anthracite-light)', borderRadius: '12px', padding: '4px', marginBottom: '1.25rem' }}>
        {[
          { key: 'pending',  label: `Pending (${tabs.pending.length})` },
          { key: 'upcoming', label: `Upcoming (${tabs.upcoming.length})` },
          { key: 'past',     label: `Past (${tabs.past.length})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.55rem 0.25rem', borderRadius: '9px', fontWeight: '600', fontSize: '0.72rem',
              color: activeTab === tab.key ? 'var(--color-midnight-dark)' : 'var(--text-secondary)',
              backgroundColor: activeTab === tab.key ? 'var(--color-gold)' : 'transparent',
              transition: 'all 0.15s',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {displayed.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No bookings in this category
          </div>
        ) : displayed.map(b => {
          const svc = getService(b.serviceId);
          return (
            <div key={b.id} className="glass-panel" style={{ padding: '1rem 1.125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{b.customerName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{svc?.name}</div>
                  {b.customerPhone && <div style={{ fontSize: '0.72rem', color: '#25D366', marginTop: '0.2rem' }}>📱 {b.customerPhone}</div>}
                </div>
                <span style={{
                  padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: '700',
                  background: b.status === 'approved' ? 'var(--color-success-bg)' : b.status === 'pending' ? 'var(--color-warning-bg)' : 'var(--color-danger-bg)',
                  color: b.status === 'approved' ? 'var(--color-success)' : b.status === 'pending' ? 'var(--color-warning)' : 'var(--color-danger)',
                }}>
                  {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <CalendarDays size={13} /> {formatDate(b.date)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Clock size={13} /> {b.time}{b.endTime ? ` - ${b.endTime}` : ''}
                </div>
                <div style={{ marginLeft: 'auto', fontWeight: '700', color: 'var(--color-gold)', fontSize: '0.85rem' }}>${svc?.price}</div>
              </div>

              {b.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.875rem' }}>
                  <button onClick={() => approve(b)} style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                    <CheckCircle size={14} /> Approve & WhatsApp
                  </button>
                  <button onClick={() => reject(b.id)} style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}

              {/* Note */}
              <div style={{ marginTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.65rem' }}>
                {editingNoteId === b.id ? (
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                    <textarea
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Add a note about this appointment..."
                      rows={2}
                      style={{ flex: 1, padding: '0.5rem 0.65rem', borderRadius: '8px', background: 'var(--color-anthracite-light)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', fontSize: '0.8rem', resize: 'none', outline: 'none' }}
                    />
                    <button onClick={() => saveNote(b.id)} style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--color-success-bg)', color: 'var(--color-success)', cursor: 'pointer' }}>
                      <Save size={14} />
                    </button>
                    <button onClick={() => setEditingNoteId(null)} style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <XCircle size={14} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => startNote(b)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: b.note ? 'var(--color-gold)' : 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem 0' }}>
                    <MessageSquare size={13} />
                    {b.note ? b.note : 'Add note...'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
