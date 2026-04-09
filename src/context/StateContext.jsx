import React, { createContext, useContext, useState } from 'react';

const StateContext = createContext();

// ── Default / seed data ────────────────────────────────────────────────────
const DEFAULT_SERVICES = [
  { id: 's1', name: 'Kids Haircut',       duration: 20, price: 20,  description: 'Haircut for children under 12',             emoji: '👦' },
  { id: 's2', name: 'Hair Coloring',      duration: 60, price: 70,  description: 'Professional hair coloring and highlights',  emoji: '🎨' },
  { id: 's3', name: 'Hair & Beard Combo', duration: 45, price: 55,  description: 'Complete haircut and beard grooming package', emoji: '💈' },
  { id: 's4', name: 'Hot Shave',          duration: 30, price: 40,  description: 'Traditional hot towel straight razor shave', emoji: '🪒' },
  { id: 's5', name: 'Beard Trim',         duration: 20, price: 25,  description: 'Shape and clean beard grooming',              emoji: '🧔' },
  { id: 's6', name: 'Haircut',            duration: 30, price: 35,  description: 'Classic precision cut & style',               emoji: '✂️' },
];

const DEFAULT_STAFF = [
  { id: 'st1', name: 'Alex Turner',    role: 'Barber',        rating: 4.6, reviews: 64,  initials: 'AT', avatarColor: '#5A4A3A', bio: 'Trendy cuts and precision fades specialist',           pin: '1234' },
  { id: 'st2', name: 'Sofia Chen',     role: 'Hair Stylist',  rating: 4.7, reviews: 85,  initials: 'SC', avatarColor: '#8B6E4E', bio: 'Expert in coloring, styling and modern techniques',     pin: '1234' },
  { id: 'st3', name: 'Jake Rivera',    role: 'Master Barber', rating: 4.8, reviews: 98,  initials: 'JR', avatarColor: '#4A3728', bio: 'Specialist in fades, designs and beard sculpting',      pin: '1234' },
  { id: 'st4', name: 'Marcus Johnson', role: 'Senior Barber', rating: 4.9, reviews: 127, initials: 'MJ', avatarColor: '#3D2B1F', bio: 'Award-winning stylist with 10+ years experience',       pin: '1234' },
];

const todayStr     = new Date().toISOString().split('T')[0];
const upcomingDate = (() => { const d = new Date(); d.setDate(d.getDate() + 6); return d.toISOString().split('T')[0]; })();
const pastDate     = (() => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().split('T')[0]; })();

const DEFAULT_BOOKINGS = [
  { id: 'b1', date: todayStr,     time: '14:00', endTime: '14:30', serviceId: 's6', staffId: 'st1', customerName: 'John Doe',  customerPhone: '+15550000001', status: 'approved', type: 'app_booking', note: '' },
  { id: 'b2', date: todayStr,     time: '15:30', endTime: '15:50', serviceId: 's5', staffId: 'st2', customerName: 'Walk-in',   customerPhone: '',             status: 'approved', type: 'walk_in',    note: '' },
  { id: 'b3', date: upcomingDate, time: '09:30', endTime: '10:30', serviceId: 's2', staffId: 'st1', customerName: 'Customer',  customerPhone: '+905355458644', status: 'pending',  type: 'app_booking', note: '' },
  { id: 'b4', date: pastDate,     time: '20:00', endTime: '20:45', serviceId: 's3', staffId: 'st2', customerName: 'Customer',  customerPhone: '+905355458644', status: 'approved', type: 'app_booking', note: '' },
];

const DEFAULT_EXPENSES = [
  { id: 'e1', label: 'Rent',      amount: 80,  category: 'fixed'    },
  { id: 'e2', label: 'Supplies',  amount: 32,  category: 'variable' },
  { id: 'e3', label: 'Utilities', amount: 15,  category: 'fixed'    },
  { id: 'e4', label: 'Other',     amount: 9,   category: 'variable' },
];

