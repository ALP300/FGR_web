import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error no controlado:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          padding: '2rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #fecaca',
            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.1)',
            padding: '2.5rem',
            maxWidth: '560px',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              marginBottom: '1.25rem'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Ha ocurrido un detalle en esta vista
            </h3>
            
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              La vista no pudo representarse debido a una excepción temporal. Puedes reintentar cargar los datos o regresar al panel principal.
            </p>

            {this.state.error && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.78rem',
                fontFamily: 'monospace',
                color: '#dc2626',
                textAlign: 'left',
                marginBottom: '1.5rem',
                overflowX: 'auto',
                maxHeight: '120px'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.location.reload()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <RefreshCw size={15} />
                Recargar Sistema
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleReset}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Home size={15} />
                Reintentar Vista
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
