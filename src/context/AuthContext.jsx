import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const OWNER_ID = 'owner1';
const OWNER_BASE = { id: OWNER_ID, name: 'Mert Yılmaz', role: 'owner', email: 'mertbusinessco@gmail.com' };
const DEFAULT_OWNER_PIN = '1234';

function loadOwnerPin() {
  try { return localStorage.getItem('bb_owner_pin') || DEFAULT_OWNER_PIN; } catch { return DEFAULT_OWNER_PIN; }
}
function saveOwnerPin(pin) {
  try { localStorage.setItem('bb_owner_pin', pin); } catch { }
}

// Customer identity is persisted between sessions
function loadCustomerProfile() {
  try {
    const raw = localStorage.getItem('bb_customer_profile');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveCustomerProfile(profile) {
  try { localStorage.setItem('bb_customer_profile', JSON.stringify(profile)); } catch { }
}
function clearCustomerProfile() {
  try { localStorage.removeItem('bb_customer_profile'); } catch { }
}

export function AuthProvider({ children }) {
  // Try to restore customer session from last visit
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = loadCustomerProfile();
    return saved ? { ...saved, role: 'customer' } : null;
  });
  const [ownerPin, setOwnerPinState] = useState(loadOwnerPin);

  const setOwnerPin = (pin) => {
    setOwnerPinState(pin);
    saveOwnerPin(pin);
  };

  const loginOwner = (enteredPin) => {
    if (enteredPin === ownerPin) {
      setCurrentUser({ ...OWNER_BASE, role: 'owner' });
      return true;
    }
    return false;
  };

  const loginStaff = (staffMember, enteredPin) => {
    if (enteredPin === (staffMember.pin || '1234')) {
      setCurrentUser({ ...staffMember, role: 'staff', staffId: staffMember.id });
      return true;
    }
    return false;
  };

  // Customer login — saves identity for next visit
  const loginCustomer = (name, phone) => {
    const profile = {
      id: `cust_${phone.replace(/\D/g, '')}`, // stable ID based on phone
      name: name.trim(),
      phone: phone.trim(),
      role: 'customer',
    };
    setCurrentUser(profile);
    saveCustomerProfile(profile);
    return true;
  };

  // Update customer profile (name/phone change)
  const updateCustomerProfile = (name, phone) => {
    if (!currentUser || currentUser.role !== 'customer') return;
    const updated = { ...currentUser, name: name.trim(), phone: phone.trim() };
    setCurrentUser(updated);
    saveCustomerProfile(updated);
  };

  const logout = () => {
    // Only clear persistent session for customers
    if (currentUser?.role === 'customer') clearCustomerProfile();
    setCurrentUser(null);
  };

  // Staff/owner logout — always clear (they never persist)
  const staffLogout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{
      currentUser, setCurrentUser,
      loginOwner, loginStaff, loginCustomer, updateCustomerProfile,
      logout, staffLogout,
      ownerPin, setOwnerPin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
