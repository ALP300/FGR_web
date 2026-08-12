import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Mail, CreditCard, Banknote, ToggleLeft } from 'lucide-react';
import { clientesApi } from '../services/api';

export default function DetalleClienteModal({ isOpen, onClose, cliente, onActualizar }) {
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && cliente) {
      loadHistorial();
    }
  }, [isOpen, cliente]);

  const loadHistorial = async () => {
    setLoading(true);
    try {
      const data = await clientesApi.getHistorialCliente(cliente.id);
      setHistorial(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleEstado = async () => {
    const nuevoEstado = cliente.estado === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      await clientesApi.patchEstadoCliente(cliente.id, nuevoEstado);
      if (onActualizar) onActualizar();
      onClose();
    } catch (err) {
      alert('Error al cambiar el estado del cliente.');
    }
  };

  if (!isOpen || !cliente) return null;

  const nombreCliente = cliente.nombreCompleto || `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim() || 'Cliente';

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '750px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User className="text-primary" size={22} />
              {nombreCliente}
            </h3>
            <span className={`badge badge-${cliente.estado?.toLowerCase()}`} style={{ marginTop: '4px' }}>
              {cliente.estado}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Info grid */}
          <div className="form-grid" style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DNI:</span>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cliente.dni}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Teléfono:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cliente.telefono || 'Sin registrar'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Correo:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cliente.correo || 'Sin registrar'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Dirección:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cliente.direccion || 'Sin registrar'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Contacto Emergencia:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cliente.contactoEmergencia || 'Sin registrar'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Observaciones:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cliente.observaciones || 'Sin observaciones'}</div>
            </div>
          </div>

          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Banknote size={18} className="text-primary" />
            Historial de Préstamos del Cliente
          </h4>

          <div className="table-responsive" style={{ maxHeight: '260px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Préstamo #</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Monto</th>
                  <th>Modalidad</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Total Pagar</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Saldo Pendiente</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '1.25rem' }}>Cargando historial...</td>
                  </tr>
                ) : !historial?.prestamos || historial.prestamos.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '1.25rem', color: 'var(--text-muted)' }}>El cliente no posee préstamos registrados.</td>
                  </tr>
                ) : (
                  historial.prestamos.map(p => (
                    <tr key={p.id}>
                      <td style={{ whiteSpace: 'nowrap' }}><strong>Préstamo #{p.id}</strong></td>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>S/. {parseFloat(p.montoDispersado).toFixed(2)}</td>
                      <td>{p.modalidadPago}</td>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--accent-gold)', fontWeight: 600 }}>S/. {parseFloat(p.totalPagar).toFixed(2)}</td>
                      <td style={{ whiteSpace: 'nowrap', color: p.saldoPendiente > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
                        S/. {parseFloat(p.saldoPendiente).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge badge-${p.estado?.toLowerCase()}`}>{p.estado}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary btn-sm" onClick={toggleEstado}>
            <ToggleLeft size={16} />
            <span>Cambiar a {cliente.estado === 'Activo' ? 'Inactivo' : 'Activo'}</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            <span>Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
