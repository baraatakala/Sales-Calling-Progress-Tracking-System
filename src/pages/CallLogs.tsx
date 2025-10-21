import React, { useEffect, useState } from 'react';
import { fetchCalls } from '../utils/api';
import { Call } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateTime, formatDuration, getOutcomeColor } from '../utils/formatters';

const CallLogs: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    try {
      setLoading(true);
      const data = await fetchCalls();
      setCalls(data);
    } catch (err) {
      setError('Failed to load call logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading call logs..." />;

  return (
    <div className="call-logs-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Call Logs</h1>
          <p className="page-subtitle">View all sales call history</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Lead Name</th>
              <th>Credit Type</th>
              <th>Bank</th>
              <th>Sales Rep</th>
              <th>Duration</th>
              <th>Outcome</th>
              <th>Next Follow-up</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {calls.map(call => (
              <tr key={call.id}>
                <td>{formatDateTime(call.call_time)}</td>
                <td>{call.lead?.name || 'N/A'}</td>
                <td>{call.lead?.credit_type || 'N/A'}</td>
                <td>{call.lead?.bank_partner || 'N/A'}</td>
                <td>{(call.sales_rep as any)?.name || 'N/A'}</td>
                <td>{formatDuration(call.duration)}</td>
                <td>
                  <span className="badge" style={{ 
                    backgroundColor: `${getOutcomeColor(call.outcome)}20`,
                    color: getOutcomeColor(call.outcome)
                  }}>
                    {call.outcome}
                  </span>
                </td>
                <td>{call.next_followup_date || 'N/A'}</td>
                <td>
                  <button 
                    onClick={() => setSelectedCall(call)}
                    className="btn btn-sm btn-secondary"
                    title="View Details"
                  >
                    👁️
                  </button>
                </td>
              </tr>
            ))}
            {calls.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No call logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedCall && (
        <div className="modal-overlay" onClick={() => setSelectedCall(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Call Details</h2>
              <button onClick={() => setSelectedCall(null)} className="btn btn-sm">✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Lead:</strong>
                  <span>{selectedCall.lead?.name}</span>
                </div>
                <div className="detail-item">
                  <strong>Date & Time:</strong>
                  <span>{formatDateTime(selectedCall.call_time)}</span>
                </div>
                <div className="detail-item">
                  <strong>Credit Type:</strong>
                  <span>{selectedCall.lead?.credit_type}</span>
                </div>
                <div className="detail-item">
                  <strong>Bank:</strong>
                  <span>{selectedCall.lead?.bank_partner}</span>
                </div>
                <div className="detail-item">
                  <strong>Sales Rep:</strong>
                  <span>{(selectedCall.sales_rep as any)?.name}</span>
                </div>
                <div className="detail-item">
                  <strong>Duration:</strong>
                  <span>{formatDuration(selectedCall.duration)}</span>
                </div>
                <div className="detail-item">
                  <strong>Outcome:</strong>
                  <span className="badge" style={{ 
                    backgroundColor: `${getOutcomeColor(selectedCall.outcome)}20`,
                    color: getOutcomeColor(selectedCall.outcome)
                  }}>
                    {selectedCall.outcome}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Next Follow-up:</strong>
                  <span>{selectedCall.next_followup_date || 'N/A'}</span>
                </div>
              </div>
              {selectedCall.notes && (
                <div className="mt-3">
                  <strong>Notes:</strong>
                  <div className="notes-box">{selectedCall.notes}</div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedCall(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .call-logs-page {
          max-width: 1600px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item strong {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .detail-item span {
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .notes-box {
          margin-top: 0.5rem;
          padding: 1rem;
          background-color: var(--bg-secondary);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CallLogs;
