import React from 'react';
import { useAppState } from '../../context/StateContext';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Star, Clock, Mail, Phone, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { services, staff, workingHours, discountCodes } = useAppState();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Build display format from state
  const DAYS_DISPLAY = [
    { label: 'Mon–Fri', open: workingHours.filter((d,i) => i < 5 && d.open), dayObjs: workingHours.slice(0,5) },
    { label: 'Saturday', obj: workingHours[5] },
    { label: 'Sunday',   obj: workingHours[6] },
  ];

  const activePromo = discountCodes.find(d => d.active);

  return (
    <div className="home-page animate-fade">

      {/* ── HERO ──────────────────────────────── */}
      <div className="hero-section">
        <img
          src="/hero-barbershop.jpg"
          alt="Premium Barbershop"
          className="hero-img"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">
            <span style={{ color: 'var(--text-primary)' }}>Premium </span>
            <span style={{ color: 'var(--color-gold)' }}>Grooming</span>
          </h1>
          <p className="hero-subtitle">Book your next appointment with the best barbers in town</p>
          <button className="hero-btn" onClick={() => navigate('/app/book')}>
            Book Now <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Promo Banner */}
      {activePromo && (
        <div onClick={() => navigate('/app/book')} style={{ margin: '0.875rem 0.875rem 0', padding: '0.75rem 1rem', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(212,175,55,0.15))', border: '1px solid rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <Tag size={18} color="#A855F7" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Special Offer 🎉</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Use code <strong style={{ color: '#A855F7', fontFamily: 'monospace' }}>{activePromo.code}</strong> — {activePromo.type === 'percent' ? `${activePromo.discount}% off` : `$${activePromo.discount} off`}
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" />
        </div>
      )}

      {/* ── SECTION PADDING WRAPPER ───────────── */}
      <div className="home-sections">

        {/* ── OUR SERVICES ─────────────────────── */}
        <section className="home-section">
          <div className="section-header">
            <h2 className="section-title">Our Services</h2>
            <button className="see-all-btn" onClick={() => navigate('/app/book')}>See All</button>
          </div>
          <div className="services-scroll">
            {services.map(s => (
              <div
                key={s.id}
                className="service-card"
                onClick={() => navigate('/app/book')}
              >
                <div className="service-card-emoji">{s.emoji}</div>
                <div className="service-card-name">{s.name}</div>
                <div className="service-card-duration">
                  <Clock size={11} />
                  {s.duration} min
                </div>
                <div className="service-card-price">${s.price}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TOP BARBERS ──────────────────────── */}
        <section className="home-section">
          <div className="section-header">
            <h2 className="section-title">Top Barbers</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {staff.map(member => (
              <div
                key={member.id}
                className="glass-panel barber-list-item"
                onClick={() => navigate('/app/book')}
              >
                <div
                  className="barber-list-avatar"
                  style={{ backgroundColor: member.avatarColor }}
                >
                  {member.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="barber-list-name">{member.name}</div>
                  <div className="barber-list-role">{member.role}</div>
                  <div className="barber-list-rating">
                    <Star size={12} fill="var(--color-gold)" color="var(--color-gold)" />
                    <span>{member.rating}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '2px' }}>
                      ({member.reviews} reviews)
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </section>

        {/* ── WORKING HOURS ────────────────────── */}
        <section className="home-section">
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Working Hours
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Mon–Fri consolidated */}
              {(() => {
                const weekdays = workingHours.slice(0, 5);
                const allOpen = weekdays.every(d => d.open);
                const sameHours = weekdays.every(d => d.start === weekdays[0].start && d.end === weekdays[0].end);
                if (allOpen && sameHours) {
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Mon – Fri</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-gold)' }}>{weekdays[0].start} – {weekdays[0].end}</span>
                    </div>
                  );
                }
                return weekdays.map(d => (
                  <div key={d.day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: d.open ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{d.day}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: d.open ? 'var(--color-gold)' : 'var(--color-danger)' }}>{d.open ? `${d.start} – ${d.end}` : 'Closed'}</span>
                  </div>
                ));
              })()}
              {/* Sat */}
              {(() => { const d = workingHours[5]; return (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: d.open ? 'var(--text-secondary)' : 'var(--text-muted)' }}>Saturday</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: d.open ? 'var(--color-gold)' : 'var(--color-danger)' }}>{d.open ? `${d.start} – ${d.end}` : 'Closed'}</span>
                </div>
              ); })()}
              {/* Sun */}
              {(() => { const d = workingHours[6]; return (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: d.open ? 'var(--text-secondary)' : 'var(--text-muted)' }}>Sunday</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: d.open ? 'var(--color-gold)' : 'var(--color-danger)' }}>{d.open ? `${d.start} – ${d.end}` : 'Closed'}</span>
                </div>
              ); })()}
            </div>
          </div>
        </section>

        {/* ── CONTACT ──────────────────────────── */}
        <section className="home-section">
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              📞 Contact
            </h3>
            <a
              href="mailto:mertbusinessco@gmail.com"
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem', textDecoration: 'none' }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Mail size={17} color="var(--color-gold)" />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>E-posta</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '600', marginTop: '1px' }}>mertbusinessco@gmail.com</div>
              </div>
            </a>
            <a
              href="tel:+905355458644"
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Phone size={17} color="var(--color-success)" />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Telefon</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '600', marginTop: '1px' }}>+90 535 545 86 44</div>
              </div>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
