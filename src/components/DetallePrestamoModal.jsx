import React, { useState, useEffect } from 'react';
import { X, Banknote, Calendar, CheckCircle, Clock, AlertTriangle, XCircle, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { cuotasApi, prestamosApi } from '../services/api';
import ConfirmModal from './ConfirmModal';

export default function DetallePrestamoModal({ isOpen, onClose, prestamo, onCobrarCuota, onRefinanciar, onActualizar }) {
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConfirmCancelarOpen, setIsConfirmCancelarOpen] = useState(false);
  const [isCancelando, setIsCancelando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && prestamo) {
      setErrorMsg('');
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
      setErrorMsg('No se pudieron cargar las cuotas del préstamo.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancelar = async () => {
    setIsCancelando(true);
    try {
      await prestamosApi.cancelarPrestamo(prestamo.id);
      setIsConfirmCancelarOpen(false);
      if (onActualizar) onActualizar();
      onClose();
    } catch (err) {
      setErrorMsg('Error al cancelar el préstamo. Verifique que no tenga pagos consolidados.');
    } finally {
      setIsCancelando(false);
    }
  };

  const handleRefinanciar = () => {
    if (onRefinanciar) {
      onRefinanciar(prestamo);
      onClose();
    }
  };

  if (!isOpen || !prestamo) return null;

  const nombreCliente = prestamo.clienteNombre || prestamo.nombreCliente || 'Cliente';
  const totalPagar = prestamo.totalAPagar !== undefined ? prestamo.totalAPagar : (prestamo.totalPagar !== undefined ? prestamo.totalPagar : 0);
  const saldoPendiente = prestamo.saldoPendienteTotal !== undefined ? prestamo.saldoPendienteTotal : (prestamo.saldoPendiente !== undefined ? prestamo.saldoPendiente : 0);

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-container" style={{ maxWidth: '850px' }}>
          <div className="modal-header">
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Banknote className="text-primary" size={22} />
                Préstamo #{prestamo.id} - {nombreCliente}
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
            {errorMsg && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#dc2626',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Summary Cards */}
            <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="kpi-card" style={{ padding: '0.9rem' }}>
                <div className="kpi-info">
                  <h4>Monto Entregado</h4>
                  <div className="kpi-value" style={{ whiteSpace: 'nowrap' }}>S/. {parseFloat(prestamo.montoDispersado).toFixed(2)}</div>
                </div>
              </div>

              <div className="kpi-card" style={{ padding: '0.9rem' }}>
                <div className="kpi-info">
                  <h4>Modalidad / Tasa</h4>
                  <div className="kpi-value" style={{ fontSize: '1.2rem', whiteSpace: 'nowrap' }}>
                    {prestamo.modalidadPago} ({prestamo.tasaInteres}%)
                  </div>
                </div>
              </div>

              <div className="kpi-card" style={{ padding: '0.9rem' }}>
                <div className="kpi-info">
                  <h4>Total a Pagar</h4>
                  <div className="kpi-value" style={{ color: 'var(--accent-gold)', whiteSpace: 'nowrap' }}>S/. {parseFloat(totalPagar).toFixed(2)}</div>
                </div>
              </div>

              <div className="kpi-card" style={{ padding: '0.9rem' }}>
                <div className="kpi-info">
                  <h4>Saldo Pendiente</h4>
                  <div className="kpi-value" style={{ color: saldoPendiente > 0 ? '#dc2626' : '#059669', whiteSpace: 'nowrap' }}>
                    S/. {parseFloat(saldoPendiente).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Cronograma de Cuotas Table */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <Calendar size={18} className="text-primary" />
              Cronograma y Estado de Cuotas
            </h4>

            <div className="table-responsive" style={{ maxHeight: '280px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>N° Cuota</th>
                    <th>Fecha Vencimiento</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Monto Cuota</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Capital</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Interés</th>
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
                        <td style={{ whiteSpace: 'nowrap' }}>Cuota #{c.numeroCuota}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{c.fechaVencimiento?.split('T')[0] || c.fechaVencimiento}</td>
                        <td style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>S/. {parseFloat(c.montoCuota).toFixed(2)}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>S/. {parseFloat(c.capital || 0).toFixed(2)}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>S/. {parseFloat(c.interes || 0).toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-${c.estado?.toLowerCase()}`}>
                            {c.estado === 'Pagado' && <CheckCircle size={12} />}
                            {c.estado === 'Vencido' && <AlertTriangle size={12} />}
                            {c.estado === 'Pendiente' && <Clock size={12} />}
                            {c.estado}
                          </span>
                        </td>
                        <td>
                          {c.estado !== 'Pagado' && prestamo.estado !== 'Cancelado' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                if (onCobrarCuota) {
                                  onCobrarCuota({ ...c, prestamoId: prestamo.id });
                                  onClose();
                                }
                              }}
                            >
                              <DollarSign size={14} />
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

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <div>
              {prestamo.estado !== 'Cancelado' && prestamo.estado !== 'Pagado' && (
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setIsConfirmCancelarOpen(true)} 
                  style={{ color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.3)' }}
                >
                  <XCircle size={16} />
                  Cancelar Préstamo
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(prestamo.estado === 'EnCurso' || prestamo.estado === 'Vencido') && (
                <button className="btn btn-secondary" onClick={handleRefinanciar} style={{ color: '#2563eb', borderColor: 'rgba(37, 99, 235, 0.3)' }}>
                  <RefreshCw size={16} />
                  Refinanciar Préstamo
                </button>
              )}

              <button className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmación estilizada para Cancelar Préstamo */}
      <ConfirmModal
        isOpen={isConfirmCancelarOpen}
        onClose={() => setIsConfirmCancelarOpen(false)}
        onConfirm={handleConfirmCancelar}
        title="¿Cancelar este Préstamo?"
        type="danger"
        confirmText="Sí, Cancelar Préstamo"
        cancelText="Volver"
        isLoading={isCancelando}
        message={`¿Está seguro de cancelar el préstamo #${prestamo.id} de ${nombreCliente}? Esta acción cambiará el estado a Cancelado.`}
        highlightText={`Saldo pendiente: S/. ${parseFloat(saldoPendiente).toFixed(2)}`}
      />
    </>
  );
}
