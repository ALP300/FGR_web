import React, { useState, useEffect } from 'react';
import { Receipt, Search, Plus, CreditCard, DollarSign, Calendar } from 'lucide-react';
import { pagosApi } from '../services/api';

export default function PagosPage({ onNuevoPago }) {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState('');

  useEffect(() => {
    loadPagos();
  }, []);

  const loadPagos = async () => {
    setLoading(true);
    try {
      const data = await pagosApi.getPagos();
      setPagos(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = pagos.filter(p => 
    p.clienteNombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    p.numeroOperacion?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    p.prestamoId.toString().includes(filtroTexto)
  );

  return (
    <div className="content-body">
      <div className="card-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Receipt className="text-primary" size={22} />
            Historial Transaccional de Cobros ({pagos.length})
          </div>

          <div className="search-filter-bar">
            <div className="input-group">
              <Search size={16} />
              <input
                type="text"
                className="form-input"
                placeholder="Buscar por Operación, Cliente o Préstamo..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" onClick={onNuevoPago}>
              <Plus size={16} />
              Registrar Cobro
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Recibo / Operación</th>
                <th>Fecha y Hora</th>
                <th>Préstamo #</th>
                <th>Cliente</th>
                <th>Monto Recibido</th>
                <th>Método de Pago</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Cargando pagos...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No se registraron cobros con los términos ingresados.
                  </td>
                </tr>
              ) : (
                filtered.map((pg) => (
                  <tr key={pg.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                        {pg.numeroOperacion}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                        <Calendar size={13} className="text-muted" />
                        {pg.fechaPago}
                      </div>
                    </td>
                    <td><strong>Préstamo #{pg.prestamoId}</strong></td>
                    <td>{pg.clienteNombre}</td>
                    <td style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>
                      S/. {parseFloat(pg.monto).toFixed(2)}
                    </td>
                    <td>
                      <span className="badge badge-activo" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                        <CreditCard size={12} />
                        {pg.metodoPago}
                      </span>
                    </td>
                    <td>{pg.observaciones || 'Sin notas'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
