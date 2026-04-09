import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/StateContext';
import { Scissors, User, ChevronRight, Phone, ArrowLeft, Eye, EyeOff, Lock, Shield } from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '0.85rem 1.1rem', borderRadius: '12px',
  background: 'rgba(45,45,49,0.8)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
  transition: 'border 0.15s',
};

const btnGold = {
  width: '100%', padding: '0.9rem', borderRadius: '12px',
  background: 'var(--color-gold)', color: '#0A0F14',
  fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer',
  border: 'none', transition: 'opacity 0.15s',
};

function Logo() {
  return (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '60px', height: '60px', borderRadius: '16px', marginBottom: '0.875rem',
        background: 'linear-gradient(135deg, var(--color-gold), var(--color-copper))',
        boxShadow: '0 8px 24px rgba(212,175,55,0.3)',
      }}>
        <Scissors size={28} color="#0A0F14" />
      </div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
        BarberBook
      </h1>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
        Premium Salon Management Platform
      </p>
    </div>
  );
}

function CustomerLogin({ onLogin }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [err, setErr] = useState('');
  
  const submit = () => {
    if (!name.trim()) return setErr('Please enter your name.');
    if (!phone.trim() || phone.length < 7) return setErr('Please enter a valid phone number.');
    setErr('');
    onLogin(name, phone);
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(79,142,239,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={18} color="#4F8EEF" />
        </div>
        <div>
          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Welcome to BarberBook</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enter your details to book your appointment</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>Full Name</label>
          <div style={{ position: 'relative' }}>
            <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe"
              style={{ ...inputStyle, paddingLeft: '2.75rem' }} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>Phone Number</label>
          <div style={{ position: 'relative' }}>
            <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+90 535 545 86 44"
              type="tel" style={{ ...inputStyle, paddingLeft: '2.75rem' }} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>📱 A confirmation will be sent when your booking is approved</div>
        </div>
      </div>
      {err && <div style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{err}</div>}
      <button onClick={submit} style={btnGold}>Continue</button>
    </div>
  );
}

function StaffSelect({ onBack, onSelect, staffList, onOwnerSelect }) {
  return (
    <div className="animate-fade">
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.85rem', cursor: 'pointer', background: 'none', border: 'none' }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.35rem' }}>Staff Login</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Select your profile to continue</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
        {staffList.map(member => (
          <button key={member.id} onClick={() => onSelect(member)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              padding: '0.875rem 1rem', borderRadius: '12px',
              background: 'rgba(31,41,55,0.5)', border: '1.5px solid rgba(255,255,255,0.07)',
              cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(31,41,55,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
          >
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%', backgroundColor: member.avatarColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '0.85rem', color: 'white', flexShrink: 0,
            }}>{member.initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{member.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', marginTop: '0.1rem' }}>{member.role}</div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
        <button onClick={onOwnerSelect} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', background: 'none', border: 'none', width: '100%', justifyContent: 'center' }}>
          <Shield size={14} /> Shop Owner Login
        </button>
      </div>
    </div>
  );
}

function PinEntry({ onBack, onLogin, label, subtitle, accentColor }) {
  const [pin, setPin] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const submit = () => {
    if (!pin) return setErr('Please enter your PIN.');
    const ok = onLogin(pin);
    if (!ok) { setErr('Incorrect PIN. Please try again.'); setPin(''); }
  };
  return (
    <div className="animate-fade">
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.85rem', cursor: 'pointer', background: 'none', border: 'none' }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${accentColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lock size={18} color={accentColor} />
        </div>
        <div>
          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{label}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</div>
        </div>
      </div>
      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>PIN Code</label>
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          value={pin} onChange={e => setPin(e.target.value)}
          type={show ? 'text' : 'password'} placeholder="Enter your PIN"
          style={{ ...inputStyle, paddingLeft: '2.75rem', paddingRight: '2.75rem', letterSpacing: show ? '0' : '0.25em' }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          autoFocus
        />
        <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {err && <div style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{err}</div>}
      <button onClick={submit} style={{ ...btnGold, background: accentColor, color: accentColor === '#D4AF37' ? '#0A0F14' : 'white' }}>
        Sign In
      </button>
    </div>
  );
}

export default function Login() {
  const { loginOwner, loginStaff, loginCustomer } = useAuth();
  const { staff } = useAppState();
  const navigate = useNavigate();
  // steps: 'customer' | 'staff-select' | 'staff-pin' | 'owner-pin'
  const [step, setStep] = useState('customer');
  const [selectedStaff, setSelectedStaff] = useState(null);

  const handleCustomerLogin = (name, phone) => {
    loginCustomer(name, phone);
    navigate('/app');
  };

  const handleStaffPin = (pin) => {
    const ok = loginStaff(selectedStaff, pin);
    if (ok) navigate('/staff');
    return ok;
  };

  const handleOwnerPin = (pin) => {
    const ok = loginOwner(pin);
    if (ok) navigate('/owner');
    return ok;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0F14 0%, #121214 50%, #1A1A1D 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.5rem',
    }}>
      <Logo />

      <div style={{ width: '100%', maxWidth: '380px' }}>
        {step === 'customer' && <CustomerLogin onLogin={handleCustomerLogin} />}
        {step === 'staff-select' && <StaffSelect onBack={() => setStep('customer')} onSelect={s => { setSelectedStaff(s); setStep('staff-pin'); }} staffList={staff} onOwnerSelect={() => setStep('owner-pin')} />}
        {step === 'staff-pin' && (
          <PinEntry
            onBack={() => setStep('staff-select')}
            onLogin={handleStaffPin}
            label={`Welcome, ${selectedStaff?.name}`}
            subtitle="Enter your PIN to sign in"
            accentColor="#10B981"
          />
        )}
        {step === 'owner-pin' && (
          <PinEntry
            onBack={() => setStep('staff-select')}
            onLogin={handleOwnerPin}
            label="Shop Owner"
            subtitle="Enter your owner PIN to sign in"
            accentColor="#D4AF37"
          />
        )}
      </div>

      {/* Hidden Staff Trigger */}
      {step === 'customer' && (
        <button onClick={() => setStep('staff-select')} style={{ marginTop: '2rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.1)', fontSize: '0.75rem', cursor: 'pointer', opacity: 0.5 }}>
          Staff Area
        </button>
      )}
    </div>
  );
}
