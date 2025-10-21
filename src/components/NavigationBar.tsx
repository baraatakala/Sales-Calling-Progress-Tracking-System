import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../index.css';

const NavigationBar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="navigation-bar">
      <div className="nav-header">
        <h1 className="nav-logo">Appro Sales</h1>
        <p className="nav-subtitle">Credit Products System</p>
      </div>
      
      <div className="nav-menu">
        <Link to="/dashboard" className={isActive('/dashboard')}>
          <span className="nav-icon">📊</span>
          Dashboard
        </Link>
        <Link to="/leads" className={isActive('/leads')}>
          <span className="nav-icon">👥</span>
          Leads
        </Link>
        <Link to="/calls" className={isActive('/calls')}>
          <span className="nav-icon">📞</span>
          Call Logs
        </Link>
        <Link to="/settings" className={isActive('/settings')}>
          <span className="nav-icon">⚙️</span>
          Settings
        </Link>
      </div>

      <div className="nav-footer">
        <div className="user-info">
          <div className="user-avatar">A</div>
          <div>
            <div className="user-name">Admin User</div>
            <div className="user-role">ADMIN</div>
          </div>
        </div>
      </div>
      
      <style>{`
        .navigation-bar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 250px;
          background-color: var(--bg-primary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          z-index: 100;
        }

        .nav-header {
          padding: 1.5rem 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .nav-logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
          margin: 0;
        }

        .nav-subtitle {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .nav-menu {
          flex: 1;
          padding: 1rem 0;
          overflow-y: auto;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }

        .nav-link.active {
          background-color: var(--bg-tertiary);
          color: var(--primary);
          border-right: 3px solid var(--primary);
        }

        .nav-icon {
          margin-right: 0.75rem;
          font-size: 1.25rem;
        }

        .nav-footer {
          padding: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1rem;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .logout-btn {
          width: 100%;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .navigation-bar {
            width: 100%;
            position: relative;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
          }

          .nav-menu {
            display: flex;
            overflow-x: auto;
            padding: 0;
          }

          .nav-link {
            flex-direction: column;
            padding: 0.5rem;
            text-align: center;
            min-width: 80px;
          }

          .nav-icon {
            margin-right: 0;
            margin-bottom: 0.25rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default NavigationBar;
