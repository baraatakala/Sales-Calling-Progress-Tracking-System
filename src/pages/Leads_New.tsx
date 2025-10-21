import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLeads, fetchSalesReps, createLead, updateLead, deleteLead } from '../utils/api';
import { Lead, SalesRep, LeadStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatDate, getStatusColor } from '../utils/formatters';
import CallLogModal from '../components/CallLogModal';

const Leads: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Advanced Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | ''>('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'status' | 'city'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leads, searchTerm, selectedStatus, selectedAssignee, selectedCity, dateFrom, dateTo, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, repsData] = await Promise.all([
        fetchLeads(),
        fetchSalesReps()
      ]);
      setLeads(leadsData);
      setFilteredLeads(leadsData);
      setSalesReps(repsData);
    } catch (err) {
      setError('Failed to load leads');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.company_name.toLowerCase().includes(search) ||
        lead.contact_person.toLowerCase().includes(search) ||
        lead.phone.includes(search) ||
        (lead.email && lead.email.toLowerCase().includes(search)) ||
        (lead.city && lead.city.toLowerCase().includes(search))
      );
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(lead => lead.status === selectedStatus);
    }

    // Assignee filter
    if (selectedAssignee) {
      filtered = filtered.filter(lead => lead.assigned_to === selectedAssignee);
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(lead => lead.city === selectedCity);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(lead => new Date(lead.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(lead => new Date(lead.created_at) <= endDate);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'company':
          comparison = a.company_name.localeCompare(b.company_name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'city':
          comparison = (a.city || '').localeCompare(b.city || '');
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredLeads(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedAssignee('');
    setSelectedCity('');
    setDateFrom('');
    setDateTo('');
  };

  const getUniqueCities = () => {
    const cities = leads.map(lead => lead.city).filter(Boolean);
    return [...new Set(cities)].sort();
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {
      'New': 0,
      'In Progress': 0,
      'Converted': 0,
      'Lost': 0
    };
    leads.forEach(lead => {
      counts[lead.status] = (counts[lead.status] || 0) + 1;
    });
    return counts;
  };

  const handleCreateLead = () => {
    setEditingLead(null);
    setShowModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setShowModal(true);
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await deleteLead(id);
      loadData();
    } catch (err) {
      alert('Failed to delete lead');
      console.error(err);
    }
  };

  const handleLogCall = (lead: Lead) => {
    setSelectedLead(lead);
    setShowCallModal(true);
  };

  const handleViewCallHistory = (lead: Lead) => {
    // Navigate to Call Logs page with this lead's ID as filter
    navigate(`/calls?leadId=${lead.id}`);
  };

  const canEdit = true;
  const canDelete = true;

  if (loading) return <LoadingSpinner message="Loading leads..." />;

  const statusCounts = getStatusCounts();

  return (
    <div className="leads-page">
      {/* Header with Stats */}
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Leads Management</h1>
          <p className="page-subtitle">{filteredLeads.length} of {leads.length} leads</p>
        </div>
        <button onClick={handleCreateLead} className="btn btn-primary">
          + New Lead
        </button>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setSelectedStatus('')} style={{ cursor: 'pointer' }}>
          <div className="stat-value">{leads.length}</div>
          <div className="stat-label">Total Leads</div>
        </div>
        <div className="stat-card stat-new" onClick={() => setSelectedStatus('New')} style={{ cursor: 'pointer' }}>
          <div className="stat-value">{statusCounts['New']}</div>
          <div className="stat-label">New</div>
        </div>
        <div className="stat-card stat-progress" onClick={() => setSelectedStatus('In Progress')} style={{ cursor: 'pointer' }}>
          <div className="stat-value">{statusCounts['In Progress']}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card stat-converted" onClick={() => setSelectedStatus('Converted')} style={{ cursor: 'pointer' }}>
          <div className="stat-value">{statusCounts['Converted']}</div>
          <div className="stat-label">Converted</div>
        </div>
        <div className="stat-card stat-lost" onClick={() => setSelectedStatus('Lost')} style={{ cursor: 'pointer' }}>
          <div className="stat-value">{statusCounts['Lost']}</div>
          <div className="stat-label">Lost</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Advanced Filters */}
      <div className="card mb-3">
        <div className="filter-header">
          <div className="filter-title">
            <span>🔍 Filters & Search</span>
            {(searchTerm || selectedStatus || selectedAssignee || selectedCity || dateFrom || dateTo) && (
              <span className="filter-badge">{
                [searchTerm, selectedStatus, selectedAssignee, selectedCity, dateFrom, dateTo].filter(Boolean).length
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
                placeholder="🔍 Search by company, contact, phone, email, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Grid */}
            <div className="filters-grid">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as LeadStatus | '')}
                >
                  <option value="">All Statuses</option>
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned To</label>
                <select 
                  className="form-select"
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                >
                  <option value="">All Sales Reps</option>
                  {salesReps.map(rep => (
                    <option key={rep.id} value={rep.id}>{rep.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <select 
                  className="form-select"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="">All Cities</option>
                  {getUniqueCities().map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
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
                    <option value="company">Company Name</option>
                    <option value="status">Status</option>
                    <option value="city">City</option>
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
                <th>Company / Contact</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Credit Limit</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.company_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{lead.contact_person}</div>
                  </td>
                  <td>{lead.phone}</td>
                  <td>{lead.email || '-'}</td>
                  <td>{lead.city || '-'}</td>
                  <td>
                    <span className="badge" style={{
                      backgroundColor: `${getStatusColor(lead.status)}20`,
                      color: getStatusColor(lead.status),
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {lead.status}
                    </span>
                  </td>
                  <td>
                    {lead.sales_rep ? lead.sales_rep.name : 'Unassigned'}
                  </td>
                  <td>{lead.credit_limit ? formatCurrency(lead.credit_limit) : '-'}</td>
                  <td>{formatDate(lead.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleViewCallHistory(lead)}
                        className="btn btn-sm btn-info"
                        title="View Call History"
                      >
                        📞
                      </button>
                      <button 
                        onClick={() => handleLogCall(lead)}
                        className="btn btn-sm btn-primary"
                        title="Log Call"
                      >
                        ➕
                      </button>
                      {canEdit && (
                        <button 
                          onClick={() => handleEditLead(lead)}
                          className="btn btn-sm btn-secondary"
                          title="Edit"
                        >
                          ✏️
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={() => handleDeleteLead(lead.id)}
                          className="btn btn-sm btn-danger"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                    <div>No leads found matching your filters</div>
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
          {filteredLeads.map(lead => (
            <div key={lead.id} className="lead-card">
              <div className="lead-card-header">
                <div>
                  <h3 className="lead-card-title">{lead.company_name}</h3>
                  <p className="lead-card-contact">{lead.contact_person}</p>
                </div>
                <span className="badge" style={{
                  backgroundColor: `${getStatusColor(lead.status)}20`,
                  color: getStatusColor(lead.status)
                }}>
                  {lead.status}
                </span>
              </div>
              <div className="lead-card-body">
                <div className="lead-card-info">
                  <span>📞 {lead.phone}</span>
                  <span>📧 {lead.email || '-'}</span>
                  <span>📍 {lead.city || '-'}</span>
                  <span>💰 {lead.credit_limit ? formatCurrency(lead.credit_limit) : '-'}</span>
                  <span>👤 {lead.sales_rep ? lead.sales_rep.name : 'Unassigned'}</span>
                  <span>📅 {formatDate(lead.created_at)}</span>
                </div>
              </div>
              <div className="lead-card-actions">
                <button onClick={() => handleViewCallHistory(lead)} className="btn btn-sm btn-info">
                  View Calls
                </button>
                <button onClick={() => handleLogCall(lead)} className="btn btn-sm btn-primary">
                  Log Call
                </button>
                <button onClick={() => handleEditLead(lead)} className="btn btn-sm btn-secondary">
                  Edit
                </button>
              </div>
            </div>
          ))}
          {filteredLeads.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <div>No leads found matching your filters</div>
              <button onClick={clearAllFilters} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <LeadModal
          lead={editingLead}
          salesReps={salesReps}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            loadData();
          }}
        />
      )}

      {showCallModal && selectedLead && (
        <CallLogModal
          lead={selectedLead}
          onClose={() => {
            setShowCallModal(false);
            setSelectedLead(null);
          }}
          onSave={() => {
            setShowCallModal(false);
            setSelectedLead(null);
          }}
        />
      )}

      <style>{`
        .leads-page {
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

        .stat-card.stat-new { border-left: 4px solid #3b82f6; }
        .stat-card.stat-progress { border-left: 4px solid #f59e0b; }
        .stat-card.stat-converted { border-left: 4px solid #22c55e; }
        .stat-card.stat-lost { border-left: 4px solid #ef4444; }

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

        .lead-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .lead-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .lead-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .lead-card-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .lead-card-contact {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .lead-card-body {
          margin-bottom: 1rem;
        }

        .lead-card-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .lead-card-actions {
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
        }
      `}</style>
    </div>
  );
};

// Lead Modal Component (same as before but imported for reference)
interface LeadModalProps {
  lead: Lead | null;
  salesReps: SalesRep[];
  onClose: () => void;
  onSave: () => void;
}

const LeadModal: React.FC<LeadModalProps> = ({ lead, salesReps, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    company_name: lead?.company_name || '',
    contact_person: lead?.contact_person || '',
    phone: lead?.phone || '',
    email: lead?.email || '',
    address: lead?.address || '',
    city: lead?.city || '',
    status: lead?.status || 'New' as LeadStatus,
    assigned_to: lead?.assigned_to || '',
    credit_limit: lead?.credit_limit || 0,
    notes: lead?.notes || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanedData = {
        ...formData,
        assigned_to: formData.assigned_to || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        notes: formData.notes || undefined,
      };

      if (lead) {
        await updateLead(lead.id, cleanedData);
      } else {
        await createLead(cleanedData);
      }
      onSave();
    } catch (err: any) {
      const errorMessage = err?.message || JSON.stringify(err);
      alert('Failed to save lead: ' + errorMessage);
      console.error('Full error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{lead ? 'Edit Lead' : 'New Lead'}</h2>
          <button onClick={onClose} className="btn btn-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid grid-cols-2 gap-2">
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Person *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Credit Limit (AED)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.credit_limit}
                  onChange={(e) => setFormData({...formData, credit_limit: Number(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as LeadStatus})}
                  required
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned To</label>
                <select
                  className="form-select"
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {salesReps.map(rep => (
                    <option key={rep.id} value={rep.id}>{rep.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group mt-2">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Leads;
