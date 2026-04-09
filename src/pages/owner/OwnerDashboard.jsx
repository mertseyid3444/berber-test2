import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, DollarSign, BarChart2, Scissors, Plus, Trash2,
  Edit3, Check, X, Star, LogOut, ArrowUpRight, Key,
  Clock, Tag, Users, CalendarCheck, PlusCircle, ChevronDown, ChevronUp,
} from 'lucide-react';

const TABS = [
  { key: 'overview',  label: '📊 Overview'  },
  { key: 'bookings',  label: '📅 Bookings'  },
  { key: 'staff',     label: '👥 Staff'     },
  { key: 'services',  label: '✂️ Services'  },
  { key: 'finances',  label: '💰 Finances'  },
  { key: 'settings',  label: '⚙️ Settings'  },
];

const inputStyle = {
  width: '100%', padding: '0.7rem 0.875rem', borderRadius: '10px',
  background: 'var(--color-anthracite-light)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
};

export default function OwnerDashboard() {
  const { currentUser, logout } = useAuth();
  const {
    bookings, services, staff, reviews, expenses, workingHours, discountCodes,
    setServices, setStaff, updateStaffPin,
    addExpense, updateExpense, deleteExpense,
    setWorkingHours,
    addDiscountCode, toggleDiscountCode, deleteDiscountCode,
  } = useAppState();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');

  // ── Service editing ────────────────────────────────────────────
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editName, setEditName]   = useState('');

  // ── Staff management ───────────────────────────────────────────
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Barber');
  const [editingPinId, setEditingPinId] = useState(null);
  const [newPin, setNewPin]             = useState('');

  // ── Expenses ───────────────────────────────────────────────────
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expLabel, setExpLabel]   = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpLabel, setNewExpLabel]   = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');

  // ── Discount codes ─────────────────────────────────────────────
  const [showAddCode, setShowAddCode] = useState(false);
  const [newCode, setNewCode]         = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [newType, setNewType]         = useState('percent');

  // ── Bookings filter ────────────────────────────────────────────
  const [bookFilter, setBookFilter] = useState('all');

  // ── Computed values ────────────────────────────────────────────
  const todayStr    = new Date().toISOString().split('T')[0];
  const approved    = bookings.filter(b => b.status === 'approved');
  const totalRevenue  = approved.reduce((s, b) => { const sv = services.find(v => v.id === b.serviceId); return s + (sv?.price || 0); }, 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const netProfit     = totalRevenue - totalExpenses;
  const todayRevenue  = approved.filter(b => b.date === todayStr).reduce((s, b) => { const sv = services.find(v => v.id === b.serviceId); return s + (sv?.price || 0); }, 0);

  const getStaffRevenue  = id => approved.filter(b => b.staffId === id).reduce((s, b) => { const sv = services.find(v => v.id === b.serviceId); return s + (sv?.price || 0); }, 0);
  const getStaffBookings = id => approved.filter(b => b.staffId === id).length;

  // ── CRM: unique customers ──────────────────────────────────────
  const customerMap = {};
  bookings.filter(b => b.type === 'app_booking').forEach(b => {
    if (!customerMap[b.customerName]) customerMap[b.customerName] = { name: b.customerName, phone: b.customerPhone, visits: 0, spent: 0 };
    if (b.status === 'approved') {
      customerMap[b.customerName].visits++;
      const sv = services.find(v => v.id === b.serviceId);
      customerMap[b.customerName].spent += sv?.price || 0;
    }
  });
  const customers = Object.values(customerMap).sort((a, b) => b.spent - a.spent);

  // ── Service handlers ───────────────────────────────────────────
  const startEditService = svc => { setEditingServiceId(svc.id); setEditPrice(String(svc.price)); setEditName(svc.name); };
  const saveService      = id  => { setServices(prev => prev.map(s => s.id === id ? { ...s, price: Number(editPrice), name: editName } : s)); setEditingServiceId(null); };

  // ── Staff handlers ─────────────────────────────────────────────
  const removeStaff = id => { if (window.confirm('Remove this staff member?')) setStaff(prev => prev.filter(s => s.id !== id)); };
  const addStaff    = () => {
    if (!newStaffName.trim()) return;
    const initials = newStaffName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const colors   = ['#5A4A3A', '#8B6E4E', '#4A5568', '#553C9A', '#2D6A4F'];
    setStaff(prev => [...prev, { id: `st${Date.now()}`, name: newStaffName, role: newStaffRole, rating: 5.0, reviews: 0, initials, avatarColor: colors[Math.floor(Math.random() * colors.length)], bio: 'New team member', pin: '1234' }]);
    setNewStaffName(''); setShowAddStaff(false);
  };
  const savePin = staffId => {
    if (newPin.length < 4) return alert('PIN must be at least 4 digits.');
    updateStaffPin(staffId, newPin); setEditingPinId(null); setNewPin('');
  };

  // ── Expense handlers ───────────────────────────────────────────
  const startEditExpense = e => { setEditingExpenseId(e.id); setExpLabel(e.label); setExpAmount(String(e.amount)); };
  const saveExpense      = id => { updateExpense(id, { label: expLabel, amount: Number(expAmount) }); setEditingExpenseId(null); };
  const handleAddExpense = () => {
    if (!newExpLabel.trim() || !newExpAmount) return;
    addExpense({ label: newExpLabel, amount: Number(newExpAmount), category: 'variable' });
    setNewExpLabel(''); setNewExpAmount(''); setShowAddExpense(false);
  };

  // ── Working hours handler ──────────────────────────────────────
  const updateDay = (idx, field, val) => {
    setWorkingHours(prev => prev.map((d, i) => i === idx ? { ...d, [field]: val } : d));
  };

  // ── Discount handlers ──────────────────────────────────────────
  const handleAddCode = () => {
    if (!newCode.trim() || !newDiscount) return;
    addDiscountCode({ code: newCode.toUpperCase(), discount: Number(newDiscount), type: newType });
    setNewCode(''); setNewDiscount(''); setShowAddCode(false);
  };

  // ── Filtered bookings ──────────────────────────────────────────
  const filteredBookings = bookFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === bookFilter);

  // ── Helpers ────────────────────────────────────────────────────
  const formatDate = d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const statusBadge = status => {
    const map = { approved: ['var(--color-success-bg)', 'var(--color-success)', 'Confirmed'], pending: ['var(--color-warning-bg)', 'var(--color-warning)', 'Pending'], rejected: ['var(--color-danger-bg)', 'var(--color-danger)', 'Declined'], cancelled: ['rgba(107,114,128,0.15)', 'var(--text-muted)', 'Cancelled'], walk_in: ['rgba(79,142,239,0.1)', '#4F8EEF', 'Walk-in'] };
    const [bg, color, label] = map[status] || map.pending;
    return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: '700', background: bg, color }}>{label}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F14 0%, #121214 100%)', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'rgba(18,18,20,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--color-gold), var(--color-copper))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scissors size={18} color="#0A0F14" />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>BarberBook</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-gold)' }}>Owner Dashboard</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>{currentUser?.name}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-gold)', background: 'rgba(212,175,55,0.1)', padding: '1px 8px', borderRadius: '99px' }}>Owner</div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{ color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><LogOut size={18} /></button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(18,18,20,0.8)', backdropFilter: 'blur(10px)', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ padding: '0.875rem 1.1rem', fontWeight: '600', fontSize: '0.8rem', color: activeTab === tab.key ? 'var(--color-gold)' : 'var(--text-muted)', borderBottom: activeTab === tab.key ? '2px solid var(--color-gold)' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', background: 'none', flexShrink: 0 }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>

        {/* ── OVERVIEW ──────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="animate-fade">
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Overview</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.875rem', marginBottom: '1.25rem' }}>
              {[
                { label: 'Total Revenue',   value: `$${totalRevenue}`,  icon: DollarSign,   color: 'var(--color-gold)',    trend: '+12%' },
                { label: 'Net Profit',       value: `$${netProfit}`,     icon: TrendingUp,   color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)', trend: '' },
                { label: 'Total Bookings',   value: approved.length,     icon: BarChart2,    color: '#4F8EEF',              trend: '+8%' },
                { label: "Today's Revenue",  value: `$${todayRevenue}`,  icon: ArrowUpRight, color: 'var(--color-copper-light)', trend: 'today' },
              ].map((kpi, i) => { const Icon = kpi.icon; return (
                <div key={i} className="glass-panel" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '500' }}>{kpi.label}</div>
                    <Icon size={16} color={kpi.color} />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: kpi.color, marginTop: '0.5rem', lineHeight: 1 }}>{kpi.value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-success)', marginTop: '0.4rem', fontWeight: '600' }}>{kpi.trend}</div>
                </div>
              ); })}
            </div>

            {/* Pending approvals */}
            {bookings.filter(b => b.status === 'pending').length > 0 && (
              <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', borderLeft: '3px solid var(--color-warning)', cursor: 'pointer' }} onClick={() => setActiveTab('bookings')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CalendarCheck size={18} color="var(--color-warning)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {bookings.filter(b => b.status === 'pending').length} Pending Approval{bookings.filter(b => b.status === 'pending').length !== 1 ? 's' : ''}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tap to review bookings</div>
                  </div>
                  <div style={{ padding: '0.25rem 0.75rem', borderRadius: '99px', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', fontWeight: '700', fontSize: '0.75rem' }}>
                    Review →
                  </div>
                </div>
              </div>
            )}

            {/* CRM quick */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                <h3 style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Top Customers</h3>
                <Users size={16} color="var(--text-muted)" />
              </div>
              {customers.slice(0, 4).map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.6rem', marginBottom: '0.6rem', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.visits} visit{c.visits !== 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--color-gold)', fontSize: '0.9rem' }}>${c.spent}</div>
                </div>
              ))}
              {customers.length === 0 && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>No customer data yet</div>}
            </div>
          </div>
        )}

        {/* ── BOOKINGS TAB ──────────────────────────────────────── */}
        {activeTab === 'bookings' && (
          <div className="animate-fade">
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>All Bookings</h1>

            {/* Filter */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginBottom: '1.25rem', paddingBottom: '0.25rem' }}>
              {['all', 'pending', 'approved', 'cancelled', 'rejected'].map(f => (
                <button key={f} onClick={() => setBookFilter(f)} style={{ padding: '0.45rem 0.875rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: '600', whiteSpace: 'nowrap', cursor: 'pointer', background: bookFilter === f ? 'var(--color-gold)' : 'var(--color-anthracite-light)', color: bookFilter === f ? '#0A0F14' : 'var(--text-secondary)', border: 'none', transition: 'all 0.15s' }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[...filteredBookings].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)).map(b => {
                const svc    = services.find(s => s.id === b.serviceId);
                const member = staff.find(s => s.id === b.staffId);
                return (
                  <div key={b.id} className="glass-panel" style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{b.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          {svc?.name} · {member?.name} · {formatDate(b.date)} {b.time}
                        </div>
                        {b.customerPhone && <div style={{ fontSize: '0.72rem', color: '#25D366', marginTop: '0.1rem' }}>📱 {b.customerPhone}</div>}
                        {b.discountCode && <div style={{ fontSize: '0.72rem', color: 'var(--color-gold)', marginTop: '0.1rem' }}>🏷️ {b.discountCode}</div>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        {statusBadge(b.status)}
                        <span style={{ fontWeight: '700', color: 'var(--color-gold)', fontSize: '0.82rem' }}>${b.finalPrice ?? svc?.price ?? 0}</span>
                      </div>
                    </div>
                    {b.note && <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '0.35rem 0.6rem' }}>📝 {b.note}</div>}
                  </div>
                );
              })}
              {filteredBookings.length === 0 && (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings found</div>
              )}
            </div>
          </div>
        )}

        {/* ── STAFF ─────────────────────────────────────────────── */}
        {activeTab === 'staff' && (
          <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>Staff</h1>
              <button onClick={() => setShowAddStaff(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', borderRadius: '10px', background: 'var(--color-gold)', color: '#0A0F14', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                <Plus size={16} /> Add Staff
              </button>
            </div>

            {showAddStaff && (
              <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: '700', marginBottom: '0.875rem', color: 'var(--text-primary)' }}>New Staff Member</h3>
                <input value={newStaffName} onChange={e => setNewStaffName(e.target.value)} placeholder="Full Name" style={{ ...inputStyle, marginBottom: '0.65rem' }} />
                <input value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)} placeholder="Role (e.g. Barber)" style={{ ...inputStyle, marginBottom: '0.875rem' }} />
                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button onClick={addStaff} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                    <Check size={15} /> Save
                  </button>
                  <button onClick={() => setShowAddStaff(false)} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Default PIN: <strong style={{ color: 'var(--color-gold)' }}>1234</strong></div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {staff.map(member => (
                <div key={member.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: member.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem', color: 'white', flexShrink: 0 }}>{member.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{member.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-gold)', marginTop: '0.1rem' }}>{member.role}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem' }}>
                        <Star size={12} fill="var(--color-gold)" color="var(--color-gold)" />
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-gold)', fontWeight: '600' }}>{member.rating}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({member.reviews} reviews)</span>
                      </div>
                    </div>
                    <button onClick={() => removeStaff(member.id)} style={{ color: 'var(--color-danger)', opacity: 0.7, cursor: 'pointer', display: 'flex', padding: '4px' }}>
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {[{ label: 'Bookings', value: getStaffBookings(member.id) }, { label: 'Revenue', value: `$${getStaffRevenue(member.id)}` }, { label: 'Reviews', value: member.reviews }].map((m, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--color-gold)' }}>{m.value}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {editingPinId === member.id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="New PIN (min 4)" type="password" style={{ ...inputStyle, flex: 1, padding: '0.55rem 0.875rem', fontSize: '0.85rem' }} maxLength={8} />
                        <button onClick={() => savePin(member.id)} style={{ padding: '0.55rem 0.875rem', borderRadius: '8px', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontWeight: '700', cursor: 'pointer' }}><Check size={15} /></button>
                        <button onClick={() => { setEditingPinId(null); setNewPin(''); }} style={{ padding: '0.55rem 0.875rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={15} /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingPinId(member.id); setNewPin(''); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem 0' }}>
                        <Key size={13} /> Change PIN (current: ••••)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SERVICES ──────────────────────────────────────────── */}
        {activeTab === 'services' && (
          <div className="animate-fade">
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Services & Pricing</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {services.map(svc => {
                const isEditing = editingServiceId === svc.id;
                return (
                  <div key={svc.id} className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
                    {isEditing ? (
                      <div>
                        <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '0.65rem' }}>
                          <input value={editName} onChange={e => setEditName(e.target.value)} style={{ ...inputStyle, flex: 1, padding: '0.6rem 0.875rem', borderRadius: '8px', fontSize: '0.9rem' }} />
                          <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ ...inputStyle, width: '80px', padding: '0.6rem 0.875rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-gold)' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.65rem' }}>
                          <button onClick={() => saveService(svc.id)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}><Check size={14} /> Save</button>
                          <button onClick={() => setEditingServiceId(null)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '1.5rem' }}>{svc.emoji}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{svc.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{svc.duration} minutes</div>
                        </div>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--color-gold)', marginRight: '0.65rem' }}>${svc.price}</div>
                        <button onClick={() => startEditService(svc)} style={{ color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}><Edit3 size={16} /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FINANCES ──────────────────────────────────────────── */}
        {activeTab === 'finances' && (
          <div className="animate-fade">
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Finances</h1>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '1.25rem' }}>
              {[{ label: 'Revenue', value: `$${totalRevenue}`, color: 'var(--color-success)' }, { label: 'Expenses', value: `-$${totalExpenses}`, color: 'var(--color-danger)' }, { label: 'Profit', value: `${netProfit >= 0 ? '+' : ''}$${netProfit}`, color: netProfit >= 0 ? 'var(--color-gold)' : 'var(--color-danger)' }].map((item, i) => (
                <div key={i} className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontWeight: '800', fontSize: '1.1rem', color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Expenses */}
            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>💸 Monthly Expenses</h3>
                <button onClick={() => setShowAddExpense(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--color-gold)', fontWeight: '600', cursor: 'pointer', padding: '0.35rem 0.75rem', borderRadius: '8px', background: 'rgba(212,175,55,0.1)' }}>
                  <PlusCircle size={14} /> Add
                </button>
              </div>

              {showAddExpense && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem', padding: '0.875rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <input value={newExpLabel} onChange={e => setNewExpLabel(e.target.value)} placeholder="Label (e.g. Marketing)" style={{ ...inputStyle, flex: 2, padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
                  <input type="number" value={newExpAmount} onChange={e => setNewExpAmount(e.target.value)} placeholder="$" style={{ ...inputStyle, width: '70px', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
                  <button onClick={handleAddExpense} style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontWeight: '700', cursor: 'pointer' }}><Check size={14} /></button>
                  <button onClick={() => setShowAddExpense(false)} style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>
                </div>
              )}

              {expenses.map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  {editingExpenseId === e.id ? (
                    <div style={{ display: 'flex', gap: '0.4rem', width: '100%', alignItems: 'center' }}>
                      <input value={expLabel} onChange={ev => setExpLabel(ev.target.value)} style={{ ...inputStyle, flex: 2, padding: '0.5rem 0.65rem', fontSize: '0.85rem' }} />
                      <input type="number" value={expAmount} onChange={ev => setExpAmount(ev.target.value)} style={{ ...inputStyle, width: '70px', padding: '0.5rem 0.65rem', fontSize: '0.85rem' }} />
                      <button onClick={() => saveExpense(e.id)} style={{ padding: '0.5rem 0.65rem', borderRadius: '8px', background: 'var(--color-success-bg)', color: 'var(--color-success)', cursor: 'pointer' }}><Check size={13} /></button>
                      <button onClick={() => setEditingExpenseId(null)} style={{ padding: '0.5rem 0.65rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={13} /></button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-gold)' }} />
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{e.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '700', color: 'var(--color-danger)', fontSize: '0.875rem' }}>-${e.amount}</span>
                        <button onClick={() => startEditExpense(e)} style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}><Edit3 size={13} /></button>
                        <button onClick={() => deleteExpense(e.id)} style={{ color: 'var(--color-danger)', cursor: 'pointer', opacity: 0.6, padding: '2px' }}><Trash2 size={13} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.75rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Total Expenses</span>
                <span style={{ fontWeight: '800', color: 'var(--color-danger)', fontSize: '1rem' }}>-${totalExpenses}</span>
              </div>
            </div>

            {/* Net profit card */}
            <div style={{ padding: '1.25rem', borderRadius: '14px', background: netProfit >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${netProfit >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Net Profit / Loss</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Revenue - Expenses</div>
              </div>
              <div style={{ fontWeight: '800', fontSize: '1.5rem', color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {netProfit >= 0 ? '+' : ''}${netProfit}
              </div>
            </div>

            {/* Discount Codes */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>🏷️ Promo Codes</h3>
                <button onClick={() => setShowAddCode(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--color-gold)', fontWeight: '600', cursor: 'pointer', padding: '0.35rem 0.75rem', borderRadius: '8px', background: 'rgba(212,175,55,0.1)' }}>
                  <PlusCircle size={14} /> New Code
                </button>
              </div>

              {showAddCode && (
                <div style={{ padding: '0.875rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} placeholder="CODE (e.g. SUMMER20)" style={{ ...inputStyle, flex: 1, padding: '0.6rem 0.75rem', fontSize: '0.85rem' }} />
                    <input type="number" value={newDiscount} onChange={e => setNewDiscount(e.target.value)} placeholder="Amt" style={{ ...inputStyle, width: '70px', padding: '0.6rem 0.75rem', fontSize: '0.85rem' }} />
                    <select value={newType} onChange={e => setNewType(e.target.value)} style={{ ...inputStyle, width: '80px', padding: '0.6rem 0.5rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                      <option value="percent">%</option>
                      <option value="fixed">$</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleAddCode} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}><Check size={14} /> Save</button>
                    <button onClick={() => setShowAddCode(false)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}

              {discountCodes.length === 0 && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>No promo codes yet</div>}
              {discountCodes.map(dc => (
                <div key={dc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'monospace' }}>{dc.code}</span>
                      <span style={{ fontSize: '0.7rem', color: dc.active ? 'var(--color-success)' : 'var(--text-muted)', background: dc.active ? 'var(--color-success-bg)' : 'rgba(107,114,128,0.15)', padding: '1px 6px', borderRadius: '99px', fontWeight: '600' }}>{dc.active ? 'Active' : 'Off'}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {dc.type === 'percent' ? `${dc.discount}% off` : `$${dc.discount} off`} · {dc.uses} use{dc.uses !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <button onClick={() => toggleDiscountCode(dc.id)} style={{ fontSize: '0.72rem', fontWeight: '600', color: dc.active ? 'var(--color-warning)' : 'var(--color-success)', cursor: 'pointer', padding: '0.3rem 0.6rem', borderRadius: '6px', background: dc.active ? 'var(--color-warning-bg)' : 'var(--color-success-bg)' }}>
                    {dc.active ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => deleteDiscountCode(dc.id)} style={{ color: 'var(--color-danger)', opacity: 0.6, cursor: 'pointer', padding: '2px' }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SETTINGS ──────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="animate-fade">
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Settings</h1>

            {/* Working Hours */}
            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Clock size={17} color="var(--color-gold)" />
                <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Working Hours</h3>
              </div>
              {workingHours.map((day, idx) => (
                <div key={day.day} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', marginBottom: '0.75rem', borderBottom: idx < workingHours.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: '88px', fontSize: '0.82rem', color: day.open ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: '600', flexShrink: 0 }}>{day.day.slice(0, 3)}</div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', flexShrink: 0 }}>
                    <div
                      onClick={() => updateDay(idx, 'open', !day.open)}
                      style={{ width: '36px', height: '20px', borderRadius: '10px', background: day.open ? 'var(--color-success)' : 'var(--color-anthracite-light)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
                    >
                      <div style={{ position: 'absolute', top: '2px', left: day.open ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: day.open ? 'var(--color-success)' : 'var(--text-muted)', fontWeight: '600' }}>{day.open ? 'Open' : 'Closed'}</span>
                  </label>

                  {day.open && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                      <input type="time" value={day.start} onChange={e => updateDay(idx, 'start', e.target.value)} style={{ ...inputStyle, padding: '0.35rem 0.5rem', fontSize: '0.8rem', flex: 1 }} />
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>–</span>
                      <input type="time" value={day.end} onChange={e => updateDay(idx, 'end', e.target.value)} style={{ ...inputStyle, padding: '0.35rem 0.5rem', fontSize: '0.8rem', flex: 1 }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Analytics */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>📈 Service Popularity</h3>
              {services.map(svc => {
                const count   = bookings.filter(b => b.serviceId === svc.id && b.status === 'approved').length;
                const maxCount = Math.max(...services.map(s => bookings.filter(b => b.serviceId === s.id && b.status === 'approved').length), 1);
                return (
                  <div key={svc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{svc.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{svc.name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count}x</span>
                      </div>
                      <div style={{ height: '5px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '99px', width: `${(count / maxCount) * 100}%`, background: 'var(--color-gold)' }} />
                      </div>
                    </div>
                    <span style={{ fontWeight: '700', color: 'var(--color-gold)', fontSize: '0.82rem', flexShrink: 0 }}>${svc.price * count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
