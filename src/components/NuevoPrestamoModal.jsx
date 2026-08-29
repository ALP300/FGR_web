import React, { useState, useEffect } from 'react';
import { X, Banknote, User, DollarSign, Percent, Calendar, FileText, AlertCircle, Info } from 'lucide-react';
import { clientesApi, prestamosApi } from '../services/api';
import { extractApiErrorDetails } from '../services/errorHandler';

export default function NuevoPrestamoModal({ isOpen, onClose, initialData = null, onPrestamoCreado }) {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    clienteId: '',
    montoDispersado: 1000,
    tasaInteres: 10,
    tipoInteres: 'Mensual',
    modalidadPago: 'Mensual',
    numeroCuotas: 1,
    fechaDesembolso: new Date().toISOString().split('T')[0],
    fechaPrimerPago: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const SUGGESTED_MONTOS = [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000];

  useEffect(() => {
    if (isOpen) {
      loadClientes();
      if (initialData) {
        setFormData(prev => ({ ...prev, ...initialData }));
      }
    }
  }, [isOpen, initialData]);

  const loadClientes = async () => {
    try {
      const data = await clientesApi.getClientes('', 'Activo');
      setClientes(data || []);
      if (data && data.length > 0 && !formData.clienteId) {
        setFormData(prev => ({ ...prev, clienteId: data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const validateForm = () => {
    const errors = {};

    if (!formData.clienteId) {
      errors.clienteId = 'Debe seleccionar un "Cliente Titular" obligatorio.';
    }

    const monto = parseFloat(formData.montoDispersado);
    if (isNaN(monto) || monto <= 0) {
      errors.montoDispersado = 'El "Monto Desembolsado" debe ser un número válido.';
    } else if (monto < 500) {
      errors.montoDispersado = 'El monto mínimo a prestar es de S/. 500.00.';
    } else if (monto % 500 !== 0) {
      errors.montoDispersado = `El monto debe ser en múltiplos de S/. 500 (ej. 500, 1000, 1500, 2000...). No se permite S/. ${monto}.`;
    }

    const tasa = parseFloat(formData.tasaInteres);
    if (isNaN(tasa) || tasa < 0) {
      errors.tasaInteres = 'La "Tasa de Interés" no puede ser negativa.';
    }

    if (formData.fechaDesembolso && formData.fechaPrimerPago) {
      const d1 = new Date(formData.fechaDesembolso);
      const d2 = new Date(formData.fechaPrimerPago);
      if (d2 < d1) {
        errors.fechaPrimerPago = 'La "Fecha Primer Pago" no puede ser anterior a la "Fecha de Desembolso".';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      const firstErrorKey = Object.keys(validationErrors)[0];
      setError(`⚠️ Error en campo: ${validationErrors[firstErrorKey]}`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        clienteId: parseInt(formData.clienteId),
        montoDispersado: parseFloat(formData.montoDispersado),
        tasaInteres: parseFloat(formData.tasaInteres),
        tipoInteres: 'Mensual',
        modalidadPago: 'Mensual',
        numeroCuotas: 1, // Abierto / Mensual
        fechaDesembolso: formData.fechaDesembolso ? new Date(formData.fechaDesembolso).toISOString() : new Date().toISOString(),
        fechaPrimerPago: formData.fechaPrimerPago ? new Date(formData.fechaPrimerPago).toISOString() : new Date().toISOString(),
        observaciones: formData.observaciones ? formData.observaciones.trim() : ''
      };

      const nuevo = await prestamosApi.createPrestamo(payload);
      if (onPrestamoCreado) onPrestamoCreado(nuevo);
      onClose();
    } catch (err) {
      console.error('Error al desembolsar préstamo:', err);
      const details = extractApiErrorDetails(err, 'Error al registrar el préstamo en el servidor.');
      setError(details.message);
      setFieldErrors(details.fieldErrors || {});
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field] || fieldErrors[field.toLowerCase()]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        delete next[field.toLowerCase()];
        return next;
      });
    }
  };

  // Cálculos en vivo
  const montoNum = parseFloat(formData.montoDispersado) || 0;
  const tasaNum = parseFloat(formData.tasaInteres) || 0;
  const interesMensualCalculado = Math.round((montoNum * (tasaNum / 100)) * 100) / 100;
  const esMontoValido = montoNum >= 500 && montoNum % 500 === 0;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Banknote className="text-primary" size={22} />
            Aprobar y Desembolsar Préstamo (Plazo Abierto)
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {error && (
              <div style={{
                padding: '0.85rem 1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#dc2626',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                lineHeight: '1.4',
                whiteSpace: 'pre-line',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{error}</div>
              </div>
            )}

            {/* Cliente */}
            <div className="field-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ color: fieldErrors.clienteId ? '#dc2626' : undefined, fontWeight: 500 }}>
                Cliente Titular *
              </label>
              <div className="input-group">
                <User size={16} color={fieldErrors.clienteId ? '#dc2626' : undefined} />
                <select
                  className="form-select"
                  value={formData.clienteId}
                  onChange={(e) => handleInputChange('clienteId', e.target.value)}
                  style={fieldErrors.clienteId ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                  required
                >
                  <option value="">-- Seleccione Cliente --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombres || c.nombreCompleto} {c.apellidos || ''} (DNI: {c.dni})
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors.clienteId && (
                <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  ❌ {fieldErrors.clienteId}
                </span>
              )}
            </div>

            {/* Selector de Montos Rápidos */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>
                Monto del Préstamo (Mínimo S/. 500, en múltiplos de S/. 500):
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {SUGGESTED_MONTOS.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleInputChange('montoDispersado', m)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: formData.montoDispersado === m ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                      background: formData.montoDispersado === m ? 'var(--primary-light)' : '#ffffff',
                      color: formData.montoDispersado === m ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: formData.montoDispersado === m ? 700 : 500,
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
                <DollarSign size={16} color={fieldErrors.montoDispersado ? '#dc2626' : undefined} />
                <input
                  type="number"
                  className="form-input"
                  value={formData.montoDispersado}
                  onChange={(e) => handleInputChange('montoDispersado', e.target.value)}
                  step="500"
                  min="500"
                  placeholder="Ej. 500, 1000, 1500, 2000..."
                  style={fieldErrors.montoDispersado ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                  required
                />
              </div>
              {fieldErrors.montoDispersado ? (
                <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  ❌ {fieldErrors.montoDispersado}
                </span>
              ) : !esMontoValido && montoNum > 0 ? (
                <span style={{ color: '#d97706', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  ⚠️ Recuerda: El monto debe ser mínimo S/. 500 y en múltiplos de S/. 500 (ej. 500, 1000, 1500, 2000...).
                </span>
              ) : null}
            </div>

            <div className="form-grid">
              <div className="field-group">
                <label style={{ color: fieldErrors.tasaInteres ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Tasa de Interés Mensual (%) *
                </label>
                <div className="input-group">
                  <Percent size={16} color={fieldErrors.tasaInteres ? '#dc2626' : undefined} />
                  <input
                    type="number"
                    className="form-input"
                    value={formData.tasaInteres}
                    onChange={(e) => handleInputChange('tasaInteres', e.target.value)}
                    step="any"
                    min="0"
                    style={fieldErrors.tasaInteres ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                    required
                  />
                </div>
                {fieldErrors.tasaInteres && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.tasaInteres}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label>Modalidad de Devolución</label>
                <div style={{
                  padding: '0.65rem 0.85rem',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                  fontWeight: 600
                }}>
                  📅 Interés Mensual / Plazo Abierto
                </div>
              </div>

              <div className="field-group">
                <label>Fecha de Desembolso</label>
                <div className="input-group">
                  <Calendar size={16} />
                  <input
                    type="date"
                    className="form-input"
                    value={formData.fechaDesembolso}
                    onChange={(e) => handleInputChange('fechaDesembolso', e.target.value)}
                  />
                </div>
              </div>

              <div className="field-group">
                <label style={{ color: fieldErrors.fechaPrimerPago ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Fecha de Primer Cobro de Interés
                </label>
                <div className="input-group">
                  <Calendar size={16} color={fieldErrors.fechaPrimerPago ? '#dc2626' : undefined} />
                  <input
                    type="date"
                    className="form-input"
                    value={formData.fechaPrimerPago}
                    onChange={(e) => handleInputChange('fechaPrimerPago', e.target.value)}
                    style={fieldErrors.fechaPrimerPago ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                  />
                </div>
                {fieldErrors.fechaPrimerPago && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.fechaPrimerPago}
                  </span>
                )}
              </div>
            </div>

            {/* Tarjeta Resumen Financiero en Vivo */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(5, 150, 105, 0.02))',
              border: '1.5px solid rgba(5, 150, 105, 0.25)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginTop: '1.25rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Resumen de la Operación
                </span>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(5, 150, 105, 0.15)', color: 'var(--primary)', fontWeight: 700 }}>
                  Sin fecha límite de capital
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Capital a Entregar:</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    S/. {montoNum.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Interés Mensual a Cobrar:</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    S/. {interesMensualCalculado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({tasaNum}% de S/. {montoNum})</div>
                </div>
              </div>
              <div style={{
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(5, 150, 105, 0.15)',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px'
              }}>
                <Info size={15} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  El cliente abonará <strong>S/. {interesMensualCalculado.toFixed(2)}</strong> de interés cada mes. 
                  Podrá devolver el capital cuando lo decida, ya sea en su totalidad o mediante abonos en múltiplos de <strong>S/. 500</strong>, reduciendo el interés del mes siguiente.
                </span>
              </div>
            </div>

            {/* Observaciones */}
            <div className="field-group" style={{ marginTop: '1rem' }}>
              <label style={{ color: fieldErrors.observaciones ? '#dc2626' : undefined, fontWeight: 500 }}>
                Observaciones del Desembolso
              </label>
              <div className="input-group">
                <FileText size={16} color={fieldErrors.observaciones ? '#dc2626' : undefined} />
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Detalles sobre entrega en efectivo, cuenta bancaria o condiciones especiales..."
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  style={{
                    paddingLeft: '2.6rem',
                    ...(fieldErrors.observaciones ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {})
                  }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registrando...' : 'Desembolsar Préstamo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
