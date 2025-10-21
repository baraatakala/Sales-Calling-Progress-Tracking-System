import React, { useState, useEffect } from 'react';
import { createCall, fetchSalesReps } from '../utils/api';
import { Lead, CallOutcome, SalesRep } from '../types';

interface CallLogModalProps {
  lead: Lead;
  onClose: () => void;
  onSave: () => void;
}

const CallLogModal: React.FC<CallLogModalProps> = ({ lead, onClose, onSave }) => {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [formData, setFormData] = useState({
    sales_rep_id: '',
    outcome: 'Interested' as CallOutcome,
    duration_minutes: 0,
    notes: '',
    next_followup_date: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSalesReps();
  }, []);

  const loadSalesReps = async () => {
    try {
      const reps = await fetchSalesReps();
      setSalesReps(reps);
      // Auto-select first sales rep if available
      if (reps.length > 0) {
        setFormData(prev => ({ ...prev, sales_rep_id: reps[0].id }));
      }
    } catch (err) {
      console.error('Failed to load sales reps:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sales_rep_id) {
      alert('Please select a sales representative');
      return;
    }

    setLoading(true);
    try {
      await createCall({
        lead_id: lead.id,
        sales_rep_id: formData.sales_rep_id,
        call_date: new Date().toISOString(),
        duration_minutes: formData.duration_minutes,
        outcome: formData.outcome,
        notes: formData.notes || undefined,
        next_followup_date: formData.next_followup_date || undefined
      });
      onSave();
    } catch (err) {
      alert('Failed to log call');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Log Call - {lead.company_name}</h2>
          <button onClick={onClose} className="btn btn-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="call-info">
              <p><strong>Company:</strong> {lead.company_name}</p>
              <p><strong>Contact:</strong> {lead.contact_person}</p>
              <p><strong>Phone:</strong> {lead.phone}</p>
              <p><strong>Status:</strong> {lead.status}</p>
            </div>

            <div className="form-group">
              <label className="form-label">Sales Representative *</label>
              <select
                className="form-select"
                value={formData.sales_rep_id}
                onChange={(e) => setFormData({...formData, sales_rep_id: e.target.value})}
                required
              >
                <option value="">Select Sales Rep</option>
                {salesReps.map(rep => (
                  <option key={rep.id} value={rep.id}>{rep.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Call Outcome *</label>
              <select
                className="form-select"
                value={formData.outcome}
                onChange={(e) => setFormData({...formData, outcome: e.target.value as CallOutcome})}
                required
              >
                <option value="No Answer">No Answer</option>
                <option value="Callback Requested">Callback Requested</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Converted">Converted</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input
                type="number"
                className="form-input"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: Number(e.target.value)})}
                min="0"
                placeholder="Call duration in minutes"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={4}
                placeholder="Add call details, discussion notes, action items..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Next Follow-up Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.next_followup_date}
                onChange={(e) => setFormData({...formData, next_followup_date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging...' : 'Log Call'}
            </button>
          </div>
        </form>

        <style>{`
          .call-info {
            background-color: var(--bg-secondary);
            padding: 1rem;
            border-radius: 0.375rem;
            margin-bottom: 1.5rem;
          }

          .call-info p {
            margin: 0.5rem 0;
            font-size: 0.875rem;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CallLogModal;
