import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads_New';
import CallLogs from './pages/CallLogs_New';
import Settings from './pages/Settings';
import './index.css';

// Main App Layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-container">
      <NavigationBar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All Routes - No Authentication Required */}
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />
        <Route
          path="/leads"
          element={
            <AppLayout>
              <Leads />
            </AppLayout>
          }
        />
        <Route
          path="/calls"
          element={
            <AppLayout>
              <CallLogs />
            </AppLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
