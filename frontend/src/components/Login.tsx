import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertTriangle, BookOpen } from 'lucide-react';

interface LoginProps {
  onToggleView: () => void;
}

export const Login: React.FC<LoginProps> = ({ onToggleView }) => {
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError('Please fill in all credentials.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      // Error handled by AuthContext but we catch to stop loader
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <BookOpen style={{ width: 44, height: 44, color: 'var(--color-accent)', marginBottom: 12 }} />
          <h1>Teacher Portal</h1>
          <p>Sign in to upload and parse documents</p>
        </div>

        {(localError || error) && (
          <div className="alert alert-danger animate-fade-in">
            <AlertTriangle size={18} />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-container">
              <Mail className="input-icon" />
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="teacher@school.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (localError) setLocalError(null);
                }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-container">
              <Lock className="input-icon" />
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (localError) setLocalError(null);
                }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="animate-spin" style={{ display: 'inline-block', width: 20, height: 20 }}>
                ⌛
              </span>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <span onClick={onToggleView}>Create account</span>
        </div>
      </div>
    </div>
  );
};
