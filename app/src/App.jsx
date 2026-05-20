import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import Builder from './pages/Builder'
import QuickBuilder from './pages/QuickBuilder'
import Preview from './pages/Preview'
import Ratecard from './pages/Ratecard'

export default function App() {
  return (
    <div className="app-layout">
      <Header />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ratecard" element={<Ratecard />} />
          <Route path="/new" element={<Builder />} />
          <Route path="/edit/:id" element={<Builder />} />
          <Route path="/quick-new" element={<QuickBuilder />} />
          <Route path="/quick-edit/:id" element={<QuickBuilder />} />
          <Route path="/preview/:id" element={<Preview />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </div>
  )
}
