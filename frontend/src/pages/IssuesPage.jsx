import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import IssueCard from '../components/IssueCard';
import LogIssueModal from '../components/LogIssueModal';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
];

const CATEGORIES = ['All', 'maintenance', 'security', 'amenities', 'sanitation', 'other'];

export default function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort: '-votes', limit: 50 });
      if (filter !== 'all') params.set('status', filter);
      if (catFilter !== 'all') params.set('category', catFilter);
      if (search.trim()) params.set('search', search.trim());
      const res = await api.get(`/issues?${params}`);
      setIssues(res.data.data.issues);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter, catFilter, search]);

  useEffect(() => {
    const t = setTimeout(fetchIssues, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchIssues, search]);

  return (
    <>
      <div className="issues-filters">
        {FILTERS.map(f => (
          <button
            key={f.value}
            className={`filter-tab${filter === f.value ? ' active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
        <select
          className="filter-tab"
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          style={{ background: 'transparent', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
        >
          {CATEGORIES.map(c => <option key={c} value={c === 'All' ? 'all' : c}>{c === 'All' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <div className="search-box">
          <span className="search-ico">⌕</span>
          <input
            placeholder="Search issues…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}>
          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, borderTopColor: 'var(--accent)', borderColor: 'var(--border2)' }} />
        </div>
      ) : issues.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◎</div>
          <div>No issues found</div>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setShowModal(true)}>
            + Log the first one
          </button>
        </div>
      ) : (
        issues.map(issue => (
          <IssueCard key={issue._id} issue={issue} onUpdated={fetchIssues} />
        ))
      )}

      {showModal && (
        <LogIssueModal
          onClose={() => setShowModal(false)}
          onCreated={() => fetchIssues()}
        />
      )}
    </>
  );
}