import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LogIssueModal from './LogIssueModal';

const avatarColors = ['#6c63ff', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];
function getAvatarColor(name = '') {
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
}
function getInitials(name = '') {
  return name.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2);
}

const NAV_ITEMS = [
  { key: 'dashboard', path: '/', label: 'Dashboard', icon: '⊞', roles: ['resident', 'admin'] },
  { key: 'issues', path: '/issues', label: 'Issues', icon: '◎', roles: ['resident', 'admin'], badge: true },
  { key: 'my-issues', path: '/my-issues', label: 'My Issues', icon: '✎', roles: ['resident'] },
  { key: 'analytics', path: '/analytics', label: 'Analytics', icon: '◈', roles: ['admin'], section: 'Admin' },
  { key: 'notifications', path: '/notifications', label: 'Alerts', icon: '◫', roles: ['resident', 'admin'], badgeRed: true, section: 'Account' },
  { key: 'profile', path: '/profile', label: 'Profile', icon: '◯', roles: ['resident', 'admin'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [openCount] = useState(8); // Could be fetched from context/store

  const PAGE_TITLES = {
    '/': ['Dashboard', 'Community overview & activity'],
    '/issues': ['All Issues', 'Browse, search and vote on issues'],
    '/my-issues': ['My Issues', 'Issues you have reported'],
    '/analytics': ['Analytics', 'Admin analytics & reports'],
    '/notifications': ['Notifications', 'Updates on your issues'],
    '/profile': ['Profile', 'Your account & activity'],
  };

  const [title, subtitle] = PAGE_TITLES[location.pathname] || ['CommunityInsight', ''];

  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  // Group nav items by section
  let sections = [{ label: 'Main', items: [] }, { label: 'Account', items: [] }];
  let adminSection = { label: 'Admin', items: [] };
  visibleNav.forEach(item => {
    if (item.section === 'Admin') adminSection.items.push(item);
    else if (item.section === 'Account' || item.key === 'notifications' || item.key === 'profile') sections[1].items.push(item);
    else sections[0].items.push(item);
  });

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">CI</div>
            <div>
              <div className="logo-text">CommunityInsight</div>
              <div className="logo-sub">Sunrise Heights</div>
            </div>
          </div>
        </div>

        <nav className="nav">
          {/* Main section */}
          <div className="nav-section">Main</div>
          {sections[0].items.map(item => (
            <div
              key={item.key}
              className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="nav-badge">{openCount}</span>}
            </div>
          ))}

          {/* Admin section */}
          {adminSection.items.length > 0 && (
            <>
              <div className="nav-section">Admin</div>
              {adminSection.items.map(item => (
                <div
                  key={item.key}
                  className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </>
          )}

          {/* Account section */}
          <div className="nav-section">Account</div>
          {sections[1].items.map(item => (
            <div
              key={item.key}
              className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badgeRed && <span className="nav-badge red">3</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div
              className="avatar avatar-sm"
              style={{ background: getAvatarColor(user?.name) }}
            >
              {getInitials(user?.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div className="user-role">
                {user?.role === 'admin' ? 'Admin · Management' : `Resident${user?.block ? ' · ' + user.block : ''}`}
              </div>
            </div>
            <button
              className="btn-icon"
              onClick={logout}
              title="Logout"
              style={{ width: 24, height: 24, fontSize: 11, border: 'none', background: 'transparent', color: 'var(--text3)', cursor: 'pointer' }}
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <div>
            <div className="page-title">{title}</div>
            <div className="page-sub">
              {subtitle.includes('Welcome') ? `Welcome back, ${user?.name?.split(' ')[0]}` : subtitle}
            </div>
          </div>
          <div className="topbar-actions">
            <button className="btn-icon" title="Search">⌕</button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Log Issue
            </button>
          </div>
        </div>

        <div className="content">
          <Outlet />
        </div>
      </div>

      {showModal && <LogIssueModal onClose={() => setShowModal(false)} />}
    </div>
  );
}