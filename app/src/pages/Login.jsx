import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/supabase';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await auth.signIn(email, password);
      if (error) throw error;
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card-container">
        <div className="login-card fade-in">
          <div className="login-header">
            <h1 className="login-logo">JUARA</h1>
            <p className="login-subtitle">Ratecard Manager System</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="login-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Business Email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="email@juara.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Authenticating...
                </>
              ) : 'Access System'}
            </button>
          </form>
          
          <div className="login-footer">
            © 2026 PT Juara. Secured via Supabase Auth.
          </div>
        </div>
      </div>
    </div>
  );
}
