import React from 'react';
import { LogOut, X, AlertCircle } from 'lucide-react';

export default function ConfirmLogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '420px' }}>
        <div className="modal-header" style={{ background: '#f8fafc' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontSize: '1.1rem' }}>
            <LogOut size={20} />
            Cerrar Sesión
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center', padding: '1.75rem 1.5rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(220, 38, 38, 0.1)',
            color: '#dc2626',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <AlertCircle size={28} />
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            ¿Deseas cerrar tu sesión?
          </h4>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Al salir de FGR Préstamos & Cobranzas, tendrás que volver a ingresar tu usuario y contraseña para acceder al sistema.
          </p>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center', gap: '0.75rem', background: '#f8fafc' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={onConfirm} style={{ flex: 1 }}>
            <LogOut size={16} />
            Sí, Salir
          </button>
        </div>
      </div>
    </div>
  );
}
