import React, { useState, useEffect } from 'react';
import { X, RefreshCw, DollarSign, Calendar, Calculator, CheckCircle, AlertCircle, ArrowRight, Banknote } from 'lucide-react';
import { prestamosApi } from '../services/api';
import { extractApiErrorDetails } from '../services/errorHandler';

export default function RefinanciarModal({ isOpen, onClose, prestamo, onRefinanciado }) {
  const [formData, setFormData] = useState({
    nuevoMonto: 0,
    tasaInteres: 10,
    modalidadPago: 'Diario',
    numeroCuotas: 20,
    fechaPrimerPago: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    observaciones: ''
  });
  const [simulacion, setSimulacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen && prestamo) {
      const saldoActual = prestamo.saldoPendienteTotal !== undefined ? prestamo.saldoPendienteTotal : (prestamo.saldoPendiente || 0);
      const montoSugerido = Math.max(saldoActual + 500, saldoActual * 1.5);
      
      setFormData({
        nuevoMonto: montoSugerido,
        tasaInteres: prestamo.tasaInteres || 10,
        modalidadPago: prestamo.modalidadPago || 'Diario',
        numeroCuotas: prestamo.numeroCuotas || 20,
        fechaPrimerPago: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        observaciones: `Refinanciamiento y ampliación de capital del Préstamo #${prestamo.id}.`
      });
      setError('');
      setFieldErrors({});
    }
  }, [isOpen, prestamo]);

  useEffect(() => {
    if (formData.nuevoMonto > 0 && formData.numeroCuotas > 0) {
      calcularSimulacion();
    }
  }, [formData.nuevoMonto, formData.tasaInteres, formData.modalidadPago, formData.numeroCuotas, formData.fechaPrimerPago]);

  const calcularSimulacion = async () => {
    try {
      const sim = await prestamosApi.simularPrestamo({
        monto: formData.nuevoMonto,
        tasaInteres: formData.tasaInteres,
        numeroCuotas: formData.numeroCuotas,
        modalidadPago: formData.modalidadPago,
        fechaPrimerPago: formData.fechaPrimerPago
      });
      setSimulacion(sim);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !prestamo) return null;

  const saldoActual = prestamo.saldoPendienteTotal !== undefined ? prestamo.saldoPendienteTotal : (prestamo.saldoPendiente || 0);
  const nuevoMontoNum = parseFloat(formData.nuevoMonto || 0);
  const dineroNetoAEntregar = Math.max(0, nuevoMontoNum - saldoActual);
  const nombreCliente = prestamo.nombreCliente || prestamo.clienteNombre || 'Cliente';

  const validateForm = () => {
    const errors = {};

    if (nuevoMontoNum < saldoActual) {
      errors.nuevoMonto = `El "Nuevo Monto" (S/. ${nuevoMontoNum.toFixed(2)}) debe ser mayor o igual al saldo adeudado (S/. ${saldoActual.toFixed(2)}).`;
    }

    const tasa = parseFloat(formData.tasaInteres);
    if (isNaN(tasa) || tasa < 0) {
      errors.tasaInteres = 'La "Tasa de Interés" no puede ser un número negativo.';
    }

    const cuotas = parseInt(formData.numeroCuotas);
    if (isNaN(cuotas) || cuotas < 1) {
      errors.numeroCuotas = 'El "Número de Cuotas" debe ser al menos 1.';
    }

    if (!formData.fechaPrimerPago) {
      errors.fechaPrimerPago = 'La "Fecha de Primer Pago" es obligatoria.';
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
      const nuevoPrestamo = await prestamosApi.refinanciarPrestamo({
        prestamoIdAnterior: prestamo.id,
        nuevoMontoDispersado: nuevoMontoNum,
        tasaInteres: parseFloat(formData.tasaInteres),
        modalidadPago: formData.modalidadPago,
        numeroCuotas: parseInt(formData.numeroCuotas),
        fechaPrimerPago: formData.fechaPrimerPago,
        observaciones: formData.observaciones
      });

      if (onRefinanciado) onRefinanciado(nuevoPrestamo);
      onClose();
    } catch (err) {
      console.error(err);
      const details = extractApiErrorDetails(err, 'Error al procesar el refinanciamiento en el servidor.');
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

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '780px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw className="text-primary" size={22} />
            Renovación & Refinanciamiento de Préstamo
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
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

            {/* Banner Informativo Estado Actual */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CLIENTE TITULAR</span>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>{nombreCliente}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Préstamo Anterior: #{prestamo.id}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SALDO ADEUDADO ACTUAL</span>
                <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '1.2rem' }}>
                  S/. {parseFloat(saldoActual).toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Se liquidará automáticamente</div>
              </div>

              <div style={{ background: '#ecfdf5', padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>DINERO NETO A ENTREGAR</span>
                <div style={{ fontWeight: 800, color: '#059669', fontSize: '1.25rem' }}>
                  S/. {dineroNetoAEntregar.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#047857' }}>Efectivo libre para el cliente</div>
              </div>
            </div>

            {/* Formulario de Nuevo Préstamo */}
            <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
              <div className="field-group">
                <label style={{ color: fieldErrors.nuevoMonto ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Nuevo Monto Total Solicitado (S/.) *
                </label>
                <div className="input-group">
                  <DollarSign size={16} color={fieldErrors.nuevoMonto ? '#dc2626' : undefined} />
                  <input
                    type="number"
                    className="form-input"
                    value={formData.nuevoMonto}
                    onChange={(e) => handleInputChange('nuevoMonto', parseFloat(e.target.value) || 0)}
                    min={saldoActual}
                    step="any"
                    style={fieldErrors.nuevoMonto ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                    required
                  />
                </div>
                {fieldErrors.nuevoMonto ? (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.nuevoMonto}
                  </span>
                ) : (
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Mínimo S/. {parseFloat(saldoActual).toFixed(2)} (Saldo deudor actual)
                  </small>
                )}
              </div>

              <div className="field-group">
                <label style={{ color: fieldErrors.tasaInteres ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Tasa de Interés (%) *
                </label>
                <div className="input-group">
                  <Calculator size={16} color={fieldErrors.tasaInteres ? '#dc2626' : undefined} />
                  <input
                    type="number"
                    className="form-input"
                    value={formData.tasaInteres}
                    onChange={(e) => handleInputChange('tasaInteres', parseFloat(e.target.value) || 0)}
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
                <label>Modalidad de Pago</label>
                <select
                  className="form-select no-icon"
                  value={formData.modalidadPago}
                  onChange={(e) => handleInputChange('modalidadPago', e.target.value)}
                >
                  <option value="Diario">Diario</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Quincenal">Quincenal</option>
                  <option value="Mensual">Mensual</option>
                </select>
              </div>

              <div className="field-group">
                <label style={{ color: fieldErrors.numeroCuotas ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Número de Cuotas *
                </label>
                <input
                  type="number"
                  className="form-input no-icon"
                  value={formData.numeroCuotas}
                  onChange={(e) => handleInputChange('numeroCuotas', parseInt(e.target.value) || 1)}
                  min="1"
                  max="120"
                  style={fieldErrors.numeroCuotas ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                  required
                />
                {fieldErrors.numeroCuotas && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.numeroCuotas}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label style={{ color: fieldErrors.fechaPrimerPago ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Fecha de Primer Pago *
                </label>
                <div className="input-group">
                  <Calendar size={16} color={fieldErrors.fechaPrimerPago ? '#dc2626' : undefined} />
                  <input
                    type="date"
                    className="form-input"
                    value={formData.fechaPrimerPago}
                    onChange={(e) => handleInputChange('fechaPrimerPago', e.target.value)}
                    style={fieldErrors.fechaPrimerPago ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                    required
                  />
                </div>
                {fieldErrors.fechaPrimerPago && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.fechaPrimerPago}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label style={{ color: fieldErrors.observaciones ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Observaciones del Refinanciamiento
                </label>
                <input
                  type="text"
                  className="form-input no-icon"
                  placeholder="Motivo de la renovación..."
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  style={fieldErrors.observaciones ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                />
                {fieldErrors.observaciones && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.observaciones}
                  </span>
                )}
              </div>
            </div>

            {/* Vista Previa de la Nueva Operación */}
            {simulacion && (
              <div style={{
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: 'var(--shadow-card)'
              }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle size={16} color="#059669" />
                  Resumen de la Nueva Operación
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Nuevo Capital:</span>
                    <div style={{ fontWeight: 700 }}>S/. {parseFloat(simulacion.monto).toFixed(2)}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total Interés:</span>
                    <div style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>S/. {parseFloat(simulacion.totalInteres).toFixed(2)}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total a Pagar:</span>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>S/. {parseFloat(simulacion.totalAPagar).toFixed(2)}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Valor por Cuota:</span>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>
                      S/. {parseFloat(simulacion.montoCuota).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <RefreshCw size={16} />
              {loading ? 'Procesando...' : 'Aprobar y Refinanciar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
