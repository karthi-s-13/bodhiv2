import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus, AlertTriangle, BookOpen } from 'lucide-react';

interface RegisterProps {
  onToggleView: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onToggleView }) => {
  const { register, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password || !fullName) {
      setLocalError('Please fill in all details.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName);
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
          <h1>Teacher Registration</h1>
          <p>Create a secure account to extract PDF text</p>
        </div>

        {(localError || error) && (
          <div className="alert alert-danger animate-fade-in">
            <AlertTriangle size={18} />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-container">
              <User className="input-icon" />
              <input
                id="fullName"
                type="text"
                className="form-input"
                placeholder="Professor Smith"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (localError) setLocalError(null);
                }}
                required
              />
            </div>
          </div>

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
                placeholder="At least 6 characters"
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
                <UserPlus size={20} />
                Register Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <span onClick={onToggleView}>Sign In</span>
        </div>
      </div>
    </div>
  );
};
