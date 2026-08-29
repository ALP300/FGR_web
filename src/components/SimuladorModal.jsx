import React, { useState } from 'react';
import { X, Calculator, CheckCircle, Calendar, DollarSign, Percent, Info, TrendingDown } from 'lucide-react';

export default function SimuladorModal({ isOpen, onClose, onProcederPrestamo }) {
  const [monto, setMonto] = useState(1000);
  const [tasaInteres, setTasaInteres] = useState(10);
  const [fechaPrimerPago, setFechaPrimerPago] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [amortizacionSimulada, setAmortizacionSimulada] = useState(500);

  const SUGGESTED_MONTOS = [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000];

  if (!isOpen) return null;

  const montoNum = parseFloat(monto) || 0;
  const tasaNum = parseFloat(tasaInteres) || 0;
  const interesMensual = Math.round((montoNum * (tasaNum / 100)) * 100) / 100;
  const esMontoValido = montoNum >= 500 && montoNum % 500 === 0;

  // Cálculo de simulación de amortización
  const amortNum = Math.min(montoNum, Math.max(500, parseFloat(amortizacionSimulada) || 500));
  const capitalRestante = Math.max(0, montoNum - amortNum);
  const nuevoInteresMensual = Math.round((capitalRestante * (tasaNum / 100)) * 100) / 100;
  const ahorroMensual = Math.round((interesMensual - nuevoInteresMensual) * 100) / 100;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '780px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator className="text-primary" size={22} />
            Simulador de Préstamos (Interés Mensual & Plazo Abierto)
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Montos Rápidos */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>
              Monto a Prestar (Mínimo S/. 500, en múltiplos de S/. 500):
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {SUGGESTED_MONTOS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonto(m)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: monto === m ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                    background: monto === m ? 'var(--primary-light)' : '#ffffff',
                    color: monto === m ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: monto === m ? 700 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  S/. {m.toLocaleString('es-PE')}
                </button>
              ))}
            </div>

            <div className="input-group">
              <DollarSign size={16} />
              <input
                type="number"
                className="form-input"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                step="500"
                min="500"
                placeholder="500, 1000, 1500..."
              />
            </div>
            {!esMontoValido && montoNum > 0 && (
              <span style={{ color: '#d97706', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                ⚠️ El monto debe ser mínimo S/. 500 y en múltiplos de S/. 500 (ej. 500, 1000, 1500, 2000...).
              </span>
            )}
          </div>

          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="field-group">
              <label>Tasa de Interés Mensual (%)</label>
              <div className="input-group">
                <Percent size={16} />
                <input
                  type="number"
                  className="form-input"
                  value={tasaInteres}
                  onChange={(e) => setTasaInteres(e.target.value)}
                  step="any"
                  min="0"
                />
              </div>
            </div>

            <div className="field-group">
              <label>Fecha de Primer Cobro de Interés</label>
              <div className="input-group">
                <Calendar size={16} />
                <input
                  type="date"
                  className="form-input"
                  value={fechaPrimerPago}
                  onChange={(e) => setFechaPrimerPago(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tarjetas KPI de Resumen */}
          <div className="kpi-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="kpi-card" style={{ padding: '0.9rem 1.1rem' }}>
              <div className="kpi-info">
                <h4>Capital a Prestar</h4>
                <div className="kpi-value text-primary">S/. {montoNum.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Monto desembolsado</div>
              </div>
            </div>

            <div className="kpi-card" style={{ padding: '0.9rem 1.1rem' }}>
              <div className="kpi-info">
                <h4>Interés Mensual</h4>
                <div className="kpi-value" style={{ color: 'var(--accent-gold)' }}>
                  S/. {interesMensual.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tasaNum}% de S/. {montoNum}</div>
              </div>
            </div>

            <div className="kpi-card" style={{ padding: '0.9rem 1.1rem' }}>
              <div className="kpi-info">
                <h4>Plazo de Devolución</h4>
                <div className="kpi-value" style={{ fontSize: '1.1rem', color: '#3b82f6' }}>Flexible / Abierto</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>A decisión del cliente</div>
              </div>
            </div>
          </div>

          {/* Simulador Interactivo de Amortización a Capital */}
          <div style={{
            background: 'rgba(37, 99, 235, 0.05)',
            border: '1.5px solid rgba(37, 99, 235, 0.2)',
            borderRadius: '12px',
            padding: '1.1rem 1.25rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <TrendingDown size={20} style={{ color: '#2563eb' }} />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Simulador de Abono a Capital (Múltiplos de S/. 500)
              </h4>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Cuando el cliente abona a capital, el capital disminuye y el interés para el siguiente mes se reduce automáticamente:
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Si el cliente abona a capital:</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[500, 1000, 1500, 2000].filter(val => val <= montoNum).map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmortizacionSimulada(val)}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      border: amortizacionSimulada === val ? '1.5px solid #2563eb' : '1px solid var(--border-color)',
                      background: amortizacionSimulada === val ? 'rgba(37, 99, 235, 0.15)' : '#ffffff',
                      color: amortizacionSimulada === val ? '#2563eb' : 'var(--text-main)',
                      fontWeight: amortizacionSimulada === val ? 700 : 500,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    - S/. {val}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              background: '#ffffff',
              padding: '0.85rem',
              borderRadius: '8px',
              border: '1px solid rgba(37, 99, 235, 0.15)'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Capital Restante:</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  S/. {capitalRestante.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nuevo Interés Mensual:</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
                  S/. {nuevoInteresMensual.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ahorro en Interés:</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2563eb' }}>
                  - S/. {ahorroMensual.toLocaleString('es-PE', { minimumFractionDigits: 2 })} / mes
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          {onProcederPrestamo && (
            <button 
              className="btn btn-primary"
              disabled={!esMontoValido}
              onClick={() => {
                onClose();
                onProcederPrestamo({
                  montoDispersado: montoNum,
                  tasaInteres: tasaNum,
                  tipoInteres: 'Mensual',
                  modalidadPago: 'Mensual',
                  numeroCuotas: 1,
                  fechaPrimerPago
                });
              }}
            >
              <CheckCircle size={16} />
              Aprobar este Préstamo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
