import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 40, background: '#08080f', color: '#f0f0f5',
          height: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
          <h2 style={{ marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ color: '#9090aa', marginBottom: 24, maxWidth: 500 }}>
            The application encountered a runtime error. This might be due to a data mismatch or a calculation error.
          </p>
          <pre style={{
            background: '#1a1a25', padding: 16, borderRadius: 8,
            fontSize: 12, color: '#e53935', maxWidth: '80vw', overflow: 'auto',
            textAlign: 'left', border: '1px solid #2d2d4a'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.href = '#/'}
            className="btn btn-primary"
            style={{ marginTop: 24 }}
          >
            Go to Dashboard
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
