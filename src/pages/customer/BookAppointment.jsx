import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Star, ChevronLeft, ChevronRight, Lock, Tag, CheckCircle } from 'lucide-react';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
];

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y, m) { return new Date(y, m, 1).getDay(); }
function toYMD(y, m, d) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

// Check if a slot is already taken (approved or pending)
function isSlotTaken(bookings, date, staffId, slot) {
  return bookings.some(b =>
    b.date === date &&
    b.staffId === staffId &&
    b.status !== 'rejected' &&
    b.time === slot
  );
}

export default function BookAppointment() {
  const { services, staff, bookings, addBookingRequest, validateDiscountCode } = useAppState();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');

  const today = new Date();
  const todayYMD = toYMD(today.getFullYear(), today.getMonth(), today.getDate());
  const [calYear, setCalYear]   = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const totalSteps = 4;
  const goNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const goBack = () => {
    if (step === 1) navigate('/app/booking');
    else setStep(s => s - 1);
  };

  const applyDiscount = () => {
    const dc = validateDiscountCode(discountCode);
    if (!dc) { setDiscountError('Invalid or expired code.'); setAppliedDiscount(null); return; }
    setAppliedDiscount(dc); setDiscountError('');
  };

  const handleConfirm = () => {
    const service = services.find(s => s.id === selectedService);
    const dur = service ? service.duration : 30;
    const [h, m] = selectedTime.split(':').map(Number);
    const endMin = m + dur;
    const endH = h + Math.floor(endMin / 60);
    const endM = endMin % 60;
    const endTime = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;
    const finalPrice = appliedDiscount
      ? (appliedDiscount.type === 'percent'
        ? service.price * (1 - appliedDiscount.discount / 100)
        : service.price - appliedDiscount.discount)
      : null;
    addBookingRequest({
      date: selectedDate, time: selectedTime, endTime,
      serviceId: selectedService, staffId: selectedStaff,
      customerName: currentUser?.name || 'Customer',
      customerPhone: currentUser?.phone || '',
      status: 'pending',
      discountCode: appliedDiscount?.code || null,
      finalPrice: finalPrice ? Math.max(0, Math.round(finalPrice)) : null,
    });
    navigate('/app/booking');
  };

  // Calendar helpers
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay    = getFirstDayOfMonth(calYear, calMonth);
  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  // ── STEP RENDERER ─────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {

      // ── Step 1: Service ───────────────────────────────────────
      case 1:
        return (
          <div className="animate-slide-up">
            <h2 style={h2}>Choose a Service</h2>
            <p style={sub}>Select the service you'd like to book</p>
            <div style={list}>
              {services.map(s => (
                <div key={s.id} onClick={() => { setSelectedService(s.id); goNext(); }}
                  className="glass-panel"
                  style={{ ...card, border: selectedService === s.id ? '1.5px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={emojiBox}>{s.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={cardName}>{s.name}</div>
                    <div style={cardSub}>{s.description}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={price}>${s.price}</div>
                    <div style={cardSub}>⏱ {s.duration}m</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // ── Step 2: Barber ────────────────────────────────────────
      case 2: {
        const svc = services.find(s => s.id === selectedService);
        return (
          <div className="animate-slide-up">
            <h2 style={h2}>Choose Your Barber</h2>
            <p style={sub}>Select a barber for your {svc?.name}</p>
            <div style={list}>
              {staff.map(member => (
                <div key={member.id} onClick={() => { setSelectedStaff(member.id); setSelectedDate(null); setSelectedTime(null); goNext(); }}
                  className="glass-panel"
                  style={{ ...card, gap: '1rem', border: selectedStaff === member.id ? '1.5px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: member.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem', color: 'white', flexShrink: 0 }}>
                    {member.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={cardName}>{member.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-gold)', marginTop: '0.1rem' }}>{member.role}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{member.bio}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-gold)', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 }}>
                    <Star size={13} fill="var(--color-gold)" /> {member.rating}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // ── Step 3: Date & Time ───────────────────────────────────
      case 3:
        return (
          <div className="animate-slide-up">
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <button onClick={prevMonth} style={{ color: 'var(--text-secondary)', padding: '0.25rem', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
              <h3 style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{MONTH_NAMES[calMonth]} {calYear}</h3>
              <button onClick={nextMonth} style={{ color: 'var(--text-secondary)', padding: '0.25rem', cursor: 'pointer' }}><ChevronRight size={20} /></button>
            </div>

            {/* Calendar */}
            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.5rem' }}>
                {DAY_NAMES.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', padding: '0.25rem 0' }}>{d}</div>
                ))}
              </div>
              {/* Day cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const ymd = toYMD(calYear, calMonth, day);
                  const isToday    = ymd === todayYMD;
                  const isPast     = ymd < todayYMD;
                  const isSelected = ymd === selectedDate;
                  return (
                    <button key={day} disabled={isPast} onClick={() => { setSelectedDate(ymd); setSelectedTime(null); }}
                      style={{
                        padding: '0.5rem 0', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', textAlign: 'center', cursor: isPast ? 'not-allowed' : 'pointer',
                        fontWeight: isToday || isSelected ? '700' : '400',
                        backgroundColor: isSelected ? 'var(--color-gold)' : isToday ? 'var(--color-anthracite-light)' : 'transparent',
                        color: isSelected ? '#0A0F14' : isPast ? 'var(--text-muted)' : 'var(--text-primary)',
                        opacity: isPast ? 0.4 : 1, transition: 'all var(--transition-fast)',
                      }}>
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Available Times — {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {TIME_SLOTS.map(t => {
                    const taken    = isSlotTaken(bookings, selectedDate, selectedStaff, t);
                    const selected = selectedTime === t;
                    return (
                      <button key={t} disabled={taken} onClick={() => setSelectedTime(t)}
                        style={{
                          padding: '0.65rem 0', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: '600',
                          cursor: taken ? 'not-allowed' : 'pointer',
                          backgroundColor: selected ? 'var(--color-gold)' : taken ? 'rgba(239,68,68,0.08)' : 'var(--color-anthracite-light)',
                          color: selected ? '#0A0F14' : taken ? 'var(--color-danger)' : 'var(--text-secondary)',
                          border: selected ? 'none' : taken ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.05)',
                          opacity: taken ? 0.55 : 1, transition: 'all var(--transition-fast)',
                          position: 'relative',
                        }}>
                        {taken ? <Lock size={10} style={{ position: 'absolute', top: '4px', right: '4px' }} /> : null}
                        {t}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.875rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--color-gold)', display: 'inline-block' }} /> Selected</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(239,68,68,0.2)', display: 'inline-block' }} /> Booked</span>
                </div>
                {selectedTime && (
                  <button onClick={goNext} style={{ width: '100%', marginTop: '1.25rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-gold)', color: '#0A0F14', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>
                    Continue
                  </button>
                )}
              </>
            )}
          </div>
        );

      // ── Step 4: Confirm ───────────────────────────────────────
      case 4: {
        const svc    = services.find(s => s.id === selectedService);
        const member = staff.find(s => s.id === selectedStaff);
        const displayDate = selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';

        return (
          <div className="animate-slide-up">
            <h2 style={h2}>Confirm Booking</h2>
            <p style={sub}>Review your appointment details</p>

            {/* Summary */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Service', value: svc?.name, sub: `${svc?.duration} min • $${svc?.price}` },
                { label: 'Barber',  value: member?.name, sub: member?.role },
                { label: 'Date',    value: displayDate, sub: null },
                { label: 'Time',    value: selectedTime, sub: null },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{row.label}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>{row.value}</div>
                    {row.sub && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.1rem' }}>{row.sub}</div>}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Total</span>
                <div style={{ textAlign: 'right' }}>
                  {appliedDiscount && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>${svc?.price}</div>
                  )}
                  <span style={{ fontWeight: '700', fontSize: '1.2rem', color: appliedDiscount ? 'var(--color-success)' : 'var(--color-gold)' }}>
                    ${appliedDiscount
                      ? (appliedDiscount.type === 'percent'
                          ? Math.round(svc.price * (1 - appliedDiscount.discount / 100))
                          : Math.max(0, svc.price - appliedDiscount.discount))
                      : svc?.price}
                  </span>
                </div>
              </div>
            </div>

            {/* Discount Code */}
            <div style={{ marginBottom: '1rem' }}>
              {appliedDiscount ? (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--color-success-bg)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle size={18} color="var(--color-success)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-success)' }}>
                      Code "{appliedDiscount.code}" applied!
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {appliedDiscount.type === 'percent' ? `${appliedDiscount.discount}% off` : `$${appliedDiscount.discount} off`}
                    </div>
                  </div>
                  <button onClick={() => { setAppliedDiscount(null); setDiscountCode(''); }} style={{ fontSize: '0.72rem', color: 'var(--color-danger)', cursor: 'pointer' }}>Remove</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Tag size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        value={discountCode}
                        onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(''); }}
                        placeholder="Promo code"
                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '10px', background: 'var(--color-anthracite-light)', border: `1px solid ${discountError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`, color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                        onKeyDown={e => e.key === 'Enter' && applyDiscount()}
                      />
                    </div>
                    <button onClick={applyDiscount} style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--color-gold)', color: '#0A0F14', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Apply
                    </button>
                  </div>
                  {discountError && <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.35rem' }}>{discountError}</div>}
                </div>
              )}
            </div>

            {/* WhatsApp info */}
            {currentUser?.phone && (
              <div style={{ padding: '0.875rem 1rem', borderRadius: '12px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.2rem' }}>💬</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#25D366' }}>WhatsApp Notification</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    A confirmation will be sent to <strong style={{ color: 'var(--text-secondary)' }}>{currentUser.phone}</strong> when approved
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleConfirm} style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-gold)', color: '#0A0F14', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
              Confirm Appointment
            </button>
            <button onClick={() => setStep(3)} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
              Go Back
            </button>
          </div>
        );
      }

      default: return null;
    }
  };

  // Shared styles
  const h2  = { fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' };
  const sub = { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' };
  const list = { display: 'flex', flexDirection: 'column', gap: '0.65rem' };
  const card = { padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all var(--transition-fast)' };
  const emojiBox = { width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-anthracite-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, marginRight: '1rem' };
  const cardName = { fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' };
  const cardSub  = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' };
  const price    = { fontWeight: '700', color: 'var(--color-gold)', fontSize: '1rem' };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={goBack} style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>Book Appointment</h1>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        {Array.from({ length: totalSteps }).map((_, i) => {
          const sNum = i + 1;
          const isDone = step > sNum; const isCurrent = step === sNum;
          return (
            <React.Fragment key={sNum}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '0.78rem', transition: 'all var(--transition-normal)',
                backgroundColor: isDone ? 'var(--color-gold)' : 'var(--color-anthracite-light)',
                color: isDone ? '#0A0F14' : isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                border: isCurrent ? '2px solid var(--color-gold)' : isDone ? 'none' : '2px solid rgba(255,255,255,0.1)',
              }}>
                {isDone ? <Check size={14} strokeWidth={3} /> : sNum}
              </div>
              {i < totalSteps - 1 && (
                <div style={{ flex: 1, height: '2px', backgroundColor: step > sNum + 0.5 ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)', transition: 'background var(--transition-normal)' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {renderStep()}
    </div>
  );
}
