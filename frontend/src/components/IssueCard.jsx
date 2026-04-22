import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const avatarColors = ['#6c63ff', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];
function getAvatarColor(name = '') { return avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]; }
function getInitials(name = '') { return (name || '?').split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2); }

export function statusClass(s) {
  return s === 'open' ? 'tag-open' : s === 'in_progress' ? 'tag-progress' : 'tag-resolved';
}
export function statusLabel(s) {
  return s === 'open' ? 'Open' : s === 'in_progress' ? 'In Progress' : 'Resolved';
}
export function catClass(c) { return `tag-${c}`; }

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function IssueCard({ issue, onUpdated, compact = false }) {
  const { user } = useAuth();
  const toast = useToast();
  const [votes, setVotes] = useState(issue.votes);
  const [hasVoted, setHasVoted] = useState(issue.hasVoted);
  const [loadingVote, setLoadingVote] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const handleVote = async (e) => {
    e.stopPropagation();
    if (loadingVote) return;
    setLoadingVote(true);
    try {
      const res = await api.post(`/issues/${issue._id}/vote`);
      setVotes(res.data.data.votes);
      setHasVoted(res.data.data.hasVoted);
    } catch (err) {
      toast(err.response?.data?.message || 'Vote failed', 'error');
    } finally {
      setLoadingVote(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (loadingStatus) return;
    setLoadingStatus(true);
    try {
      await api.put(`/issues/${issue._id}`, { status: newStatus });
      toast(`Issue marked as ${statusLabel(newStatus)}`, 'success');
      onUpdated?.();
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoadingStatus(false);
    }
  };

  const creatorName = issue.createdBy?.name || 'Unknown';

  return (
    <div className="full-issue-card">
      <div className="full-issue-top">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="full-issue-title">{issue.title}</div>
          <div className="issue-meta" style={{ marginTop: 6 }}>
            <span className={`tag ${statusClass(issue.status)}`}>{statusLabel(issue.status)}</span>
            <span className={`tag ${catClass(issue.category)}`}>{issue.category}</span>
            <span className="issue-time">{timeAgo(issue.createdAt)}</span>
          </div>
        </div>
        <button
          className={`vote-btn${hasVoted ? ' voted' : ''}`}
          onClick={handleVote}
          disabled={loadingVote}
          title={hasVoted ? 'Remove vote' : 'Upvote'}
        >
          <span className="vote-arrow">▲</span>
          <span className="vote-count">{votes}</span>
        </button>
      </div>

      {!compact && (
        <div className="full-issue-body">{issue.description}</div>
      )}

      {issue.attachments?.length > 0 && (
        <div className="attachments">
          {issue.attachments.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="attachment-chip">
              📎 Attachment {i + 1}
            </a>
          ))}
        </div>
      )}

      <div className="full-issue-footer" style={{ marginTop: compact ? 8 : 0 }}>
        <div className="assignee">
          <div
            className="avatar"
            style={{ width: 20, height: 20, fontSize: 8, background: getAvatarColor(creatorName) }}
          >
            {getInitials(creatorName)}
          </div>
          {creatorName}
          {issue.assignedTo && (
            <span style={{ color: 'var(--text3)' }}>
              → <span style={{ color: 'var(--green)' }}>{issue.assignedTo.name}</span>
            </span>
          )}
        </div>

        {user?.role === 'admin' && issue.status !== 'resolved' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {issue.status === 'open' && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleStatusChange('in_progress')}
                disabled={loadingStatus}
              >
                Start
              </button>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleStatusChange('resolved')}
              disabled={loadingStatus}
            >
              {loadingStatus ? <span className="spinner" /> : 'Resolve ✓'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}