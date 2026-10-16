import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, loading } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Developer');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (tab === 'login') {
      const ok = await login(email, password);
      if (ok) onClose();
    } else {
      if (!name.trim()) {
        showToast('Name is required', 'error');
        return;
      }
      const ok = await register(name, email, password, role);
      if (ok) onClose();
    }
  };

  const fillQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setTab('login');
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container modal-sm auth-modal">
        <div className="modal-header">
          <div className="auth-brand-badge">
            <i className="fa-solid fa-bolt"></i>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="auth-title-section">
          <h3>{tab === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
          <p>{tab === 'login' ? 'Sign in to access your CyberPulse workspace' : 'Join your team and collaborate on projects'}</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Register
          </button>
        </div>

        {/* Quick Demo Credentials for Fast Evaluation */}
        {tab === 'login' && (
          <div className="quick-demo-box">
            <span className="demo-label">⚡ 1-Click Demo Accounts:</span>
            <div className="demo-btns-row">
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => fillQuickDemo('satyam@example.com', 'password123')}
              >
                Satyam (Lead)
              </button>
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => fillQuickDemo('alex@example.com', 'password123')}
              >
                Alex (Frontend)
              </button>
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => fillQuickDemo('priya@example.com', 'password123')}
              >
                Priya (Backend)
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-content">
          {tab === 'register' && (
            <>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="input-primary"
                  placeholder="e.g. Satyam Pal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Professional Role</label>
                <select
                  className="input-primary"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Project Lead">Project Lead</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Backend Architect">Backend Architect</option>
                  <option value="Product Designer">Product Designer</option>
                  <option value="QA Specialist">QA Specialist</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Work Email *</label>
            <input
              type="email"
              className="input-primary"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              className="input-primary"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary full-btn auth-submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : tab === 'login' ? 'Sign In to Workspace' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
