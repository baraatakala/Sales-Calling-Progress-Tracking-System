import React, { useEffect, useState } from 'react';
import { fetchDashboardMetrics } from '../utils/api';
import { DashboardMetrics } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!metrics) return <div className="alert alert-info">No data available</div>;

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Credit Sales Performance Overview</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#dbeafe' }}>📊</div>
          <div>
            <div className="kpi-value">{metrics.totalLeads}</div>
            <div className="kpi-label">Total Leads</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#d1fae5' }}>📞</div>
          <div>
            <div className="kpi-value">{metrics.totalCallsToday}</div>
            <div className="kpi-label">Calls Today</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#fef3c7' }}>📄</div>
          <div>
            <div className="kpi-value">{metrics.pendingDocs}</div>
            <div className="kpi-label">Pending Docs</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#ede9fe' }}>✅</div>
          <div>
            <div className="kpi-value">{metrics.conversionRate.toFixed(1)}%</div>
            <div className="kpi-label">Conversion Rate</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {/* Leads by Credit Type */}
        <div className="card">
          <h3 className="card-title">Leads by Credit Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.leadsByCreditType}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {metrics.leadsByCreditType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Approvals by Bank */}
        <div className="card">
          <h3 className="card-title">Approvals by Bank</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.approvalsByBank}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bank" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Calls by Rep */}
      <div className="card mb-4">
        <h3 className="card-title">Calls by Sales Rep</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metrics.callsByRep}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rep" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Leads & Upcoming Follow-ups */}
      <div className="grid grid-cols-2 gap-2">
        {/* Recent Leads */}
        <div className="card">
          <h3 className="card-title">Recent Leads</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Credit Type</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentLeads.slice(0, 5).map(lead => (
                  <tr key={lead.id}>
                    <td>{lead.name}</td>
                    <td>{lead.credit_type}</td>
                    <td>
                      <span className="badge" style={{ 
                        backgroundColor: `${lead.application_status === 'Approved' ? '#22c55e' : 
                                          lead.application_status === 'Rejected' ? '#ef4444' : 
                                          '#fbbf24'}20`,
                        color: lead.application_status === 'Approved' ? '#15803d' : 
                               lead.application_status === 'Rejected' ? '#991b1b' : 
                               '#92400e'
                      }}>
                        {lead.application_status}
                      </span>
                    </td>
                    <td>{formatDate(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Follow-ups */}
        <div className="card">
          <h3 className="card-title">Upcoming Follow-ups</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Outcome</th>
                  <th>Follow-up Date</th>
                </tr>
              </thead>
              <tbody>
                {metrics.upcomingFollowups.slice(0, 5).map(call => (
                  <tr key={call.id}>
                    <td>{call.lead?.name || 'N/A'}</td>
                    <td>{call.outcome}</td>
                    <td>{call.next_followup_date ? formatDate(call.next_followup_date) : 'N/A'}</td>
                  </tr>
                ))}
                {metrics.upcomingFollowups.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No upcoming follow-ups
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-page {
          max-width: 1400px;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .kpi-card {
          background-color: var(--bg-primary);
          padding: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: var(--shadow);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .kpi-icon {
          width: 60px;
          height: 60px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .kpi-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .kpi-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
