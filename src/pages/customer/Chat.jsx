import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Smile } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/StateContext';

// Generate a fake auto-reply after a short delay
const AUTO_REPLIES = [
  "Got it! See you then 👍",
  "Sure, no problem! Let me know if you need anything else.",
  "Perfect! Your appointment is all set. ✂️",
  "Noted! We look forward to seeing you.",
  "Thanks for reaching out! Is there anything else I can help with?",
  "Absolutely, we'll make sure everything is ready for you. 😊",
];

function buildConversations(bookings, services, staff, currentUser) {
  // Build chat threads for each approved/pending booking the customer has
  const myBookings = bookings.filter(b => 
    ((b.customerPhone && b.customerPhone === currentUser?.phone) || b.customerName === currentUser?.name) &&
    b.status !== 'rejected'
  );
  const seen = new Set();
  return myBookings
    .filter(b => {
      if (seen.has(b.staffId)) return false;
      seen.add(b.staffId);
      return true;
    })
    .map(b => {
      const member = staff.find(s => s.id === b.staffId);
      const svc    = services.find(s => s.id === b.serviceId);
      return {
        id: b.staffId,
        staffId: b.staffId,
        barberName: member?.name || 'Barber',
        role: member?.role || '',
        avatarInitials: member?.initials || '??',
        avatarColor: member?.avatarColor || '#5A4A3A',
        service: svc?.name || '',
        time: b.time,
        date: b.date,
        unread: 1,
        messages: [
          {
            id: 'init',
            from: 'barber',
            text: `Hi ${currentUser?.name}! Your ${svc?.name || 'appointment'} is ${b.status === 'approved' ? 'confirmed' : 'pending approval'} for ${new Date(b.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at ${b.time}. Feel free to reach out if you have any questions! ✂️`,
            time: '09:00',
          },
        ],
      };
    });
}

export default function Chat() {
  const { currentUser } = useAuth();
  const { bookings, services, staff } = useAppState();

  const [conversations, setConversations] = useState(() =>
    buildConversations(bookings, services, staff, currentUser)
  );
  const [activeId, setActiveId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const activeConvo = conversations.find(c => c.id === activeId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo?.messages]);

  const openConvo = (convo) => {
    setActiveId(convo.id);
    setConversations(prev => prev.map(c => c.id === convo.id ? { ...c, unread: 0 } : c));
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeId) return;
    const text = newMessage.trim();
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const myMsg = { id: `m${Date.now()}`, from: 'me', text, time };

    setConversations(prev => prev.map(c =>
      c.id === activeId ? { ...c, messages: [...c.messages, myMsg], lastMessage: text } : c
    ));
    setNewMessage('');

    // Auto-reply after 1.2s
    setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const replyTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      const replyMsg = { id: `m${Date.now() + 1}`, from: 'barber', text: reply, time: replyTime };
      setConversations(prev => prev.map(c =>
        c.id === activeId ? { ...c, messages: [...c.messages, replyMsg] } : c
      ));
    }, 1200);
  };

  // ── CHAT DETAIL VIEW ─────────────────────────────────────────
  if (activeConvo) {
    return (
      <div className="chat-screen animate-fade">
        <div className="chat-header">
          <button className="chat-back-btn" onClick={() => setActiveId(null)}>
            <ArrowLeft size={20} />
          </button>
          <div className="chat-barber-info">
            <div className="chat-avatar" style={{ backgroundColor: activeConvo.avatarColor }}>
              {activeConvo.avatarInitials}
            </div>
            <div>
              <div className="chat-barber-name">{activeConvo.barberName}</div>
              <div className="chat-barber-role">{activeConvo.role}</div>
            </div>
          </div>
        </div>

        {/* Appointment banner */}
        <div className="chat-appointment-banner">
          <span>📅</span>
          <span>{activeConvo.service} • {activeConvo.time} • {new Date(activeConvo.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {activeConvo.messages.map(msg => (
            <div key={msg.id} className={`chat-bubble-wrap ${msg.from === 'me' ? 'mine' : 'theirs'}`}>
              {msg.from === 'barber' && (
                <div className="chat-avatar-small" style={{ backgroundColor: activeConvo.avatarColor }}>
                  {activeConvo.avatarInitials}
                </div>
              )}
              <div className={`chat-bubble ${msg.from === 'me' ? 'bubble-mine' : 'bubble-theirs'}`}>
                <p>{msg.text}</p>
                <span className="chat-bubble-time">{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-bar">
          <button style={{ color: 'var(--text-muted)', padding: '0 0.5rem', cursor: 'pointer', display: 'flex' }}>
            <Smile size={20} />
          </button>
          <input
            type="text" className="chat-input"
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button className="chat-send-btn" onClick={sendMessage}>
            <Send size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ── CONVERSATION LIST ─────────────────────────────────────────
  return (
    <div className="animate-fade">
      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Messages</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Chat with your barber about appointments
      </p>

      {conversations.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No conversations yet. Book an appointment to start chatting! ✂️
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {conversations.map(convo => (
            <div key={convo.id} className="glass-panel convo-item" onClick={() => openConvo(convo)}
              style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: convo.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.9rem', color: 'white', flexShrink: 0, position: 'relative' }}>
                {convo.avatarInitials}
                {convo.unread > 0 && (
                  <span style={{ position: 'absolute', top: '-3px', right: '-3px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--color-gold)', fontSize: '0.65rem', fontWeight: '800', color: '#0A0F14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {convo.unread}
                  </span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{convo.barberName}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '0.15rem' }}>
                  {convo.service} • {convo.time}
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                {new Date(convo.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
