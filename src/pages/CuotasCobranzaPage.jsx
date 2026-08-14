import React, { useState, useEffect } from 'react';
import { CalendarClock, AlertTriangle, Clock, DollarSign, MessageSquare, RefreshCw } from 'lucide-react';
import { cuotasApi, getWhatsAppLink } from '../services/api';

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

  const handleWhatsApp = (c) => {
    const nombre = c.nombreCliente || c.clienteNombre || 'Cliente';
    const fecha = c.fechaVencimiento?.split('T')[0] || c.fechaVencimiento;
    const monto = (parseFloat(c.montoCuota) + parseFloat(c.interesMoratorio || 0)).toFixed(2);
    
    let mensaje = '';
    if (c.estado === 'Vencido') {
      mensaje = `Hola ${nombre}, le saludamos de *FGR Préstamos*. Le recordamos que su cuota #${c.numeroCuota} (Préstamo #${c.prestamoId}) presenta atraso por un total de *S/. ${monto}*. Agradecemos confirmar su pago a la brevedad.`;
    } else {
      mensaje = `Hola ${nombre}, le recordamos de *FGR Préstamos* que su cuota #${c.numeroCuota} (Préstamo #${c.prestamoId}) por *S/. ${monto}* vence el *${fecha}*. ¡Muchas gracias por su puntualidad!`;
    }

    const url = getWhatsAppLink(c.telefonoCliente, mensaje);
    if (url) window.open(url, '_blank');
    else window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const currentList = tabActive === 'vencidas' ? cuotasVencidas : cuotasPorVencer;

  return (
    <div className="content-body">
      <div className="card-panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div className="panel-title">
            <CalendarClock className="text-primary" size={22} />
            Módulo de Gestión de Cobranzas y Cuotas
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={loadData} title="Actualizar Datos" disabled={loading} style={{ padding: '0.5rem' }}>
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
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
                <th>Acciones</th>
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
                  const mora = parseFloat(c.interesMoratorio || 0);
                  const montoTotal = (parseFloat(c.montoCuota) + mora).toFixed(2);

                  return (
                    <tr key={c.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>Cuota #{c.numeroCuota}</td>
                      <td style={{ whiteSpace: 'nowrap' }}><strong>Préstamo #{c.prestamoId}</strong></td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{nombreCliente}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {dniCliente && `DNI: ${dniCliente}`} {c.telefonoCliente && `• Tel: ${c.telefonoCliente}`}
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fechaFormat}</td>
                      <td style={{ fontSize: '1rem', fontWeight: 700, color: tabActive === 'vencidas' ? '#dc2626' : '#059669', whiteSpace: 'nowrap' }}>
                        S/. {montoTotal}
                        {mora > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: 600 }}>
                            (Inc. S/. {mora.toFixed(2)} mora)
                          </div>
                        )}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>S/. {parseFloat(c.capital || 0).toFixed(2)}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>S/. {parseFloat(c.interes || 0).toFixed(2)}</td>
                      <td>
                        <span className={`badge badge-${c.estado?.toLowerCase()}`}>
                          {c.diasAtraso > 0 ? `${c.diasAtraso} días atraso` : c.estado}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleWhatsApp(c)}
                            title="Enviar WhatsApp"
                            style={{ color: '#059669', borderColor: 'rgba(5, 150, 105, 0.3)', padding: '0.35rem 0.55rem' }}
                          >
                            <MessageSquare size={13} />
                          </button>

                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onCobrarCuota({ ...c, montoCuota: montoTotal })}
                            style={{ padding: '0.35rem 0.65rem' }}
                          >
                            <DollarSign size={14} />
                            Cobrar
                          </button>
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
    </div>
  );
}
