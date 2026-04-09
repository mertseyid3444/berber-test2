import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from './layouts/CustomerLayout';
import StaffLayout from './layouts/StaffLayout';
import { StateProvider } from './context/StateContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth
import Login from './pages/auth/Login';

// Customer Pages
import Home from './pages/customer/Home';
import Booking from './pages/customer/Booking';
import Profile from './pages/customer/Profile';
import Chat from './pages/customer/Chat';
import BookAppointment from './pages/customer/BookAppointment';
import Notifications from './pages/customer/Notifications';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffBookings from './pages/staff/StaffBookings';
import StaffProfile from './pages/staff/StaffProfile';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';

// Role guard — redirect to login if not logged in, or to correct area if wrong role
function RequireAuth({ children, role }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  if (role && currentUser.role !== role) {
    // Redirect to correct area
    if (currentUser.role === 'customer') return <Navigate to="/app" replace />;
    if (currentUser.role === 'staff') return <Navigate to="/staff" replace />;
    if (currentUser.role === 'owner') return <Navigate to="/owner" replace />;
  }
  return children;
}

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Root: Login if not logged in, otherwise redirect to role area */}
      <Route
        path="/"
        element={
          currentUser
            ? currentUser.role === 'customer' ? <Navigate to="/app" replace />
            : currentUser.role === 'staff'    ? <Navigate to="/staff" replace />
            : <Navigate to="/owner" replace />
            : <Login />
        }
      />

      {/* ── CUSTOMER ── */}
      <Route path="/app" element={
        <RequireAuth role="customer">
          <CustomerLayout />
        </RequireAuth>
      }>
        <Route index element={<Home />} />
        <Route path="booking" element={<Booking />} />
        <Route path="book" element={<BookAppointment />} />
        <Route path="chat" element={<Chat />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* ── STAFF ── */}
      <Route path="/staff" element={
        <RequireAuth role="staff">
          <StaffLayout />
        </RequireAuth>
      }>
        <Route index element={<StaffDashboard />} />
        <Route path="bookings" element={<StaffBookings />} />
        <Route path="profile" element={<StaffProfile />} />
      </Route>

      {/* ── OWNER ── */}
      <Route path="/owner" element={
        <RequireAuth role="owner">
          <OwnerDashboard />
        </RequireAuth>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <StateProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </StateProvider>
    </AuthProvider>
  );
}

export default App;
