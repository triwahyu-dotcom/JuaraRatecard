import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false, editorOnly = false }) {
  const { user, isAdmin, isEditor, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--text)' }}></div>
        <p className="text-muted font-mono text-xs">VERIFYING AUTH...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (editorOnly && !isEditor) {
    return <Navigate to="/" replace />;
  }

  return children;
}
