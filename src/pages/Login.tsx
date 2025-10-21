import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError.message || 'Failed to sign in');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Appro Credit Sales</h1>
            <p className="login-subtitle">Sign in to your account</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@appro.ae"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p className="login-hint">
              Demo credentials:<br />
              Email: admin@appro.ae | Password: (set in Supabase Auth)
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .login-container {
          width: 100%;
          max-width: 400px;
          padding: 1rem;
        }

        .login-card {
          background-color: var(--bg-primary);
          border-radius: 0.75rem;
          padding: 2rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }

        .login-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .login-form {
          margin-bottom: 1.5rem;
        }

        .login-btn {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .login-footer {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .login-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default Login;
