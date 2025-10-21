import React, { useEffect, useState } from 'react';
import { fetchLeads, fetchSalesReps, createLead, updateLead, deleteLead } from '../utils/api';
import { Lead, SalesRep, FilterOptions, LeadStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatDate, getStatusColor, getPriorityColor, formatPhoneNumber } from '../utils/formatters';
import CallLogModal from '../components/CallLogModal';
import { useNavigate } from 'react-router-dom';

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
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | ''>('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status' | 'city'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

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
      filtered = filtered.filter(lead => new Date(lead.created_at) <= new Date(dateTo));
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'name':
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
    const counts: Record<string, number> = {};
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

  // No authentication - all users have full access
  const canEdit = true;
  const canDelete = true;

  if (loading) return <LoadingSpinner message="Loading leads..." />;

  return (
    <div className="leads-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Credit Leads</h1>
          <p className="page-subtitle">Manage and track credit product leads</p>
        </div>
        {canEdit && (
          <button onClick={handleCreateLead} className="btn btn-primary">
            + New Lead
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div className="card mb-3">
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Credit Type</label>
            <select 
              className="form-select"
              value={filters.creditType || ''}
              onChange={(e) => setFilters({...filters, creditType: e.target.value as CreditType || undefined})}
            >
              <option value="">All Types</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Personal Loan">Personal Loan</option>
              <option value="Car Loan">Car Loan</option>
              <option value="Home Loan">Home Loan</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              className="form-select"
              value={filters.status || ''}
              onChange={(e) => setFilters({...filters, status: e.target.value as ApplicationStatus || undefined})}
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Pre-qualified">Pre-qualified</option>
              <option value="Docs Collected">Docs Collected</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, phone, email..."
              value={filters.search || ''}
              onChange={(e) => setFilters({...filters, search: e.target.value || undefined})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button 
              onClick={() => setFilters({})}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Credit Type</th>
              <th>Bank</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{lead.name}</div>
                  {lead.email && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{lead.email}</div>}
                </td>
                <td>{formatPhoneNumber(lead.phone)}</td>
                <td>{lead.credit_type}</td>
                <td>{lead.bank_partner}</td>
                <td>{formatCurrency(lead.requested_amount)}</td>
                <td>
                  <span className="badge" style={{ 
                    backgroundColor: `${getStatusColor(lead.application_status)}20`,
                    color: getStatusColor(lead.application_status)
                  }}>
                    {lead.application_status}
                  </span>
                </td>
                <td>
                  <span className="badge" style={{ 
                    backgroundColor: `${getPriorityColor(lead.priority)}20`,
                    color: getPriorityColor(lead.priority)
                  }}>
                    {lead.priority || 'Medium'}
                  </span>
                </td>
                <td>{(lead.sales_rep as any)?.name || 'Unassigned'}</td>
                <td>{formatDate(lead.created_at)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleLogCall(lead)}
                      className="btn btn-sm btn-primary"
                      title="Log Call"
                    >
                      📞
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
            {leads.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No leads found. {canEdit && 'Click "New Lead" to create one.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
            loadData();
          }}
        />
      )}

      <style>{`
        .leads-page {
          max-width: 1600px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }
          
          .page-header {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

// Lead Modal Component
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
    status: lead?.status || 'New',
    assigned_to: lead?.assigned_to || '',
    credit_limit: lead?.credit_limit || 0,
    notes: lead?.notes || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up the form data - convert empty strings to undefined for optional fields
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
