import React, { useState, useEffect } from 'react';
import { X, Receipt, DollarSign, CreditCard, FileText, AlertTriangle, AlertCircle } from 'lucide-react';
import { prestamosApi, cuotasApi, pagosApi } from '../services/api';
import { extractApiErrorDetails } from '../services/errorHandler';

export default function NuevoPagoModal({ isOpen, onClose, initialCuota = null, initialPrestamo = null, onPagoRegistrado }) {
  const [prestamos, setPrestamos] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [formData, setFormData] = useState({
    prestamoId: '',
    cuotaId: '',
    monto: '',
    metodoPago: 'Efectivo',
    numeroOperacion: '',
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadPrestamos();
      if (initialCuota) {
        setFormData({
          prestamoId: initialCuota.prestamoId || '',
          cuotaId: initialCuota.id,
          monto: (parseFloat(initialCuota.montoCuota) + parseFloat(initialCuota.interesMoratorio || 0)).toFixed(2),
          metodoPago: 'Efectivo',
          numeroOperacion: `REC-${Date.now().toString().slice(-6)}`,
          observaciones: initialCuota.interesMoratorio > 0 ? `Cobro con mora de S/. ${parseFloat(initialCuota.interesMoratorio).toFixed(2)}` : ''
        });
        if (initialCuota.prestamoId) {
          loadCuotas(initialCuota.prestamoId);
        }
      } else if (initialPrestamo) {
        setFormData(prev => ({
          ...prev,
          prestamoId: initialPrestamo.id,
          numeroOperacion: `REC-${Date.now().toString().slice(-6)}`
        }));
        loadCuotas(initialPrestamo.id);
      } else {
        setFormData(prev => ({
          ...prev,
          numeroOperacion: `REC-${Date.now().toString().slice(-6)}`
        }));
      }
    }
  }, [isOpen, initialCuota, initialPrestamo]);

  const loadPrestamos = async () => {
    try {
      const data = await prestamosApi.getPrestamos('', 'EnCurso');
      setPrestamos(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCuotas = async (prestamoId) => {
    if (!prestamoId) return;
    try {
      const list = await cuotasApi.getCuotasByPrestamo(prestamoId);
      const pendientes = list.filter(c => c.estado !== 'Pagado');
      setCuotas(pendientes);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const validateForm = () => {
    const errors = {};
    if (!formData.prestamoId) errors.prestamoId = 'Debe seleccionar un "Préstamo" para asociar el cobro.';
    if (!formData.cuotaId) errors.cuotaId = 'Debe seleccionar la "Cuota a Cobrar".';
    const montoNum = parseFloat(formData.monto);
    if (isNaN(montoNum) || montoNum <= 0) errors.monto = 'El "Monto Recibido" debe ser un número válido mayor a S/. 0.';
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
        prestamoId: parseInt(formData.prestamoId),
        cuotaId: formData.cuotaId ? parseInt(formData.cuotaId) : null,
        monto: parseFloat(formData.monto),
        metodoPago: formData.metodoPago || 'Efectivo',
        numeroOperacion: formData.numeroOperacion ? formData.numeroOperacion.trim() : `REC-${Date.now().toString().slice(-6)}`,
        observaciones: formData.observaciones ? formData.observaciones.trim() : ''
      };

      const pago = await pagosApi.createPago(payload);
      if (onPagoRegistrado) onPagoRegistrado(pago);
      onClose();
    } catch (err) {
      console.error('Error al registrar pago:', err);
      const details = extractApiErrorDetails(err, 'Error al registrar el cobro en el servidor.');
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

  const cuotaSeleccionadaObj = cuotas.find(c => c.id === parseInt(formData.cuotaId));

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt className="text-primary" size={22} />
            Registrar Cobro de Cuota
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
              <label style={{ color: fieldErrors.prestamoId ? '#dc2626' : undefined, fontWeight: 500 }}>
                Seleccionar Préstamo *
              </label>
              <select
                className="form-select no-icon"
                value={formData.prestamoId}
                onChange={(e) => {
                  const pid = e.target.value;
                  handleInputChange('prestamoId', pid);
                  loadCuotas(pid);
                }}
                style={fieldErrors.prestamoId ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                required
              >
                <option value="">-- Seleccionar Préstamo --</option>
                {prestamos.map(p => (
                  <option key={p.id} value={p.id}>
                    Préstamo #{p.id} - {p.clienteNombre || p.nombreCliente} (Saldo: S/. {p.saldoPendiente})
                  </option>
                ))}
              </select>
              {fieldErrors.prestamoId && (
                <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  ❌ {fieldErrors.prestamoId}
                </span>
              )}
            </div>

            <div className="field-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ color: fieldErrors.cuotaId ? '#dc2626' : undefined, fontWeight: 500 }}>
                Cuota a Cobrar *
              </label>
              <select
                className="form-select no-icon"
                value={formData.cuotaId}
                onChange={(e) => {
                  const cid = e.target.value;
                  const selected = cuotas.find(c => c.id === parseInt(cid));
                  const montoConMora = selected ? (parseFloat(selected.montoCuota) + parseFloat(selected.interesMoratorio || 0)).toFixed(2) : formData.monto;
                  handleInputChange('cuotaId', cid);
                  handleInputChange('monto', montoConMora);
                  if (selected && selected.interesMoratorio > 0) {
                    handleInputChange('observaciones', `Incluye S/. ${parseFloat(selected.interesMoratorio).toFixed(2)} de mora.`);
                  }
                }}
                style={fieldErrors.cuotaId ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                required
              >
                <option value="">-- Seleccionar Cuota Pendiente --</option>
                {cuotas.map(c => {
                  const mora = parseFloat(c.interesMoratorio || 0);
                  return (
                    <option key={c.id} value={c.id}>
                      Cuota #{c.numeroCuota} (Vence: {c.fechaVencimiento?.split('T')[0] || c.fechaVencimiento}) - S/. {c.montoCuota} [{c.estado}] {mora > 0 ? `(+ S/. ${mora.toFixed(2)} Mora)` : ''}
                    </option>
                  );
                })}
              </select>
              {fieldErrors.cuotaId && (
                <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  ❌ {fieldErrors.cuotaId}
                </span>
              )}
            </div>

            {cuotaSeleccionadaObj && cuotaSeleccionadaObj.interesMoratorio > 0 && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.82rem',
                color: '#dc2626'
              }}>
                <AlertTriangle size={18} />
                <span>
                  <strong>Cuota en mora ({cuotaSeleccionadaObj.diasAtraso} días de atraso):</strong> Se ha calculado un recargo de S/. {parseFloat(cuotaSeleccionadaObj.interesMoratorio).toFixed(2)}.
                </span>
              </div>
            )}

            <div className="form-grid">
              <div className="field-group">
                <label style={{ color: fieldErrors.monto ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Monto Recibido (S/.) *
                </label>
                <div className="input-group">
                  <DollarSign size={16} color={fieldErrors.monto ? '#dc2626' : undefined} />
                  <input
                    type="number"
                    className="form-input"
                    value={formData.monto}
                    onChange={(e) => handleInputChange('monto', e.target.value)}
                    step="any"
                    min="0.01"
                    style={fieldErrors.monto ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                    required
                  />
                </div>
                {fieldErrors.monto && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.monto}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label>Método de Pago</label>
                <select
                  className="form-select no-icon"
                  value={formData.metodoPago}
                  onChange={(e) => handleInputChange('metodoPago', e.target.value)}
                >
                  <option value="Efectivo">Efectivo (Ventanilla)</option>
                  <option value="Transferencia">Transferencia Bancaria</option>
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                  <option value="Tarjeta">Tarjeta / POS</option>
                </select>
              </div>
            </div>

            <div className="field-group" style={{ marginTop: '1.25rem' }}>
              <label>N° Operación / Voucher / Referencia</label>
              <div className="input-group">
                <CreditCard size={16} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. YAP-98412 o REC-0014"
                  value={formData.numeroOperacion}
                  onChange={(e) => handleInputChange('numeroOperacion', e.target.value)}
                />
              </div>
            </div>

            <div className="field-group" style={{ marginTop: '1.25rem' }}>
              <label style={{ color: fieldErrors.observaciones ? '#dc2626' : undefined, fontWeight: 500 }}>
                Observaciones del Pago
              </label>
              <div className="input-group">
                <FileText size={16} color={fieldErrors.observaciones ? '#dc2626' : undefined} />
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Notas adicionales..."
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
              {loading ? 'Registrando en la base de datos...' : 'Confirmar Cobro & Emitir Recibo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
