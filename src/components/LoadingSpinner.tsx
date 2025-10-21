import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', message }) => {
  const sizeClasses = {
    sm: { width: '20px', height: '20px' },
    md: { width: '40px', height: '40px' },
    lg: { width: '60px', height: '60px' }
  };

  return (
    <div className="loading-container">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={sizeClasses[size]}></div>
        {message && <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
