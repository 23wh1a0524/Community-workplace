import { useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function LogIssueModal({ onClose, onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', category: 'maintenance', description: '' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.trim().length < 5) e.title = 'Min 5 characters';
    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.trim().length < 10) e.description = 'Min 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('category', form.category);
      fd.append('description', form.description.trim());
      files.forEach(f => fd.append('attachments', f));

      const res = await api.post('/issues', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast('Issue logged successfully!', 'success');
      onCreated?.(res.data.data.issue);
      onClose();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create issue', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Log New Issue</div>

        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            className="form-input"
            placeholder="Brief description of the issue…"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          {errors.title && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.title}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-input form-select"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          >
            <option value="maintenance">Maintenance</option>
            <option value="security">Security</option>
            <option value="amenities">Amenities</option>
            <option value="sanitation">Sanitation</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Describe the issue in detail…"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          {errors.description && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.description}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Attachments (optional)</label>
          <input
            className="form-input"
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={e => setFiles(Array.from(e.target.files))}
            style={{ padding: '6px 12px', cursor: 'pointer' }}
          />
          {files.length > 0 && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Submit Issue'}
          </button>
        </div>
      </div>
    </div>
  );
}