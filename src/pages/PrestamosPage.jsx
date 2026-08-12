import React, { useState, useEffect } from 'react';
import { Search, Banknote, Eye, Calculator, Calendar, DollarSign, User } from 'lucide-react';
import { prestamosApi } from '../services/api';
import DetallePrestamoModal from '../components/DetallePrestamoModal';

export default function PrestamosPage({ onNuevoPrestamo, onOpenSimulador, onCobrarCuota }) {
  const [prestamos, setPrestamos] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);

  useEffect(() => {
    loadPrestamos();
  }, [estadoFiltro]);

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
        <div className="panel-header">
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
                <th>Acción</th>
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
                  
                  return (
                    <tr key={p.id}>
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
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleVerCronograma(p)}
                        >
                          <Eye size={14} />
                          Cronograma
                        </button>
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
        onActualizar={loadPrestamos}
      />
    </div>
  );
}
