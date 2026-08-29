import React, { useState, useEffect } from 'react';
import { X, Banknote, User, DollarSign, Percent, Calendar, FileText, AlertCircle } from 'lucide-react';
import { clientesApi, prestamosApi } from '../services/api';
import { extractApiErrorDetails } from '../services/errorHandler';

export default function NuevoPrestamoModal({ isOpen, onClose, initialData = null, onPrestamoCreado }) {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    clienteId: '',
    montoDispersado: 1000,
    tasaInteres: 10,
    tipoInteres: 'Diario',
    modalidadPago: 'Diario',
    numeroCuotas: 20,
    fechaDesembolso: new Date().toISOString().split('T')[0],
    fechaPrimerPago: new Date().toISOString().split('T')[0],
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

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
      errors.montoDispersado = 'El "Monto Desembolsado" debe ser un número mayor a 0.';
    }

    const tasa = parseFloat(formData.tasaInteres);
    if (isNaN(tasa) || tasa < 0) {
      errors.tasaInteres = 'La "Tasa de Interés" no puede ser negativa.';
    }

    const cuotas = parseInt(formData.numeroCuotas);
    if (isNaN(cuotas) || cuotas < 1) {
      errors.numeroCuotas = 'El "Número de Cuotas" debe ser mínimo 1.';
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
        tipoInteres: formData.tipoInteres || 'Diario',
        modalidadPago: formData.modalidadPago || 'Diario',
        numeroCuotas: parseInt(formData.numeroCuotas),
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

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Banknote className="text-primary" size={22} />
            Aprobar y Desembolsar Préstamo
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

            <div className="form-grid">
              <div className="field-group">
                <label style={{ color: fieldErrors.montoDispersado ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Monto Desembolsado (S/.) *
                </label>
                <div className="input-group">
                  <DollarSign size={16} color={fieldErrors.montoDispersado ? '#dc2626' : undefined} />
                  <input
                    type="number"
                    className="form-input"
                    value={formData.montoDispersado}
                    onChange={(e) => handleInputChange('montoDispersado', e.target.value)}
                    step="any"
                    min="0.01"
                    style={fieldErrors.montoDispersado ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                    required
                  />
                </div>
                {fieldErrors.montoDispersado && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.montoDispersado}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label style={{ color: fieldErrors.tasaInteres ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Tasa Interés (%) *
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
                <label>Modalidad de Cobro</label>
                <select
                  className="form-select no-icon"
                  value={formData.modalidadPago}
                  onChange={(e) => {
                    handleInputChange('modalidadPago', e.target.value);
                    handleInputChange('tipoInteres', e.target.value);
                  }}
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
                  onChange={(e) => handleInputChange('numeroCuotas', e.target.value)}
                  min="1"
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
                <label>Fecha Desembolso</label>
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
                  Fecha Primer Pago
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

            <div className="field-group" style={{ marginTop: '1.25rem' }}>
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
              {fieldErrors.observaciones && (
                <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  ❌ {fieldErrors.observaciones}
                </span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Procesando en la base de datos...' : 'Desembolsar Préstamo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
