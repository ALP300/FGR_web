import React, { useState, useEffect, useRef } from 'react';
import { Search, Banknote, Eye, Calculator, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { prestamosApi } from '../services/api';
import DetallePrestamoModal from '../components/DetallePrestamoModal';

export default function PrestamosPage({ onNuevoPrestamo, onOpenSimulador, onCobrarCuota, onRefinanciar, highlightPrestamoId }) {
  const [prestamos, setPrestamos] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const highlightTimer = useRef(null);

  useEffect(() => {
    loadPrestamos();
  }, [estadoFiltro]);

  useEffect(() => {
    if (highlightPrestamoId && !loading && prestamos.length > 0) {
      setActiveHighlight(highlightPrestamoId);
      setTimeout(() => {
        const el = document.getElementById(`prestamo-row-${highlightPrestamoId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(() => setActiveHighlight(null), 6000);
    }
    return () => { if (highlightTimer.current) clearTimeout(highlightTimer.current); };
  }, [highlightPrestamoId, loading, prestamos]);

  const loadPrestamos = async () => {
    setLoading(true);
    try {
      const data = await prestamosApi.getPrestamos(null, estadoFiltro);
      setPrestamos(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerCronograma = (p) => {
    setSelectedPrestamo(p);
    setIsDetalleOpen(true);
  };

  return (
    <div className="content-body">
      <div className="card-panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div className="panel-title">Cartera de Préstamos ({prestamos.length})</div>

          <div className="search-filter-bar">
            <select
              className="form-select no-icon"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="">Todos los Estados</option>
              <option value="EnCurso">En Curso</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Vencido">Vencidos</option>
              <option value="Pagado">Pagados</option>
              <option value="Cancelado">Cancelados</option>
            </select>

            <button className="btn btn-secondary" onClick={loadPrestamos} title="Actualizar Datos" disabled={loading} style={{ padding: '0.5rem' }}>
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>

            <button className="btn btn-secondary" onClick={onOpenSimulador}>
              <Calculator size={16} />
              Simular Préstamo
            </button>

            <button className="btn btn-primary" onClick={onNuevoPrestamo}>
              <Banknote size={16} />
              Nuevo Préstamo
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Préstamo #</th>
                <th>Cliente Titular</th>
                <th style={{ whiteSpace: 'nowrap' }}>Monto Desembolsado</th>
                <th>Modalidad / Tasa</th>
                <th>Cuotas</th>
                <th style={{ whiteSpace: 'nowrap' }}>Total Pagar</th>
                <th style={{ whiteSpace: 'nowrap' }}>Saldo Pendiente</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>Cargando préstamos de la API...</td>
                </tr>
              ) : prestamos.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay préstamos registrados con el estado seleccionado.
                  </td>
                </tr>
              ) : (
                prestamos.map((p) => {
                  const nombreCliente = p.nombreCliente || p.clienteNombre || (p.cliente ? `${p.cliente.nombres || ''} ${p.cliente.apellidos || ''}`.trim() : 'Sin Nombre');
                  const dniCliente = p.dniCliente || p.clienteDni || (p.cliente?.dni) || '';
                  const totalPagar = p.totalAPagar !== undefined ? p.totalAPagar : (p.totalPagar !== undefined ? p.totalPagar : 0);
                  const saldoPendiente = p.saldoPendienteTotal !== undefined ? p.saldoPendienteTotal : (p.saldoPendiente !== undefined ? p.saldoPendiente : 0);
                  
                    const isHighlighted = activeHighlight != null && activeHighlight == p.id;
                    return (
                      <tr 
                        key={p.id} 
                        id={`prestamo-row-${p.id}`}
                        className={isHighlighted ? 'highlighted-row' : ''}
                      >
                      <td style={{ whiteSpace: 'nowrap' }}><strong>Préstamo #{p.id}</strong></td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{nombreCliente}</div>
                        {dniCliente && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            DNI: {dniCliente}
                          </div>
                        )}
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>
                        S/. {parseFloat(p.montoDispersado || 0).toFixed(2)}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {p.modalidadPago} ({p.tasaInteres}%)
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{p.numeroCuotas} cuotas</td>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--accent-gold)', fontWeight: 600 }}>
                        S/. {parseFloat(totalPagar).toFixed(2)}
                      </td>
                      <td style={{ whiteSpace: 'nowrap', color: saldoPendiente > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
                        S/. {parseFloat(saldoPendiente).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge badge-${p.estado?.toLowerCase()}`}>{p.estado}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleVerCronograma(p)}
                          >
                            <Eye size={14} />
                            Cronograma
                          </button>

                          {(p.estado === 'EnCurso' || p.estado === 'Vencido') && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => onRefinanciar && onRefinanciar(p)}
                              title="Refinanciar o Ampliar Préstamo"
                              style={{ color: '#2563eb', borderColor: 'rgba(37, 99, 235, 0.3)' }}
                            >
                              <RefreshCw size={13} />
                              Refinanciar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DetallePrestamoModal
        isOpen={isDetalleOpen}
        onClose={() => setIsDetalleOpen(false)}
        prestamo={selectedPrestamo}
        onCobrarCuota={onCobrarCuota}
        onRefinanciar={onRefinanciar}
        onActualizar={loadPrestamos}
      />
    </div>
  );
}
