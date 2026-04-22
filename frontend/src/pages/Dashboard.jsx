import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { statusClass, statusLabel, catClass } from '../components/IssueCard';

const CAT_COLORS = {
  maintenance: '#6c63ff',
  security: '#ef4444',
  amenities: '#3b82f6',
  sanitation: '#22c55e',
  other: '#888',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, avgDays: 0 });
  const [topIssues, setTopIssues] = useState([]);
  const [catBreakdown, setCatBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [issuesRes, analyticsRes] = await Promise.all([
        api.get('/issues?sort=-votes&limit=3&status=open'),
        user?.role === 'admin' ? api.get('/analytics') : Promise.resolve(null),
      ]);

      setTopIssues(issuesRes.data.data.issues);

      if (analyticsRes) {
        const d = analyticsRes.data.data;
        setStats({ open: d.summary.open, inProgress: d.summary.inProgress, resolved: d.summary.resolved, avgDays: d.summary.avgResolutionDays });
        const maxCat = Math.max(...d.categoryBreakdown.map(c => c.count), 1);
        setCatBreakdown(d.categoryBreakdown.map(c => ({ ...c, pct: Math.round((c.count / maxCat) * 100) })));
      } else {
        // For residents: get basic counts from issue list
        const allRes = await api.get('/issues?limit=100');
        const issues = allRes.data.data.issues;
        setStats({
          open: issues.filter(i => i.status === 'open').length,
          inProgress: issues.filter(i => i.status === 'in_progress').length,
          resolved: issues.filter(i => i.status === 'resolved').length,
          avgDays: 0,
        });
        const cats = {};
        issues.forEach(i => { cats[i.category] = (cats[i.category] || 0) + 1; });
        const maxC = Math.max(...Object.values(cats), 1);
        setCatBreakdown(Object.entries(cats).map(([_id, count]) => ({ _id, count, pct: Math.round((count / maxC) * 100) })).sort((a, b) => b.count - a.count));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
      <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, borderTopColor: 'var(--accent)', borderColor: 'var(--border2)' }} />
    </div>
  );

  return (
    <>
      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card accent-top">
          <div className="stat-label">Open Issues</div>
          <div className="stat-val">{stats.open}</div>
          <div className="stat-change up">Active reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-val">{stats.inProgress}</div>
          <div className="stat-change neutral">Active resolutions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Resolved</div>
          <div className="stat-val">{stats.resolved}</div>
          <div className="stat-change up">Total closed</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. Resolution</div>
          <div className="stat-val">{stats.avgDays ? `${stats.avgDays}d` : '—'}</div>
          <div className="stat-change neutral">Days to resolve</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Top Voted Issues */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Top Voted Issues</div>
            <span className="card-action" onClick={() => navigate('/issues')}>View all →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topIssues.length === 0 && <div className="empty-state" style={{ padding: 20 }}>No open issues</div>}
            {topIssues.map(issue => (
              <div key={issue._id} className="issue-item" onClick={() => navigate('/issues')}>
                <div className="issue-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="issue-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {issue.title}
                    </div>
                    <div className="issue-meta" style={{ marginTop: 4 }}>
                      <span className={`tag ${statusClass(issue.status)}`}>{statusLabel(issue.status)}</span>
                      <span className={`tag ${catClass(issue.category)}`}>{issue.category}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>
                      {issue.votes}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text3)' }}>votes</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Issues by Category</div>
          </div>
          <div className="bar-chart" style={{ marginTop: 4 }}>
            {catBreakdown.length === 0 && <div style={{ color: 'var(--text3)', fontSize: 12 }}>No data yet</div>}
            {catBreakdown.map(cat => (
              <div key={cat._id} className="bar-row">
                <span className="bar-label" style={{ textTransform: 'capitalize' }}>{cat._id}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${cat.pct}%`, background: CAT_COLORS[cat._id] || '#888' }}
                  />
                </div>
                <span className="bar-val">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header"><div className="card-title">Recent Activity</div></div>
        <div className="activity-list">
          {[
            { color: 'var(--green)', text: <><b>Water Pump Issue</b> was marked <b>Resolved</b> by Admin Kavya</>, time: '2h ago' },
            { color: 'var(--accent)', text: <>Ravi K. logged <b>Broken Gate Latch — Block C</b> with 2 attachments</>, time: '4h ago' },
            { color: 'var(--amber)', text: <><b>Gym AC Not Working</b> moved to <b>In Progress</b></>, time: 'Yesterday' },
            { color: 'var(--accent)', text: <>You voted on <b>Parking Area Lights</b> — now #2 priority</>, time: 'Yesterday' },
            { color: 'var(--green)', text: <><b>Lift Malfunction Block A</b> resolved in 1.2 days</>, time: '2 days ago' },
          ].map((a, i) => (
            <div key={i} className="activity-item">
              <div className="activity-dot" style={{ background: a.color }} />
              <div>
                <div className="activity-text">{a.text}</div>
                <div className="activity-time">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}