const DEFAULT_WORKING_HOURS = [
  { day: 'Monday',    open: true,  start: '09:00', end: '20:00' },
  { day: 'Tuesday',   open: true,  start: '09:00', end: '20:00' },
  { day: 'Wednesday', open: true,  start: '09:00', end: '20:00' },
  { day: 'Thursday',  open: true,  start: '09:00', end: '20:00' },
  { day: 'Friday',    open: true,  start: '09:00', end: '20:00' },
  { day: 'Saturday',  open: true,  start: '10:00', end: '18:00' },
  { day: 'Sunday',    open: false, start: '10:00', end: '16:00' },
];

const DEFAULT_DISCOUNT_CODES = [
  { id: 'dc1', code: 'WELCOME10', discount: 10, type: 'percent', active: true, uses: 0 },
];

// ── LocalStorage helpers ───────────────────────────────────────────────────
function load(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
  catch { return def; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* noop */ }
}

// ── Provider ───────────────────────────────────────────────────────────────
export function StateProvider({ children }) {
  const [services,       setServicesState]       = useState(() => load('bb_services',       DEFAULT_SERVICES));
  const [staff,          setStaffState]           = useState(() => load('bb_staff',          DEFAULT_STAFF));
  const [bookings,       setBookingsState]        = useState(() => load('bb_bookings',       DEFAULT_BOOKINGS));
  const [reviews,        setReviewsState]         = useState(() => load('bb_reviews',        []));
  const [notifications,  setNotificationsState]   = useState(() => load('bb_notifications',  []));
  const [expenses,       setExpensesState]        = useState(() => load('bb_expenses',       DEFAULT_EXPENSES));
  const [workingHours,   setWorkingHoursState]    = useState(() => load('bb_working_hours',  DEFAULT_WORKING_HOURS));
  const [discountCodes,  setDiscountCodesState]   = useState(() => load('bb_discount_codes', DEFAULT_DISCOUNT_CODES));

  // ── Persist helpers ───────────────────────────────────────────────────────
  const makeSet = (key, setter) => (updater) => {
    setter(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      save(key, next);
      return next;
    });
  };

  const setServices      = makeSet('bb_services',       setServicesState);
  const setStaff         = makeSet('bb_staff',          setStaffState);
  const setBookings      = makeSet('bb_bookings',       setBookingsState);
  const setReviews       = makeSet('bb_reviews',        setReviewsState);
  const setNotifications = makeSet('bb_notifications',  setNotificationsState);
  const setExpenses      = makeSet('bb_expenses',       setExpensesState);
  const setWorkingHours  = makeSet('bb_working_hours',  setWorkingHoursState);
  const setDiscountCodes = makeSet('bb_discount_codes', setDiscountCodesState);

  // ── Booking actions ───────────────────────────────────────────────────────
  const addBookingRequest = (bookingDetails) => {
    const newBooking = {
      id: `b${Date.now()}`,
      status: 'pending',
      type: 'app_booking',
      customerName: 'Customer',
      customerPhone: '',
      note: '',
      ...bookingDetails,
    };
    setBookings(prev => [...prev, newBooking]);
    // Notify customer
    addNotification({
      type: 'booking_sent',
      title: 'Booking Request Sent',
      body: `Your appointment request has been submitted and is awaiting approval.`,
      bookingId: newBooking.id,
      customerPhone: newBooking.customerPhone,
      customerName: newBooking.customerName
    });
    return newBooking;
  };

  const addWalkIn = (walkInDetails) => {
    const newBooking = {
      id: `wi${Date.now()}`,
      status: 'approved',
      type: 'walk_in',
      customerName: walkInDetails.customerName || 'Walk-in',
      customerPhone: '',
      note: '',
      ...walkInDetails,
    };
    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  };

  const updateBookingStatus = (id, newStatus) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      // Add notification for customer
      if (newStatus === 'approved') {
        addNotification({ type: 'booking_approved', title: 'Booking Confirmed! ✅', body: `Your appointment has been confirmed.`, bookingId: id, customerPhone: b.customerPhone, customerName: b.customerName });
      } else if (newStatus === 'rejected') {
        addNotification({ type: 'booking_rejected', title: 'Booking Declined ❌', body: `Unfortunately your appointment request was declined. Please try another time.`, bookingId: id, customerPhone: b.customerPhone, customerName: b.customerName });
      } else if (newStatus === 'cancelled') {
        addNotification({ type: 'booking_cancelled', title: 'Booking Cancelled', body: `Your appointment has been cancelled.`, bookingId: id, customerPhone: b.customerPhone, customerName: b.customerName });
      }
      return { ...b, status: newStatus };
    }));
  };

  const cancelBooking = (id) => updateBookingStatus(id, 'cancelled');

  const updateBookingNote = (id, note) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, note } : b));
  };

  const deleteBooking = (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  // ── Staff actions ─────────────────────────────────────────────────────────
  const updateStaffPin = (staffId, newPin) => {
    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, pin: newPin } : s));
  };

  // ── Review actions ────────────────────────────────────────────────────────
  const addReview = (reviewData) => {
    const newReview = { id: `r${Date.now()}`, createdAt: new Date().toISOString(), ...reviewData };
    setReviews(prev => [...prev, newReview]);
    // Update staff rating
    setStaff(prev => prev.map(s => {
      if (s.id !== reviewData.staffId) return s;
      const staffReviews = [...reviews, newReview].filter(r => r.staffId === s.id);
      const avg = staffReviews.reduce((sum, r) => sum + r.rating, 0) / staffReviews.length;
      return { ...s, rating: Math.round(avg * 10) / 10, reviews: staffReviews.length };
    }));
    addNotification({ type: 'review_thanks', title: 'Thanks for your review! ⭐', body: `Your feedback helps us improve our service.`, customerPhone: reviewData.customerPhone, customerName: reviewData.customerName });
    return newReview;
  };

  // ── Notification actions ──────────────────────────────────────────────────
  const addNotification = (data) => {
    const n = { id: `n${Date.now()}`, read: false, createdAt: new Date().toISOString(), ...data };
    setNotifications(prev => {
      const next = [n, ...prev].slice(0, 50); // keep last 50
      save('bb_notifications', next);
      return next;
    });
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // ── Expense actions ───────────────────────────────────────────────────────
  const addExpense = (data) => {
    const e = { id: `e${Date.now()}`, ...data };
    setExpenses(prev => [...prev, e]);
  };

  const updateExpense = (id, data) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // ── Discount code actions ─────────────────────────────────────────────────
  const validateDiscountCode = (code) => {
    const dc = discountCodes.find(d => d.code.toUpperCase() === code.toUpperCase() && d.active);
    if (!dc) return null;
    setDiscountCodes(prev => prev.map(d => d.id === dc.id ? { ...d, uses: d.uses + 1 } : d));
    return dc;
  };

  const addDiscountCode = (data) => {
    setDiscountCodes(prev => [...prev, { id: `dc${Date.now()}`, uses: 0, active: true, ...data }]);
  };

  const toggleDiscountCode = (id) => {
    setDiscountCodes(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));
  };

  const deleteDiscountCode = (id) => {
    setDiscountCodes(prev => prev.filter(d => d.id !== id));
  };

  // ── Loyalty points ────────────────────────────────────────────────────────
  // Points are derived from approved bookings: 10 pts per $10 spent (1 pt/$)
  const getLoyaltyPoints = (customerIdentity) => {
    if (!customerIdentity) return 0;
    const pts = bookings
      .filter(b => 
        (customerIdentity.phone && b.customerPhone === customerIdentity.phone) ||
        b.customerName === customerIdentity.name
      )
      .filter(b => b.status === 'approved')
      .reduce((sum, b) => {
        const svc = services.find(s => s.id === b.serviceId);
        return sum + (svc?.price || 0);
      }, 0);
    return pts; // 1 point per $1 spent
  };

  return (
    <StateContext.Provider value={{
      // State
      services, staff, bookings, reviews, notifications, expenses, workingHours, discountCodes,
      // Setters
      setServices, setStaff, setWorkingHours,
      // Booking actions
      addBookingRequest, addWalkIn, updateBookingStatus, cancelBooking, updateBookingNote, deleteBooking,
      // Staff
      updateStaffPin,
      // Reviews
      addReview,
      // Notifications
      addNotification, markNotificationRead, markAllRead,
      // Expenses
      addExpense, updateExpense, deleteExpense,
      // Discounts
      validateDiscountCode, addDiscountCode, toggleDiscountCode, deleteDiscountCode,
      // Loyalty
      getLoyaltyPoints,
    }}>
      {children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  return useContext(StateContext);
}
