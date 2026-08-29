import React, { useState, useEffect } from 'react';
import { X, Receipt, DollarSign, CreditCard, FileText, AlertTriangle, AlertCircle, TrendingDown, CheckCircle, Info } from 'lucide-react';
import { prestamosApi, cuotasApi, pagosApi } from '../services/api';
import { extractApiErrorDetails } from '../services/errorHandler';

export default function NuevoPagoModal({ isOpen, onClose, initialCuota = null, initialPrestamo = null, onPagoRegistrado }) {
  const [prestamos, setPrestamos] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  
  // Tipo de operación: 'interes' | 'capital' | 'mixto'
  const [tipoPago, setTipoPago] = useState('interes');

  const [formData, setFormData] = useState({
    prestamoId: '',
    cuotaId: '',
    montoInteres: '',
    montoCapital: '',
    montoTotal: '',
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
        setFormData(prev => ({
          ...prev,
          prestamoId: initialCuota.prestamoId || '',
          cuotaId: initialCuota.id,
          montoInteres: (parseFloat(initialCuota.montoCuota) + parseFloat(initialCuota.interesMoratorio || 0)).toFixed(2),
          montoCapital: '',
          montoTotal: (parseFloat(initialCuota.montoCuota) + parseFloat(initialCuota.interesMoratorio || 0)).toFixed(2),
          metodoPago: 'Efectivo',
          numeroOperacion: `REC-${Date.now().toString().slice(-6)}`,
          observaciones: initialCuota.interesMoratorio > 0 ? `Cobro con mora de S/. ${parseFloat(initialCuota.interesMoratorio).toFixed(2)}` : ''
        }));
        setTipoPago('interes');
        if (initialCuota.prestamoId) {
          loadCuotas(initialCuota.prestamoId);
        }
      } else if (initialPrestamo) {
        setFormData(prev => ({
          ...prev,
          prestamoId: initialPrestamo.id,
          montoInteres: '',
          montoCapital: '',
          montoTotal: '',
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
      if (pendientes.length > 0 && !formData.cuotaId) {
        const prim = pendientes[0];
        const montoCuotaConMora = (parseFloat(prim.montoCuota) + parseFloat(prim.interesMoratorio || 0)).toFixed(2);
        setFormData(prev => ({
          ...prev,
          cuotaId: prim.id,
          montoInteres: montoCuotaConMora,
          montoTotal: montoCuotaConMora
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const prestamoSeleccionado = prestamos.find(p => p.id === parseInt(formData.prestamoId));
  const saldoCapitalActual = prestamoSeleccionado ? (parseFloat(prestamoSeleccionado.saldoCapital || prestamoSeleccionado.montoDispersado) || 0) : 0;
  const tasaMensual = prestamoSeleccionado ? (parseFloat(prestamoSeleccionado.tasaInteres) || 10) : 10;
  const cuotaSeleccionadaObj = cuotas.find(c => c.id === parseInt(formData.cuotaId));

  const validateForm = () => {
    const errors = {};
    if (!formData.prestamoId) {
      errors.prestamoId = 'Debe seleccionar un préstamo.';
    }

    const mInteres = parseFloat(formData.montoInteres) || 0;
    const mCapital = parseFloat(formData.montoCapital) || 0;

    if (tipoPago === 'interes') {
      if (mInteres <= 0) {
        errors.montoInteres = 'El monto de interés debe ser mayor a S/. 0.00.';
      }
    } else if (tipoPago === 'capital') {
      if (mCapital <= 0) {
        errors.montoCapital = 'El abono a capital debe ser mayor a S/. 0.00.';
      } else if (mCapital % 500 !== 0 && mCapital !== saldoCapitalActual) {
        errors.montoCapital = `El abono a capital debe ser en múltiplos exactos de S/. 500 (ej. 500, 1000, 1500...) o la cancelación total de S/. ${saldoCapitalActual.toFixed(2)}.`;
      } else if (mCapital > saldoCapitalActual) {
        errors.montoCapital = `El abono a capital no puede superar el saldo capital de S/. ${saldoCapitalActual.toFixed(2)}.`;
      }
    } else if (tipoPago === 'mixto') {
      if (mInteres <= 0) {
        errors.montoInteres = 'Ingrese el monto de interés del mes.';
      }
      if (mCapital <= 0) {
        errors.montoCapital = 'Ingrese el monto a amortizar a capital.';
      } else if (mCapital % 500 !== 0 && mCapital !== saldoCapitalActual) {
        errors.montoCapital = `El abono a capital debe ser en múltiplos exactos de S/. 500 o saldo total de S/. ${saldoCapitalActual.toFixed(2)}.`;
      } else if (mCapital > saldoCapitalActual) {
        errors.montoCapital = `El abono a capital no puede superar el saldo capital de S/. ${saldoCapitalActual.toFixed(2)}.`;
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
      const firstKey = Object.keys(validationErrors)[0];
      setError(`⚠️ ${validationErrors[firstKey]}`);
      return;
    }

    setLoading(true);

    const mInteres = parseFloat(formData.montoInteres) || 0;
    const mCapital = parseFloat(formData.montoCapital) || 0;
    const mTotal = tipoPago === 'interes' ? mInteres : tipoPago === 'capital' ? mCapital : (mInteres + mCapital);

    try {
      const payload = {
        prestamoId: parseInt(formData.prestamoId),
        cuotaId: formData.cuotaId ? parseInt(formData.cuotaId) : null,
        monto: mTotal,
        montoInteres: tipoPago === 'capital' ? 0 : mInteres,
        montoCapital: tipoPago === 'interes' ? 0 : mCapital,
        metodoPago: formData.metodoPago || 'Efectivo',
        numeroOperacion: formData.numeroOperacion ? formData.numeroOperacion.trim() : `REC-${Date.now().toString().slice(-6)}`,
        observaciones: formData.observaciones ? formData.observaciones.trim() : (
          tipoPago === 'capital' 
            ? `Abono directo a capital de S/. ${mCapital.toFixed(2)}`
            : tipoPago === 'mixto'
              ? `Pago mixto: S/. ${mInteres.toFixed(2)} interés + S/. ${mCapital.toFixed(2)} abono a capital`
              : `Cobro de interés mensual`
        )
      };

      const pago = await pagosApi.createPago(payload);
      if (onPagoRegistrado) onPagoRegistrado(pago);
      onClose();
    } catch (err) {
      console.error('Error al registrar cobro:', err);
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

  // Cálculos dinámicos
  const capitalAbonoNum = parseFloat(formData.montoCapital) || 0;
  const interesCobroNum = parseFloat(formData.montoInteres) || 0;
  const nuevoSaldoCapitalEstimado = Math.max(0, saldoCapitalActual - capitalAbonoNum);
  const nuevoInteresMensualEstimado = Math.round((nuevoSaldoCapitalEstimado * (tasaMensual / 100)) * 100) / 100;
  const totalACobrar = tipoPago === 'interes' ? interesCobroNum : tipoPago === 'capital' ? capitalAbonoNum : (interesCobroNum + capitalAbonoNum);

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt className="text-primary" size={22} />
            Registrar Cobro (Interés / Amortización a Capital)
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

            {/* Selección de Préstamo */}
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
                    Préstamo #{p.id} - {p.clienteNombre || p.nombreCliente} (Saldo Capital: S/. {parseFloat(p.saldoCapital || p.montoDispersado).toFixed(2)})
                  </option>
                ))}
              </select>
              {fieldErrors.prestamoId && (
                <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  ❌ {fieldErrors.prestamoId}
                </span>
              )}
            </div>

            {/* Tipo de Cobro */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'block' }}>
                Tipo de Operación a Registrar:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setTipoPago('interes')}
                  style={{
                    padding: '0.6rem 0.5rem',
                    borderRadius: '8px',
                    border: tipoPago === 'interes' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: tipoPago === 'interes' ? 'var(--primary-light)' : '#ffffff',
                    color: tipoPago === 'interes' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: tipoPago === 'interes' ? 700 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  💵 Solo Interés
                </button>
                <button
                  type="button"
                  onClick={() => setTipoPago('capital')}
                  style={{
                    padding: '0.6rem 0.5rem',
                    borderRadius: '8px',
                    border: tipoPago === 'capital' ? '2px solid #2563eb' : '1px solid var(--border-color)',
                    background: tipoPago === 'capital' ? 'rgba(37, 99, 235, 0.12)' : '#ffffff',
                    color: tipoPago === 'capital' ? '#2563eb' : 'var(--text-muted)',
                    fontWeight: tipoPago === 'capital' ? 700 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  📉 Abono a Capital
                </button>
                <button
                  type="button"
                  onClick={() => setTipoPago('mixto')}
                  style={{
                    padding: '0.6rem 0.5rem',
                    borderRadius: '8px',
                    border: tipoPago === 'mixto' ? '2px solid #7c3aed' : '1px solid var(--border-color)',
                    background: tipoPago === 'mixto' ? 'rgba(124, 58, 237, 0.12)' : '#ffffff',
                    color: tipoPago === 'mixto' ? '#7c3aed' : 'var(--text-muted)',
                    fontWeight: tipoPago === 'mixto' ? 700 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  ✨ Interés + Capital
                </button>
              </div>
            </div>

            {/* Si incluye cobro de interés */}
            {(tipoPago === 'interes' || tipoPago === 'mixto') && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div className="field-group">
                  <label style={{ color: fieldErrors.montoInteres ? '#dc2626' : undefined, fontWeight: 500 }}>
                    Monto de Interés del Mes (S/.) *
                  </label>
                  <div className="input-group">
                    <DollarSign size={16} color={fieldErrors.montoInteres ? '#dc2626' : undefined} />
                    <input
                      type="number"
                      className="form-input"
                      value={formData.montoInteres}
                      onChange={(e) => handleInputChange('montoInteres', e.target.value)}
                      step="any"
                      min="0.01"
                      placeholder="Monto de la cuota de interés..."
                      style={fieldErrors.montoInteres ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                    />
                  </div>
                  {fieldErrors.montoInteres && (
                    <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                      ❌ {fieldErrors.montoInteres}
                    </span>
                  )}
                </div>

                {cuotaSeleccionadaObj && cuotaSeleccionadaObj.interesMoratorio > 0 && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    color: '#dc2626'
                  }}>
                    <AlertTriangle size={16} />
                    <span>
                      Cuota en mora ({cuotaSeleccionadaObj.diasAtraso} días de atraso). Recargo calculado: S/. {parseFloat(cuotaSeleccionadaObj.interesMoratorio).toFixed(2)}.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Si incluye abono a capital */}
            {(tipoPago === 'capital' || tipoPago === 'mixto') && (
              <div style={{
                background: 'rgba(37, 99, 235, 0.05)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.5rem', display: 'block' }}>
                  Abono a Capital (En múltiplos de S/. 500 o saldo total):
                </label>

                {/* Botones de múltiplos sugeridos */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  {[500, 1000, 1500, 2000].filter(val => val < saldoCapitalActual).map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleInputChange('montoCapital', val)}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        border: parseFloat(formData.montoCapital) === val ? '1.5px solid #2563eb' : '1px solid var(--border-color)',
                        background: parseFloat(formData.montoCapital) === val ? 'rgba(37, 99, 235, 0.2)' : '#ffffff',
                        color: parseFloat(formData.montoCapital) === val ? '#1e40af' : 'var(--text-main)',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      S/. {val}
                    </button>
                  ))}
                  {saldoCapitalActual > 0 && (
                    <button
                      type="button"
                      onClick={() => handleInputChange('montoCapital', saldoCapitalActual)}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        border: parseFloat(formData.montoCapital) === saldoCapitalActual ? '1.5px solid #16a34a' : '1px solid #16a34a',
                        background: parseFloat(formData.montoCapital) === saldoCapitalActual ? '#dcfce7' : '#ffffff',
                        color: '#15803d',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      🏆 Liquidar Total (S/. {saldoCapitalActual.toFixed(2)})
                    </button>
                  )}
                </div>

                <div className="input-group">
                  <DollarSign size={16} color={fieldErrors.montoCapital ? '#dc2626' : undefined} />
                  <input
                    type="number"
                    className="form-input"
                    value={formData.montoCapital}
                    onChange={(e) => handleInputChange('montoCapital', e.target.value)}
                    step="500"
                    placeholder="Ej. 500, 1000, 1500..."
                    style={fieldErrors.montoCapital ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                  />
                </div>
                {fieldErrors.montoCapital && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.montoCapital}
                  </span>
                )}

                {/* Recálculo en vivo de capital */}
                {capitalAbonoNum > 0 && (
                  <div style={{
                    marginTop: '0.75rem',
                    background: '#ffffff',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(37, 99, 235, 0.15)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Saldo capital luego del pago: </span>
                      <strong style={{ color: nuevoSaldoCapitalEstimado === 0 ? '#16a34a' : 'var(--text-main)' }}>
                        {nuevoSaldoCapitalEstimado === 0 ? 'S/. 0.00 (PRÉSTAMO LIQUIDADO)' : `S/. ${nuevoSaldoCapitalEstimado.toFixed(2)}`}
                      </strong>
                    </div>
                    {nuevoSaldoCapitalEstimado > 0 && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Nuevo interés mensual: </span>
                        <strong style={{ color: 'var(--primary)' }}>S/. {nuevoInteresMensualEstimado.toFixed(2)}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Total a Cobrar & Método */}
            <div className="form-grid">
              <div className="field-group">
                <label style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  Total a Cobrar en Caja (S/.)
                </label>
                <div style={{
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(5, 150, 105, 0.1)',
                  border: '1.5px solid var(--primary)',
                  borderRadius: '8px',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--primary)'
                }}>
                  S/. {totalACobrar.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
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

            <div className="field-group" style={{ marginTop: '1rem' }}>
              <label>N° Operación / Voucher / Recibo</label>
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

            <div className="field-group" style={{ marginTop: '1rem' }}>
              <label>Observaciones del Pago</label>
              <div className="input-group">
                <FileText size={16} />
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Detalles adicionales sobre el cobro o comprobante..."
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  style={{ paddingLeft: '2.6rem' }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || totalACobrar <= 0}>
              {loading ? 'Registrando en la base de datos...' : `Confirmar Cobro de S/. ${totalACobrar.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
