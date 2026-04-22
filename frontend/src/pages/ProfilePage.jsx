import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const avatarColors = ['#6c63ff', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];
function getAvatarColor(name = '') { return avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]; }
function getInitials(name = '') { return (name || '?').split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2); }

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', block: user?.block || '', unit: user?.unit || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put('/users/profile', form);
      updateUser(res.data.data.user);
      toast('Profile updated!', 'success');
      setEditing(false);
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'Jan 2024';

  return (
    <div style={{ maxWidth: 480 }}>
      {/* Header */}
      <div className="profile-header">
        <div className="avatar avatar-lg" style={{ background: getAvatarColor(user?.name) }}>
          {getInitials(user?.name)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>{user?.email}</div>
          <span
            className="badge-pill"
            style={{
              background: isAdmin ? 'var(--green-bg)' : 'var(--accent-bg)',
              color: isAdmin ? 'var(--green)' : 'var(--accent2)',
            }}
          >
            {isAdmin ? 'Admin' : 'Resident'}
          </span>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setEditing(!editing);
            setForm({ name: user?.name || '', block: user?.block || '', unit: user?.unit || '' });
          }}
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-header"><div className="card-title">Edit Profile</div></div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Block</label>
              <input
                className="form-input"
                placeholder="Block B"
                value={form.block}
                onChange={e => setForm(f => ({ ...f, block: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <input
                className="form-input"
                placeholder="B-204"
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              />
            </div>
          </div>
          <div className="modal-actions" style={{ marginTop: 0 }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-header"><div className="card-title">Details</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Block', value: user?.block || '—' },
            { label: 'Unit', value: user?.unit || '—' },
            { label: 'Member since', value: joinedDate },
            { label: 'Community', value: 'Sunrise Heights' },
            { label: 'Role', value: isAdmin ? 'Administrator' : 'Resident' },
            { label: 'Email', value: user?.email },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, color: 'var(--text)', wordBreak: 'break-all' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="card">
        <div className="card-header"><div className="card-title">My Activity</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
          {[
            { num: '—', label: 'Issues Logged', color: 'var(--accent)' },
            { num: '—', label: 'Votes Cast', color: 'var(--green)' },
            { num: '—', label: 'Resolved', color: 'var(--amber)' },
          ].map(({ num, label, color }) => (
            <div key={label}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 600, color }}>{num}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 10, textAlign: 'center' }}>
          Activity stats coming in Phase 2
        </div>
      </div>
    </div>
  );
}