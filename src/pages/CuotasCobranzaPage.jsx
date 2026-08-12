import React, { useState, useEffect } from 'react';
import { CalendarClock, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { cuotasApi } from '../services/api';

export default function CuotasCobranzaPage({ onCobrarCuota }) {
  const [tabActive, setTabActive] = useState('vencidas');
  const [cuotasVencidas, setCuotasVencidas] = useState([]);
  const [cuotasPorVencer, setCuotasPorVencer] = useState([]);
  const [diasFiltro, setDiasFiltro] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [diasFiltro]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vencidas, porVencer] = await Promise.all([
        cuotasApi.getCuotasVencidas().catch(() => []),
        cuotasApi.getCuotasPorVencer(diasFiltro).catch(() => [])
      ]);
      setCuotasVencidas(vencidas || []);
      setCuotasPorVencer(porVencer || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentList = tabActive === 'vencidas' ? cuotasVencidas : cuotasPorVencer;

  return (
    <div className="content-body">
      <div className="card-panel">
        <div className="panel-header">
          <div className="panel-title">
            <CalendarClock className="text-primary" size={22} />
            Módulo de Gestión de Cobranzas y Cuotas
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn ${tabActive === 'vencidas' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTabActive('vencidas')}
              style={{ background: tabActive === 'vencidas' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : undefined }}
            >
              <AlertTriangle size={15} />
              Cuotas Vencidas ({cuotasVencidas.length})
            </button>

            <button
              className={`btn ${tabActive === 'por-vencer' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTabActive('por-vencer')}
            >
              <Clock size={15} />
              Por Vencer ({cuotasPorVencer.length})
            </button>
          </div>
        </div>

        {tabActive === 'por-vencer' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.5rem 0' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mostrar cuotas a vencer en los próximos:</span>
            <select
              className="form-select no-icon"
              style={{ width: '120px' }}
              value={diasFiltro}
              onChange={(e) => setDiasFiltro(e.target.value)}
            >
              <option value="3">3 días</option>
              <option value="7">7 días</option>
              <option value="15">15 días</option>
              <option value="30">30 días</option>
            </select>
          </div>
        )}

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>N° Cuota</th>
                <th>Préstamo #</th>
                <th>Cliente Titular</th>
                <th style={{ whiteSpace: 'nowrap' }}>Fecha Vencimiento</th>
                <th style={{ whiteSpace: 'nowrap' }}>Monto a Cobrar</th>
                <th style={{ whiteSpace: 'nowrap' }}>Capital</th>
                <th style={{ whiteSpace: 'nowrap' }}>Interés</th>
                <th>Estado / Atraso</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>Cargando información de cuotas...</td>
                </tr>
              ) : currentList.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay cuotas registradas en esta categoría.
                  </td>
                </tr>
              ) : (
                currentList.map((c) => {
                  const nombreCliente = c.nombreCliente || c.clienteNombre || '---';
                  const dniCliente = c.dniCliente || c.clienteDni || '';
                  const fechaFormat = c.fechaVencimiento?.split('T')[0] || c.fechaVencimiento;
                  return (
                    <tr key={c.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>Cuota #{c.numeroCuota}</td>
                      <td style={{ whiteSpace: 'nowrap' }}><strong>Préstamo #{c.prestamoId}</strong></td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{nombreCliente}</div>
                        {dniCliente && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DNI: {dniCliente}</div>}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fechaFormat}</td>
                      <td style={{ fontSize: '1rem', fontWeight: 700, color: tabActive === 'vencidas' ? '#dc2626' : '#059669', whiteSpace: 'nowrap' }}>
                        S/. {parseFloat(c.montoCuota).toFixed(2)}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>S/. {parseFloat(c.capital || 0).toFixed(2)}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>S/. {parseFloat(c.interes || 0).toFixed(2)}</td>
                      <td>
                        <span className={`badge badge-${c.estado?.toLowerCase()}`}>
                          {c.diasAtraso > 0 ? `${c.diasAtraso} días atraso` : c.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onCobrarCuota(c)}
                        >
                          <DollarSign size={14} />
                          Cobrar Cuota
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
    </div>
  );
}
