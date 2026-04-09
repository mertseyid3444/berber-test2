import React from 'react';
import { useAppState } from '../../context/StateContext';

export default function Calendar() {
  const { bookings, updateBookingStatus } = useAppState();

  const handleApprove = (id) => updateBookingStatus(id, 'approved');
  const handleReject = (id) => updateBookingStatus(id, 'rejected');

  return (
    <div className="animate-fade" style={{ display: 'flex', gap: '2rem', height: '100%' }}>
      
      {/* Appointment List / Agenda View */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--color-gold)' }}>Centralized Calendar</h2>
        
        <div className="glass-panel" style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
          {bookings.map(booking => {
            const isPending = booking.status === 'pending';
            const isWalkIn = booking.type === 'walk_in';
            
            return (
              <div key={booking.id} style={{
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-anthracite-dark)',
                borderLeft: `4px solid ${isPending ? 'var(--color-warning)' : isWalkIn ? 'var(--color-copper)' : 'var(--color-success)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{booking.time} - {booking.customerName}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {isWalkIn ? 'Walk-in' : 'App Booking'} • Barber ID: {booking.staffId}
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    backgroundColor: isPending ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
                    color: isPending ? 'var(--color-warning)' : 'var(--color-success)',
                    fontWeight: 'bold'
                  }}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                {/* Actions for Pending Requests */}
                {isPending && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button 
                      onClick={() => handleApprove(booking.id)}
                      style={{ padding: '0.5rem 1rem', background: 'var(--color-success)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 'bold' }}
                    >
                      Approve Request
                    </button>
                    <button 
                      onClick={() => handleReject(booking.id)}
                      style={{ padding: '0.5rem 1rem', background: 'var(--color-danger)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 'bold' }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          
          {bookings.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No appointments scheduled.</p>}
        </div>
      </div>
      
      {/* Side Panel (Visual Timetable Mock) */}
      <div className="glass-panel" style={{ width: '350px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>Today's Timeline</h3>
        <div style={{ flex: 1, position: 'relative', borderLeft: '2px solid var(--color-anthracite-light)', paddingLeft: '1.5rem', marginLeft: '0.5rem' }}>
           {['10:00', '12:00', '14:00', '16:00', '18:00'].map(hour => (
             <div key={hour} style={{ marginBottom: '2.5rem', position: 'relative' }}>
               <div style={{ position: 'absolute', left: '-2.2rem', top: '-0.3rem', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-gold)' }}></div>
               <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{hour}</div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
