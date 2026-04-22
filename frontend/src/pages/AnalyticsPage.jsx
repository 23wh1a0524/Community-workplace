import { useEffect, useState } from 'react';
import api from '../services/api';

const CAT_COLORS = {
  maintenance: '#6c63ff',
  security: '#ef4444',
  amenities: '#3b82f6',
  sanitation: '#22c55e',
  other: '#888',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function timeAgo(dateStr) {
  if (!dateStr) return 'Unknown';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return 'Today';
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  const wks = Math.floor(days / 7);
  if (wks < 5) return `${wks} week${wks > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 30)} month(s) ago`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics')
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}>
      <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, borderTopColor: 'var(--accent)', borderColor: 'var(--border2)' }} />
    </div>
  );

  if (!data) return <div className="empty-state">Failed to load analytics</div>;

  const { summary, categoryBreakdown, monthlyIssues, recurringIssues, topVoter } = data;
  const total = summary.total || 1;

  // Donut arc calculations
  const R = 28, C = 2 * Math.PI * R;
  const openArc = (summary.open / total) * C;
  const inProgArc = (summary.inProgress / total) * C;
  const resArc = (summary.resolved / total) * C;

  // Monthly bars
  const maxMonthly = Math.max(...monthlyIssues.map(m => m.count), 1);

  return (
    <>
      {/* Summary stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Issues</div>
          <div className="stat-val">{summary.total}</div>
          <div className="stat-change neutral">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Resolution Rate</div>
          <div className="stat-val">{summary.resolutionRate}%</div>
          <div className="stat-change up">↑ vs last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. Resolution</div>
          <div className="stat-val">{summary.avgResolutionDays ? `${summary.avgResolutionDays}d` : '—'}</div>
          <div className="stat-change up">Days to close</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Top Voter</div>
          <div className="stat-val" style={{ fontSize: 14 }}>{topVoter?.user?.name?.split(' ')[0] || '—'}</div>
          <div className="stat-change neutral">{topVoter?.voteCount || 0} votes cast</div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Donut: Status breakdown */}
        <div className="card">
          <div className="card-header"><div className="card-title">Status Breakdown</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={R} fill="none" stroke="var(--surface2)" strokeWidth="10" />
                <circle cx="40" cy="40" r={R} fill="none" stroke="var(--accent)" strokeWidth="10"
                  strokeDasharray={`${openArc} ${C}`} strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
                <circle cx="40" cy="40" r={R} fill="none" stroke="var(--amber)" strokeWidth="10"
                  strokeDasharray={`${inProgArc} ${C}`}
                  strokeDashoffset={-openArc}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
                <circle cx="40" cy="40" r={R} fill="none" stroke="var(--green)" strokeWidth="10"
                  strokeDasharray={`${resArc} ${C}`}
                  strokeDashoffset={-(openArc + inProgArc)}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{summary.total}</span>
                <span style={{ fontSize: 9, color: 'var(--text3)' }}>total</span>
              </div>
            </div>
            <div className="legend-list">
              <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--accent)' }} />Open: {summary.open} ({Math.round(summary.open / total * 100)}%)</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--amber)' }} />In Progress: {summary.inProgress} ({Math.round(summary.inProgress / total * 100)}%)</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--green)' }} />Resolved: {summary.resolved} ({Math.round(summary.resolved / total * 100)}%)</div>
            </div>
          </div>
        </div>

        {/* Monthly report */}
        <div className="card">
          <div className="card-header"><div className="card-title">Monthly Issues</div></div>
          {monthlyIssues.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 12 }}>No monthly data yet</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70 }}>
              {monthlyIssues.slice(-6).map((m, i) => (
                <div key={i} className="monthly-bar-wrap">
                  <div className="monthly-bar" style={{ height: `${Math.max(8, (m.count / maxMonthly) * 52)}px` }} />
                  <div className="monthly-bar-label">{MONTH_NAMES[m._id.month - 1]}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Category Spread
            </div>
            {categoryBreakdown.slice(0, 3).map(c => (
              <div key={c._id} className="resolution-row">
                <span style={{ color: 'var(--text2)', textTransform: 'capitalize' }}>{c._id}</span>
                <span style={{ color: CAT_COLORS[c._id] || 'var(--text2)', fontWeight: 500 }}>{c.count} issues</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recurring Issues */}
      <div className="card">
        <div className="card-header"><div className="card-title">Recurring Issues</div></div>
        {recurringIssues.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 0' }}>No recurring patterns detected yet</div>
        ) : (
          recurringIssues.map((r, i) => (
            <div key={i} className="recurring-row">
              <div className="recurring-count">{r.count}×</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{r._id}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                  {r.category} · Last: {timeAgo(r.lastCreated)}
                </div>
              </div>
              <span className={`tag tag-${r.category}`}>{r.category}</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}