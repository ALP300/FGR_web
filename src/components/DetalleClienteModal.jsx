import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Mail, CreditCard, Banknote, Receipt, ToggleLeft } from 'lucide-react';
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

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User className="text-primary" size={22} />
              {cliente.nombres} {cliente.apellidos}
            </h3>
            <span className={`badge badge-${cliente.estado.toLowerCase()}`} style={{ marginTop: '4px' }}>
              {cliente.estado}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Info grid */}
          <div className="form-grid" style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DNI:</span>
              <div style={{ fontWeight: 600 }}>{cliente.dni}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Teléfono:</span>
              <div style={{ fontWeight: 600 }}>{cliente.telefono || 'Sin registrar'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Correo:</span>
              <div style={{ fontWeight: 600 }}>{cliente.correo || 'Sin registrar'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dirección:</span>
              <div style={{ fontWeight: 600 }}>{cliente.direccion || 'Sin registrar'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contacto Emergencia:</span>
              <div style={{ fontWeight: 600 }}>{cliente.contactoEmergencia || 'Sin registrar'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Observaciones:</span>
              <div style={{ fontWeight: 600 }}>{cliente.observaciones || 'Sin observaciones'}</div>
            </div>
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Banknote size={18} className="text-primary" />
            Historial de Préstamos del Cliente
          </h4>

          <div className="table-responsive" style={{ maxHeight: '200px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Préstamo #</th>
                  <th>Monto</th>
                  <th>Modalidad</th>
                  <th>Total Pagar</th>
                  <th>Saldo Pendiente</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>Cargando historial...</td>
                  </tr>
                ) : !historial?.prestamos || historial.prestamos.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>El cliente no posee préstamos registrados.</td>
                  </tr>
                ) : (
                  historial.prestamos.map(p => (
                    <tr key={p.id}>
                      <td>Préstamo #{p.id}</td>
                      <td>S/. {parseFloat(p.montoDispersado).toFixed(2)}</td>
                      <td>{p.modalidadPago}</td>
                      <td>S/. {parseFloat(p.totalPagar).toFixed(2)}</td>
                      <td>S/. {parseFloat(p.saldoPendiente).toFixed(2)}</td>
                      <td>
                        <span className={`badge badge-${p.estado.toLowerCase()}`}>{p.estado}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={toggleEstado} style={{ marginRight: 'auto' }}>
            <ToggleLeft size={16} />
            Cambiar a {cliente.estado === 'Activo' ? 'Inactivo' : 'Activo'}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
