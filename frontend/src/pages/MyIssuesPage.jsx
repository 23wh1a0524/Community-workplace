import { useEffect, useState } from 'react';
import api from '../services/api';
import IssueCard from '../components/IssueCard';

export default function MyIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyIssues = async () => {
    setLoading(true);
    try {
      const res = await api.get('/issues/my');
      setIssues(res.data.data.issues);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyIssues(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}>
      <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, borderTopColor: 'var(--accent)', borderColor: 'var(--border2)' }} />
    </div>
  );

  if (issues.length === 0) return (
    <div className="empty-state">
      <div className="empty-icon">✎</div>
      <div>You haven't logged any issues yet</div>
      <div style={{ marginTop: 6, fontSize: 12 }}>Use "+ Log Issue" in the top bar to get started</div>
    </div>
  );

  return (
    <>
      <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--text3)' }}>
        {issues.length} issue{issues.length !== 1 ? 's' : ''} logged by you
      </div>
      {issues.map(issue => (
        <IssueCard key={issue._id} issue={issue} onUpdated={fetchMyIssues} />
      ))}
    </>
  );
}