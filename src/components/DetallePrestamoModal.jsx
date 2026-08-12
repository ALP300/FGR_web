import React, { useState, useEffect } from 'react';
import { X, Banknote, Calendar, CheckCircle, Clock, AlertTriangle, XCircle, DollarSign } from 'lucide-react';
import { cuotasApi, prestamosApi } from '../services/api';

export default function DetallePrestamoModal({ isOpen, onClose, prestamo, onCobrarCuota, onActualizar }) {
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && prestamo) {
      loadCuotas();
    }
  }, [isOpen, prestamo]);

  const loadCuotas = async () => {
    setLoading(true);
    try {
      const data = await cuotasApi.getCuotasByPrestamo(prestamo.id);
      setCuotas(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (window.confirm(`¿Está seguro de cancelar el préstamo #${prestamo.id}? Esta acción cambiará el estado a Cancelado.`)) {
      try {
        await prestamosApi.cancelarPrestamo(prestamo.id);
        if (onActualizar) onActualizar();
        onClose();
      } catch (err) {
        alert('Error al cancelar préstamo');
      }
    }
  };

  if (!isOpen || !prestamo) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '850px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Banknote className="text-primary" size={22} />
              Préstamo #{prestamo.id} - {prestamo.clienteNombre}
            </h3>
            <span className={`badge badge-${prestamo.estado?.toLowerCase()}`} style={{ marginTop: '4px' }}>
              {prestamo.estado}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Summary Cards */}
          <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="kpi-card" style={{ padding: '0.9rem' }}>
              <div className="kpi-info">
                <h4>Monto Entregado</h4>
                <div className="kpi-value">S/. {parseFloat(prestamo.montoDispersado).toFixed(2)}</div>
              </div>
            </div>

            <div className="kpi-card" style={{ padding: '0.9rem' }}>
              <div className="kpi-info">
                <h4>Modalidad / Tasa</h4>
                <div className="kpi-value" style={{ fontSize: '1.2rem' }}>
                  {prestamo.modalidadPago} ({prestamo.tasaInteres}%)
                </div>
              </div>
            </div>

            <div className="kpi-card" style={{ padding: '0.9rem' }}>
              <div className="kpi-info">
                <h4>Total a Pagar</h4>
                <div className="kpi-value" style={{ color: 'var(--accent-gold)' }}>S/. {parseFloat(prestamo.totalPagar).toFixed(2)}</div>
              </div>
            </div>

            <div className="kpi-card" style={{ padding: '0.9rem' }}>
              <div className="kpi-info">
                <h4>Saldo Pendiente</h4>
                <div className="kpi-value" style={{ color: prestamo.saldoPendiente > 0 ? '#ef4444' : '#10b981' }}>
                  S/. {parseFloat(prestamo.saldoPendiente).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Cronograma de Cuotas Table */}
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} className="text-primary" />
            Cronograma y Estado de Cuotas
          </h4>

          <div className="table-responsive" style={{ maxHeight: '300px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>N° Cuota</th>
                  <th>Fecha Vencimiento</th>
                  <th>Monto Cuota</th>
                  <th>Capital</th>
                  <th>Interés</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem' }}>Cargando cuotas...</td>
                  </tr>
                ) : cuotas.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>No hay cuotas registradas.</td>
                  </tr>
                ) : (
                  cuotas.map(c => (
                    <tr key={c.id}>
                      <td>Cuota #{c.numeroCuota}</td>
                      <td>{c.fechaVencimiento}</td>
                      <td><strong>S/. {parseFloat(c.montoCuota).toFixed(2)}</strong></td>
                      <td>S/. {parseFloat(c.capital).toFixed(2)}</td>
                      <td>S/. {parseFloat(c.interes).toFixed(2)}</td>
                      <td>
                        <span className={`badge badge-${c.estado.toLowerCase()}`}>
                          {c.estado === 'Pagado' && <CheckCircle size={12} />}
                          {c.estado === 'Vencido' && <AlertTriangle size={12} />}
                          {c.estado === 'Pendiente' && <Clock size={12} />}
                          {c.estado}
                        </span>
                      </td>
                      <td>
                        {c.estado !== 'Pagado' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              onClose();
                              if (onCobrarCuota) onCobrarCuota(c);
                            }}
                          >
                            <DollarSign size={13} />
                            Cobrar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          {prestamo.estado !== 'Cancelado' && prestamo.estado !== 'Pagado' && (
            <button className="btn btn-danger btn-sm" onClick={handleCancelar} style={{ marginRight: 'auto' }}>
              <XCircle size={15} />
              Cancelar Préstamo
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
