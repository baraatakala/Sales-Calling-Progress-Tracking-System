import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchCalls, fetchLeads, fetchSalesReps } from '../utils/api';
import { Call, Lead, SalesRep, CallOutcome } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateTime, formatDuration, getOutcomeColor, formatDate } from '../utils/formatters';

const CallLogs: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leadIdParam = searchParams.get('leadId');

  const [calls, setCalls] = useState<Call[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  // Advanced Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome | ''>('');
  const [selectedSalesRep, setSelectedSalesRep] = useState('');
  const [selectedLead, setSelectedLead] = useState(leadIdParam || '');
  const [hasFollowup, setHasFollowup] = useState<'all' | 'yes' | 'no'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'outcome'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // If leadId is provided in URL, set it as filter
    if (leadIdParam) {
      setSelectedLead(leadIdParam);
    }
  }, [leadIdParam]);

  useEffect(() => {
    applyFilters();
  }, [calls, searchTerm, selectedOutcome, selectedSalesRep, selectedLead, hasFollowup, dateFrom, dateTo, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [callsData, leadsData, repsData] = await Promise.all([
        fetchCalls(),
        fetchLeads(),
        fetchSalesReps()
      ]);
      setCalls(callsData);
      setFilteredCalls(callsData);
      setLeads(leadsData);
      setSalesReps(repsData);
    } catch (err) {
      setError('Failed to load call logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...calls];

    // Search filter (search in lead name, sales rep name, notes)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(call => 
        call.lead?.company_name.toLowerCase().includes(search) ||
        call.sales_rep?.name.toLowerCase().includes(search) ||
        (call.notes && call.notes.toLowerCase().includes(search))
      );
    }

    // Outcome filter
    if (selectedOutcome) {
      filtered = filtered.filter(call => call.outcome === selectedOutcome);
    }

    // Sales Rep filter
    if (selectedSalesRep) {
      filtered = filtered.filter(call => call.sales_rep_id === selectedSalesRep);
    }

    // Lead filter
    if (selectedLead) {
      filtered = filtered.filter(call => call.lead_id === selectedLead);
    }

    // Follow-up filter
    if (hasFollowup === 'yes') {
      filtered = filtered.filter(call => call.next_followup_date);
    } else if (hasFollowup === 'no') {
      filtered = filtered.filter(call => !call.next_followup_date);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(call => new Date(call.call_date) >= new Date(dateFrom));
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(call => new Date(call.call_date) <= endDate);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.call_date).getTime() - new Date(b.call_date).getTime();
          break;
        case 'duration':
          comparison = (a.duration_minutes || 0) - (b.duration_minutes || 0);
          break;
        case 'outcome':
          comparison = a.outcome.localeCompare(b.outcome);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredCalls(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedOutcome('');
    setSelectedSalesRep('');
    setSelectedLead('');
    setHasFollowup('all');
    setDateFrom('');
    setDateTo('');
    // Clear URL parameter
    navigate('/calls', { replace: true });
  };

  const getOutcomeCounts = () => {
    const counts: Record<string, number> = {
      'No Answer': 0,
      'Callback Requested': 0,
      'Interested': 0,
      'Not Interested': 0,
      'Converted': 0
    };
    calls.forEach(call => {
      counts[call.outcome] = (counts[call.outcome] || 0) + 1;
    });
    return counts;
  };

  const getTotalDuration = () => {
    return filteredCalls.reduce((sum, call) => sum + (call.duration_minutes || 0), 0);
  };

  const getUpcomingFollowups = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return calls.filter(call => {
      if (!call.next_followup_date) return false;
      const followupDate = new Date(call.next_followup_date);
      return followupDate >= today;
    }).length;
  };

  const handleViewLead = (leadId: string) => {
    // Navigate to Leads page (could also scroll to specific lead if on same page)
    navigate(`/leads?highlight=${leadId}`);
  };

  if (loading) return <LoadingSpinner message="Loading call logs..." />;

  const outcomeCounts = getOutcomeCounts();
  const totalDuration = getTotalDuration();
  const upcomingFollowups = getUpcomingFollowups();

  // Get the filtered lead name for breadcrumb
  const filteredLeadName = selectedLead ? leads.find(l => l.id === selectedLead)?.company_name : null;

  return (
    <div className="call-logs-page">
      {/* Header with Stats */}
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Call Logs</h1>
          {filteredLeadName ? (
            <p className="page-subtitle">
              Showing calls for: <strong>{filteredLeadName}</strong>
              <button 
                onClick={() => setSelectedLead('')}
                className="btn btn-sm btn-secondary"
                style={{ marginLeft: '1rem' }}
              >
                ✕ Clear Filter
              </button>
            </p>
          ) : (
            <p className="page-subtitle">{filteredCalls.length} of {calls.length} calls</p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{calls.length}</div>
          <div className="stat-label">Total Calls</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatDuration(totalDuration)}</div>
          <div className="stat-label">Total Duration</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{upcomingFollowups}</div>
          <div className="stat-label">Upcoming Follow-ups</div>
        </div>
        <div className="stat-card stat-converted" onClick={() => setSelectedOutcome('Converted')} style={{ cursor: 'pointer' }}>
          <div className="stat-value">{outcomeCounts['Converted']}</div>
          <div className="stat-label">Converted</div>
        </div>
        <div className="stat-card stat-interested" onClick={() => setSelectedOutcome('Interested')} style={{ cursor: 'pointer' }}>
          <div className="stat-value">{outcomeCounts['Interested']}</div>
          <div className="stat-label">Interested</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Advanced Filters */}
      <div className="card mb-3">
        <div className="filter-header">
          <div className="filter-title">
            <span>🔍 Filters & Search</span>
            {(searchTerm || selectedOutcome || selectedSalesRep || selectedLead || hasFollowup !== 'all' || dateFrom || dateTo) && (
              <span className="filter-badge">{
                [searchTerm, selectedOutcome, selectedSalesRep, selectedLead, hasFollowup !== 'all', dateFrom, dateTo].filter(Boolean).length
              } active</span>
            )}
          </div>
          <div className="filter-actions">
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '▼ Hide' : '▶ Show'} Filters
            </button>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={clearAllFilters}
            >
              Clear All
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="filter-body">
            {/* Search Bar */}
            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search by lead name, sales rep, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Grid */}
            <div className="filters-grid">
              <div className="form-group">
                <label className="form-label">Outcome</label>
                <select 
                  className="form-select"
                  value={selectedOutcome}
                  onChange={(e) => setSelectedOutcome(e.target.value as CallOutcome | '')}
                >
                  <option value="">All Outcomes</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Callback Requested">Callback Requested</option>
                  <option value="Interested">Interested</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Sales Rep</label>
                <select 
                  className="form-select"
                  value={selectedSalesRep}
                  onChange={(e) => setSelectedSalesRep(e.target.value)}
                >
                  <option value="">All Sales Reps</option>
                  {salesReps.map(rep => (
                    <option key={rep.id} value={rep.id}>{rep.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Lead</label>
                <select 
                  className="form-select"
                  value={selectedLead}
                  onChange={(e) => setSelectedLead(e.target.value)}
                >
                  <option value="">All Leads</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>{lead.company_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Has Follow-up</label>
                <select 
                  className="form-select"
                  value={hasFollowup}
                  onChange={(e) => setHasFollowup(e.target.value as any)}
                >
                  <option value="all">All Calls</option>
                  <option value="yes">With Follow-up</option>
                  <option value="no">No Follow-up</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date From</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date To</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sort By</label>
                <div className="sort-controls">
                  <select 
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{ flex: 2 }}
                  >
                    <option value="date">Date</option>
                    <option value="duration">Duration</option>
                    <option value="outcome">Outcome</option>
                  </select>
                  <button
                    className="btn btn-sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    style={{ flex: 1 }}
                  >
                    {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Toggle */}
      <div className="view-controls">
        <div className="view-toggle">
          <button 
            className={viewMode === 'table' ? 'active' : ''}
            onClick={() => setViewMode('table')}
          >
            📋 Table
          </button>
          <button 
            className={viewMode === 'cards' ? 'active' : ''}
            onClick={() => setViewMode('cards')}
          >
            🗂️ Cards
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Lead Company</th>
                <th>Sales Rep</th>
                <th>Duration</th>
                <th>Outcome</th>
                <th>Next Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalls.map(call => (
                <tr key={call.id}>
                  <td>{formatDateTime(call.call_date)}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {call.lead?.company_name || 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {call.lead?.contact_person}
                    </div>
                  </td>
                  <td>{call.sales_rep?.name || 'N/A'}</td>
                  <td>{formatDuration(call.duration_minutes || 0)}</td>
                  <td>
                    <span className="badge" style={{ 
                      backgroundColor: `${getOutcomeColor(call.outcome)}20`,
                      color: getOutcomeColor(call.outcome),
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {call.outcome}
                    </span>
                  </td>
                  <td>
                    {call.next_followup_date ? (
                      <span style={{ 
                        color: new Date(call.next_followup_date) < new Date() ? '#ef4444' : '#22c55e',
                        fontWeight: 600
                      }}>
                        {formatDate(call.next_followup_date)}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleViewLead(call.lead_id)}
                        className="btn btn-sm btn-info"
                        title="View Lead"
                      >
                        👤
                      </button>
                      <button 
                        onClick={() => setSelectedCall(call)}
                        className="btn btn-sm btn-secondary"
                        title="View Details"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCalls.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                    <div>No call logs found matching your filters</div>
                    <button onClick={clearAllFilters} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                      Clear Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="cards-grid">
          {filteredCalls.map(call => (
            <div key={call.id} className="call-card">
              <div className="call-card-header">
                <div>
                  <h3 className="call-card-title">{call.lead?.company_name || 'N/A'}</h3>
                  <p className="call-card-contact">{call.lead?.contact_person}</p>
                </div>
                <span className="badge" style={{
                  backgroundColor: `${getOutcomeColor(call.outcome)}20`,
                  color: getOutcomeColor(call.outcome)
                }}>
                  {call.outcome}
                </span>
              </div>
              <div className="call-card-body">
                <div className="call-card-info">
                  <span>📅 {formatDateTime(call.call_date)}</span>
                  <span>👤 {call.sales_rep?.name || 'N/A'}</span>
                  <span>⏱️ {formatDuration(call.duration_minutes || 0)}</span>
                  {call.next_followup_date && (
                    <span style={{ 
                      color: new Date(call.next_followup_date) < new Date() ? '#ef4444' : '#22c55e'
                    }}>
                      📌 Follow-up: {formatDate(call.next_followup_date)}
                    </span>
                  )}
                  {call.notes && (
                    <span style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                      💬 {call.notes.substring(0, 100)}{call.notes.length > 100 ? '...' : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="call-card-actions">
                <button onClick={() => handleViewLead(call.lead_id)} className="btn btn-sm btn-info">
                  View Lead
                </button>
                <button onClick={() => setSelectedCall(call)} className="btn btn-sm btn-secondary">
                  Details
                </button>
              </div>
            </div>
          ))}
          {filteredCalls.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <div>No call logs found matching your filters</div>
              <button onClick={clearAllFilters} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Call Details Modal */}
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
                  <label className="detail-label">Lead Company</label>
                  <div className="detail-value">{selectedCall.lead?.company_name || 'N/A'}</div>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Contact Person</label>
                  <div className="detail-value">{selectedCall.lead?.contact_person || 'N/A'}</div>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Sales Rep</label>
                  <div className="detail-value">{selectedCall.sales_rep?.name || 'N/A'}</div>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Call Date</label>
                  <div className="detail-value">{formatDateTime(selectedCall.call_date)}</div>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Duration</label>
                  <div className="detail-value">{formatDuration(selectedCall.duration_minutes || 0)}</div>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Outcome</label>
                  <div className="detail-value">
                    <span className="badge" style={{ 
                      backgroundColor: `${getOutcomeColor(selectedCall.outcome)}20`,
                      color: getOutcomeColor(selectedCall.outcome)
                    }}>
                      {selectedCall.outcome}
                    </span>
                  </div>
                </div>
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <label className="detail-label">Next Follow-up</label>
                  <div className="detail-value">
                    {selectedCall.next_followup_date ? formatDate(selectedCall.next_followup_date) : 'No follow-up scheduled'}
                  </div>
                </div>
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <label className="detail-label">Notes</label>
                  <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedCall.notes || 'No notes'}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => handleViewLead(selectedCall.lead_id)} className="btn btn-primary">
                View Lead
              </button>
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

        .page-header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-card.stat-converted { border-left: 4px solid #22c55e; }
        .stat-card.stat-interested { border-left: 4px solid #3b82f6; }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .filter-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 1rem;
        }

        .filter-badge {
          background: var(--primary);
          color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .filter-actions {
          display: flex;
          gap: 0.5rem;
        }

        .filter-body {
          padding: 1rem;
        }

        .search-bar {
          margin-bottom: 1rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .sort-controls {
          display: flex;
          gap: 0.5rem;
        }

        .view-controls {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1rem;
        }

        .view-toggle {
          display: flex;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
        }

        .view-toggle button {
          padding: 0.5rem 1rem;
          border: none;
          background: var(--bg-primary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-toggle button.active {
          background: var(--primary);
          color: white;
        }

        .view-toggle button:hover:not(.active) {
          background: var(--bg-secondary);
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1rem;
        }

        .call-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .call-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .call-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .call-card-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .call-card-contact {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .call-card-body {
          margin-bottom: 1rem;
        }

        .call-card-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .call-card-actions {
          display: flex;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-info {
          background: #3b82f6;
          color: white;
        }

        .btn-info:hover {
          background: #2563eb;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-value {
          font-size: 1rem;
          color: var(--text-primary);
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .cards-grid {
            grid-template-columns: 1fr;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CallLogs;
