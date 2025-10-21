import React, { useEffect, useState } from 'react';
import { fetchSalesReps, createSalesRep, updateSalesRep, deleteSalesRep } from '../utils/api';
import { SalesRep, UserRole } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Settings: React.FC = () => {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'company' | 'users' | 'email' | 'notifications'>('company');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SalesRep | null>(null);

  // Company Settings State
  const [companySettings, setCompanySettings] = useState({
    companyName: 'Appro Onboarding Solutions FZ LLC',
    website: 'https://appro.ae',
    email: 'info@appro.ae',
    phone: '+971 4 123 4567',
    address: 'Dubai, United Arab Emirates',
    currency: 'AED',
    timezone: 'Asia/Dubai',
    language: 'English'
  });

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@appro.ae',
    fromName: 'Appro Sales System'
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnNewLead: true,
    emailOnStatusChange: true,
    emailOnCallLog: false,
    dailyReport: true,
    weeklyReport: true,
    reportTime: '09:00'
  });

  useEffect(() => {
    loadSalesReps();
  }, []);

  const loadSalesReps = async () => {
    try {
      setLoading(true);
      const data = await fetchSalesReps();
      setSalesReps(data);
    } catch (err) {
      setError('Failed to load sales representatives');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanySettings = () => {
    // TODO: Implement API call to save company settings
    alert('Company settings saved successfully!');
  };

  const handleSaveEmailSettings = () => {
    // TODO: Implement API call to save email settings
    alert('Email settings saved successfully!');
  };

  const handleSaveNotificationSettings = () => {
    // TODO: Implement API call to save notification settings
    alert('Notification settings saved successfully!');
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteSalesRep(id);
      alert('User deleted successfully!');
      loadSalesReps();
    } catch (err) {
      alert('Failed to delete user. They may have associated leads or calls.');
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner message="Loading settings..." />;

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage system configuration and preferences</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={activeTab === 'company' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('company')}
        >
          🏢 Company
        </button>
        <button 
          className={activeTab === 'users' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={activeTab === 'email' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('email')}
        >
          📧 Email
        </button>
        <button 
          className={activeTab === 'notifications' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
        </button>
      </div>

      {/* Company Settings Tab */}
      {activeTab === 'company' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Company Information</h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={companySettings.companyName}
                  onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Website</label>
                <input
                  type="url"
                  className="form-input"
                  value={companySettings.website}
                  onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={companySettings.email}
                  onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={companySettings.phone}
                  onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default Currency</label>
                <select
                  className="form-select"
                  value={companySettings.currency}
                  onChange={(e) => setCompanySettings({...companySettings, currency: e.target.value})}
                >
                  <option value="AED">AED (Dirham)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (Pound)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select
                  className="form-select"
                  value={companySettings.timezone}
                  onChange={(e) => setCompanySettings({...companySettings, timezone: e.target.value})}
                >
                  <option value="Asia/Dubai">Asia/Dubai (UAE)</option>
                  <option value="Europe/London">Europe/London (UK)</option>
                  <option value="America/New_York">America/New_York (US)</option>
                  <option value="Asia/Singapore">Asia/Singapore</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Language</label>
                <select
                  className="form-select"
                  value={companySettings.language}
                  onChange={(e) => setCompanySettings({...companySettings, language: e.target.value})}
                >
                  <option value="English">English</option>
                  <option value="Arabic">Arabic</option>
                  <option value="French">French</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button onClick={handleSaveCompanySettings} className="btn btn-primary">
                Save Company Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sales Representatives</h3>
            <button onClick={() => setShowAddUserModal(true)} className="btn btn-primary btn-sm">
              + Add User
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {salesReps.map(rep => (
                  <tr key={rep.id}>
                    <td>{rep.name}</td>
                    <td>{rep.email}</td>
                    <td>{rep.phone || 'N/A'}</td>
                    <td>
                      <span className="badge" style={{ 
                        backgroundColor: rep.role === 'admin' ? '#ef444420' : 
                                        rep.role === 'manager' ? '#f59e0b20' : 
                                        '#22c55e20',
                        color: rep.role === 'admin' ? '#ef4444' : 
                               rep.role === 'manager' ? '#f59e0b' : 
                               '#22c55e'
                      }}>
                        {rep.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{
                        backgroundColor: rep.is_active ? '#22c55e20' : '#94a3b820',
                        color: rep.is_active ? '#22c55e' : '#94a3b8'
                      }}>
                        {rep.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(rep.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => setEditingUser(rep)}
                          className="btn btn-sm btn-secondary"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(rep.id)}
                          className="btn btn-sm btn-danger"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Email Settings Tab */}
      {activeTab === 'email' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Email Configuration</h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">SMTP Host</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="smtp.gmail.com"
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">SMTP Port</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="587"
                  value={emailSettings.smtpPort}
                  onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">SMTP Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="your-email@gmail.com"
                  value={emailSettings.smtpUser}
                  onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">SMTP Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={emailSettings.smtpPassword}
                  onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">From Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={emailSettings.fromEmail}
                  onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">From Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                />
              </div>
            </div>

            <div className="form-actions">
              <button onClick={handleSaveEmailSettings} className="btn btn-primary">
                Save Email Settings
              </button>
              <button className="btn btn-secondary">
                Send Test Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Notification Preferences</h3>
          </div>
          <div className="card-body">
            <div className="notification-section">
              <h4>Email Notifications</h4>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailOnNewLead}
                    onChange={(e) => setNotificationSettings({...notificationSettings, emailOnNewLead: e.target.checked})}
                  />
                  <span>Notify on new lead creation</span>
                </label>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailOnStatusChange}
                    onChange={(e) => setNotificationSettings({...notificationSettings, emailOnStatusChange: e.target.checked})}
                  />
                  <span>Notify on lead status change</span>
                </label>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailOnCallLog}
                    onChange={(e) => setNotificationSettings({...notificationSettings, emailOnCallLog: e.target.checked})}
                  />
                  <span>Notify on new call log</span>
                </label>
              </div>
            </div>

            <div className="notification-section">
              <h4>Reports</h4>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notificationSettings.dailyReport}
                    onChange={(e) => setNotificationSettings({...notificationSettings, dailyReport: e.target.checked})}
                  />
                  <span>Daily summary report</span>
                </label>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notificationSettings.weeklyReport}
                    onChange={(e) => setNotificationSettings({...notificationSettings, weeklyReport: e.target.checked})}
                  />
                  <span>Weekly performance report</span>
                </label>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Report Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={notificationSettings.reportTime}
                  onChange={(e) => setNotificationSettings({...notificationSettings, reportTime: e.target.value})}
                  style={{ maxWidth: '200px' }}
                />
              </div>
            </div>

            <div className="form-actions">
              <button onClick={handleSaveNotificationSettings} className="btn btn-primary">
                Save Notification Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {(showAddUserModal || editingUser) && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowAddUserModal(false);
            setEditingUser(null);
          }}
          onSave={() => {
            setShowAddUserModal(false);
            setEditingUser(null);
            loadSalesReps();
          }}
        />
      )}

      <style>{`
        .settings-page {
          max-width: 1200px;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid var(--border-color);
        }

        .tab {
          padding: 0.75rem 1.5rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
        }

        .tab:hover {
          color: var(--text-primary);
          background: var(--bg-secondary);
        }

        .tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .notification-section {
          margin-bottom: 2rem;
        }

        .notification-section h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .checkbox-group {
          margin-bottom: 0.75rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .checkbox-label:hover {
          background: var(--bg-secondary);
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .checkbox-label span {
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .tabs {
            overflow-x: auto;
          }

          .tab {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
};

// User Modal Component
interface UserModalProps {
  user: SalesRep | null;
  onClose: () => void;
  onSave: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'sales_rep',
    is_active: user?.is_active ?? true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up form data - convert empty strings to undefined for optional fields
      const cleanedData = {
        ...formData,
        phone: formData.phone || undefined
      };

      if (user) {
        // Update existing user
        await updateSalesRep(user.id, cleanedData);
        alert('Sales Representative updated successfully!');
      } else {
        // Create new user
        await createSalesRep(cleanedData);
        alert('Sales Representative created successfully!');
      }
      onSave();
    } catch (err: any) {
      const errorMessage = err?.message || JSON.stringify(err);
      alert('Failed to save user: ' + errorMessage);
      console.error('Full error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{user ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onClose} className="btn btn-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role *</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                required
              >
                <option value="sales_rep">Sales Rep</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <span>Active User</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
