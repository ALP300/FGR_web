import React, { useState, useEffect } from 'react';
import { X, Calculator, CheckCircle, Calendar, DollarSign, Percent } from 'lucide-react';
import { prestamosApi } from '../services/api';

export default function SimuladorModal({ isOpen, onClose, onProcederPrestamo }) {
  const [monto, setMonto] = useState(1000);
  const [tasaInteres, setTasaInteres] = useState(10);
  const [tipoInteres, setTipoInteres] = useState('Diario');
  const [modalidadPago, setModalidadPago] = useState('Diario');
  const [numeroCuotas, setNumeroCuotas] = useState(20);
  const [fechaPrimerPago, setFechaPrimerPago] = useState(new Date().toISOString().split('T')[0]);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handleSimular();
    }
  }, [monto, tasaInteres, tipoInteres, modalidadPago, numeroCuotas, fechaPrimerPago, isOpen]);

  const handleSimular = async () => {
    setLoading(true);
    try {
      const sim = await prestamosApi.simularPrestamo({
        monto: parseFloat(monto) || 0,
        tasaInteres: parseFloat(tasaInteres) || 0,
        tipoInteres,
        modalidadPago,
        numeroCuotas: parseInt(numeroCuotas) || 1,
        fechaPrimerPago
      });
      setResultado(sim);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator className="text-primary" size={22} />
            Simulador de Préstamos y Amortización
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="field-group">
              <label>Monto a Prestar (S/.)</label>
              <div className="input-group">
                <DollarSign size={16} />
                <input
                  type="number"
                  className="form-input"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  min="50"
                  step="50"
                />
              </div>
            </div>

            <div className="field-group">
              <label>Tasa de Interés (%)</label>
              <div className="input-group">
                <Percent size={16} />
                <input
                  type="number"
                  className="form-input"
                  value={tasaInteres}
                  onChange={(e) => setTasaInteres(e.target.value)}
                  step="0.5"
                />
              </div>
            </div>

            <div className="field-group">
              <label>Modalidad de Pago</label>
              <select
                className="form-select no-icon"
                value={modalidadPago}
                onChange={(e) => {
                  setModalidadPago(e.target.value);
                  setTipoInteres(e.target.value);
                }}
              >
                <option value="Diario">Diario</option>
                <option value="Semanal">Semanal</option>
                <option value="Quincenal">Quincenal</option>
                <option value="Mensual">Mensual</option>
              </select>
            </div>

            <div className="field-group">
              <label>Número de Cuotas</label>
              <input
                type="number"
                className="form-input no-icon"
                value={numeroCuotas}
                onChange={(e) => setNumeroCuotas(e.target.value)}
                min="1"
                max="365"
              />
            </div>

            <div className="field-group">
              <label>Fecha de Primer Pago</label>
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

          {resultado && (
            <div>
              <div className="kpi-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="kpi-card" style={{ padding: '0.9rem 1.1rem' }}>
                  <div className="kpi-info">
                    <h4>Monto a Entregar</h4>
                    <div className="kpi-value text-primary">S/. {resultado.monto?.toFixed(2)}</div>
                  </div>
                </div>

                <div className="kpi-card" style={{ padding: '0.9rem 1.1rem' }}>
                  <div className="kpi-info">
                    <h4>Ganancia Interés</h4>
                    <div className="kpi-value" style={{ color: 'var(--accent-gold)' }}>S/. {resultado.totalInteres?.toFixed(2)}</div>
                  </div>
                </div>

                <div className="kpi-card" style={{ padding: '0.9rem 1.1rem' }}>
                  <div className="kpi-info">
                    <h4>Total a Cobrar</h4>
                    <div className="kpi-value">S/. {resultado.totalPagar?.toFixed(2)}</div>
                  </div>
                </div>

                <div className="kpi-card" style={{ padding: '0.9rem 1.1rem' }}>
                  <div className="kpi-info">
                    <h4>Cuota {modalidadPago}</h4>
                    <div className="kpi-value" style={{ color: '#3b82f6' }}>S/. {resultado.montoCuota?.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', fontWeight: 600 }}>Cronograma de Cuotas Proyectado</h4>
              <div className="table-responsive" style={{ maxHeight: '220px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th># Cuota</th>
                      <th>Fecha Vencimiento</th>
                      <th>Cuota</th>
                      <th>Capital</th>
                      <th>Interés</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.cronograma?.map((c) => (
                      <tr key={c.numeroCuota}>
                        <td>Cuota #{c.numeroCuota}</td>
                        <td>{c.fechaVencimiento}</td>
                        <td><strong>S/. {parseFloat(c.montoCuota).toFixed(2)}</strong></td>
                        <td>S/. {parseFloat(c.capital).toFixed(2)}</td>
                        <td>S/. {parseFloat(c.interes).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          {onProcederPrestamo && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onProcederPrestamo({
                  montoDispersado: monto,
                  tasaInteres,
                  tipoInteres,
                  modalidadPago,
                  numeroCuotas,
                  fechaPrimerPago
                });
              }}
            >
              <CheckCircle size={16} />
              Embalar este Préstamo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
