import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import Builder from './pages/Builder'
import Preview from './pages/Preview'
import Ratecard from './pages/Ratecard'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <div className="app-layout">
        <Header />
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/ratecard" element={
              <ProtectedRoute adminOnly={true}>
                <Ratecard />
              </ProtectedRoute>
            } />
            
            <Route path="/new" element={
              <ProtectedRoute editorOnly={true}>
                <Builder />
              </ProtectedRoute>
            } />
            
            <Route path="/edit/:id" element={
              <ProtectedRoute editorOnly={true}>
                <Builder />
              </ProtectedRoute>
            } />
            
            <Route path="/preview/:id" element={
              <ProtectedRoute>
                <Preview />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </AuthProvider>
  )
}
