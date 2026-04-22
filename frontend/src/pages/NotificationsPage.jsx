import { useState } from 'react';

const MOCK_NOTIFS = [
  {
    id: 1, icon: '✓', iconBg: 'var(--green-bg)',
    text: <><b>Water Pump Issue</b> has been resolved! Admin Kavya closed the ticket.</>,
    time: '2 hours ago', unread: true,
  },
  {
    id: 2, icon: '↑', iconBg: 'var(--amber-bg)',
    text: <><b>Gym AC</b> moved to In Progress. Estimated fix: 2 days.</>,
    time: '4 hours ago', unread: true,
  },
  {
    id: 3, icon: '◯', iconBg: 'var(--accent-bg)',
    text: <>Your issue <b>Broken Parking Light</b> received 5 new votes.</>,
    time: 'Yesterday', unread: true,
  },
  {
    id: 4, icon: '⚐', iconBg: 'var(--surface2)',
    text: <>Community meeting on Friday 6PM regarding security enhancements.</>,
    time: '2 days ago', unread: false,
  },
  {
    id: 5, icon: '✓', iconBg: 'var(--surface2)',
    text: <><b>Lift Malfunction Block A</b> resolved in 1.2 days.</>,
    time: '3 days ago', unread: false,
  },
];

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, unread: false })));
  const markRead = (id) => setNotifs(n => n.map(x => x.id === id ? { ...x, unread: false } : x));

  const unreadCount = notifs.filter(n => n.unread).length;

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <div className="card-header">
        <div className="card-title">
          Notifications
          {unreadCount > 0 && (
            <span style={{ marginLeft: 8, background: 'var(--accent)', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <span className="card-action" onClick={markAllRead}>Mark all read</span>
        )}
      </div>
      <div className="notif-list">
        {notifs.map(n => (
          <div key={n.id} className="notif-item" onClick={() => markRead(n.id)}>
            <div className="notif-icon" style={{ background: n.iconBg }}>{n.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="notif-text">{n.text}</div>
              <div className="notif-time">{n.time}</div>
            </div>
            {n.unread && <div className="notif-dot" />}
          </div>
        ))}
      </div>
    </div>
  );
}