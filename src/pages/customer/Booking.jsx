import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Clock, MessageCircle, Plus, Star, XCircle, AlertTriangle } from 'lucide-react';

const todayStr = new Date().toISOString().split('T')[0];

function formatDisplayDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Review Modal ──────────────────────────────────────────────────────────
function ReviewModal({ booking, service, staffMember, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');

  const submit = () => {
    if (rating === 0) return alert('Please select a rating.');
    onSubmit({ bookingId: booking.id, staffId: booking.staffId, rating, comment: comment.trim() });
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} className="glass-panel animate-slide-up" style={{ padding: '1.5rem', width: '100%', maxWidth: '420px', marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Leave a Review</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          How was your experience with {staffMember?.name}?
        </p>

        {/* Service info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '1.4rem' }}>{service?.emoji}</div>
          <div>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem' }}>{service?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>with {staffMember?.name} · {formatDisplayDate(booking.date)}</div>
          </div>
        </div>

        {/* Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {[1,2,3,4,5].map(s => (
            <button
              key={s}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              style={{ cursor: 'pointer', transition: 'transform 0.1s', transform: (hovered || rating) >= s ? 'scale(1.2)' : 'scale(1)' }}
            >
              <Star
                size={36}
                fill={(hovered || rating) >= s ? 'var(--color-gold)' : 'transparent'}
                color={(hovered || rating) >= s ? 'var(--color-gold)' : 'var(--text-muted)'}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <div style={{ textAlign: 'center', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-gold)', marginBottom: '1rem' }}>
            {['','Poor','Fair','Good','Very Good','Excellent!'][rating]}
          </div>
        )}

        {/* Comment */}
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience (optional)..."
          rows={3}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'var(--color-anthracite-light)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', fontSize: '0.875rem', resize: 'none', outline: 'none', marginBottom: '1rem' }}
        />

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.875rem', borderRadius: '10px', background: 'var(--color-anthracite-light)', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={submit} style={{ flex: 1, padding: '0.875rem', borderRadius: '10px', background: 'var(--color-gold)', color: '#0A0F14', fontWeight: '700', cursor: 'pointer' }}>
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cancel Confirm Modal ──────────────────────────────────────────────────
function CancelModal({ booking, service, onClose, onConfirm }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} className="glass-panel animate-fade" style={{ padding: '1.5rem', width: '100%', maxWidth: '380px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--color-danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={20} color="var(--color-danger)" />
          </div>
          <div>
            <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Cancel Booking</div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>This action cannot be undone</div>
          </div>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Are you sure you want to cancel your <strong style={{ color: 'var(--text-primary)' }}>{service?.name}</strong> appointment on <strong style={{ color: 'var(--text-primary)' }}>{formatDisplayDate(booking.date)}</strong>?
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.875rem', borderRadius: '10px', background: 'var(--color-anthracite-light)', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}>
            Keep It
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '0.875rem', borderRadius: '10px', background: 'var(--color-danger-bg)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--color-danger)', fontWeight: '700', cursor: 'pointer' }}>
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Booking Page ─────────────────────────────────────────────────────
export default function Booking() {
  const { bookings, services, staff, cancelBooking, addReview, reviews } = useAppState();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reviewTarget, setReviewTarget]   = useState(null);
  const [cancelTarget, setCancelTarget]   = useState(null);

  const customerBookings = bookings.filter(b =>
    (b.customerPhone && b.customerPhone === currentUser?.phone) ||
    b.customerName === currentUser?.name
  );
  const upcoming = customerBookings.filter(b => b.date >= todayStr && b.status !== 'cancelled' && b.status !== 'rejected');
  const past     = customerBookings.filter(b => b.date < todayStr || b.status === 'cancelled' || b.status === 'rejected');

  const displayed = activeTab === 'upcoming' ? upcoming : past;

  const getService = id => services.find(s => s.id === id);
  const getStaff   = id => staff.find(s => s.id === id);

  const hasReviewed = (bookingId) => reviews.some(r => r.bookingId === bookingId);

  const statusColors = {
    approved:  { bg: 'var(--color-success-bg)',  color: 'var(--color-success)',  label: 'Confirmed' },
    pending:   { bg: 'var(--color-warning-bg)',  color: 'var(--color-warning)',  label: 'Pending'   },
    rejected:  { bg: 'var(--color-danger-bg)',   color: 'var(--color-danger)',   label: 'Declined'  },
    cancelled: { bg: 'rgba(107,114,128,0.15)',   color: 'var(--text-muted)',     label: 'Cancelled' },
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>My Bookings</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-gold)', marginTop: '0.2rem' }}>
          {upcoming.filter(b => b.status === 'approved').length} confirmed · {upcoming.filter(b => b.status === 'pending').length} pending
        </p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: 'var(--color-anthracite-light)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '1.25rem' }}>
        {[
          { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
          { key: 'past',     label: `Past (${past.length})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontWeight: '600', fontSize: '0.875rem', color: activeTab === tab.key ? 'var(--color-midnight-dark)' : 'var(--text-secondary)', backgroundColor: activeTab === tab.key ? 'var(--color-gold)' : 'transparent', transition: 'all var(--transition-fast)' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {displayed.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem 0', fontSize: '0.9rem' }}>
            No {activeTab} appointments
          </div>
        ) : (
          displayed.map(b => {
            const service = getService(b.serviceId);
            const member  = getStaff(b.staffId);
            const sc      = statusColors[b.status] || statusColors.pending;
            const canCancel = b.status === 'pending' || b.status === 'approved';
            const canReview = b.date < todayStr && b.status === 'approved' && !hasReviewed(b.id);
            return (
              <div key={b.id} className="glass-panel" style={{ padding: '1rem 1.25rem', opacity: b.status === 'cancelled' || b.status === 'rejected' ? 0.7 : 1 }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: member?.avatarColor || 'var(--color-anthracite-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem', color: 'white', flexShrink: 0 }}>
                    {member?.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{service?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>with {member?.name}</div>
                  </div>
                  <span style={{ padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '700', backgroundColor: sc.bg, color: sc.color, flexShrink: 0 }}>
                    {sc.label}
                  </span>
                </div>

                {/* Date & Time */}
                <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', marginLeft: '54px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <CalendarDays size={14} />
                    <span>{formatDisplayDate(b.date)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <Clock size={14} />
                    <span>{b.time}{b.endTime ? ` - ${b.endTime}` : ''}</span>
                  </div>
                  {service && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: '700', marginLeft: 'auto' }}>
                      ${service.price}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '0.875rem', paddingTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => navigate('/app/chat')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '500', padding: '0.5rem', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}>
                    <MessageCircle size={15} /> Chat
                  </button>

                  {canReview && (
                    <button
                      onClick={() => setReviewTarget(b)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--color-gold)', fontSize: '0.8rem', fontWeight: '600', padding: '0.5rem', borderRadius: '8px', background: 'rgba(212,175,55,0.1)', cursor: 'pointer' }}
                    >
                      <Star size={15} /> Rate
                    </button>
                  )}

                  {hasReviewed(b.id) && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.78rem', padding: '0.5rem' }}>
                      <Star size={13} fill="var(--color-gold)" color="var(--color-gold)" /> Reviewed
                    </div>
                  )}

                  {canCancel && (
                    <button
                      onClick={() => setCancelTarget(b)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: '600', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--color-danger-bg)', cursor: 'pointer' }}
                    >
                      <XCircle size={15} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Booking Button */}
      <button
        onClick={() => navigate('/app/book')}
        style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-gold)', color: 'var(--color-midnight-dark)', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}
      >
        <Plus size={20} /> Book New Appointment
      </button>

      {/* Modals */}
      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          service={getService(reviewTarget.serviceId)}
          staffMember={getStaff(reviewTarget.staffId)}
          onClose={() => setReviewTarget(null)}
          onSubmit={(data) => addReview({ ...data, customerName })}
        />
      )}
      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          service={getService(cancelTarget.serviceId)}
          onClose={() => setCancelTarget(null)}
          onConfirm={() => { cancelBooking(cancelTarget.id); setCancelTarget(null); }}
        />
      )}
    </div>
  );
}
