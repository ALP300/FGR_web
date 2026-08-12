import React, { useState, useEffect } from 'react';
import { X, Receipt, DollarSign, CreditCard, FileText } from 'lucide-react';
import { prestamosApi, cuotasApi, pagosApi } from '../services/api';

export default function NuevoPagoModal({ isOpen, onClose, initialCuota = null, onPagoRegistrado }) {
  const [prestamos, setPrestamos] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [formData, setFormData] = useState({
    prestamoId: '',
    cuotaId: '',
    monto: 0,
    metodoPago: 'Efectivo',
    numeroOperacion: '',
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPrestamos();
      if (initialCuota) {
        setFormData(prev => ({
          ...prev,
          prestamoId: initialCuota.prestamoId,
          cuotaId: initialCuota.id,
          monto: initialCuota.montoCuota
        }));
        loadCuotas(initialCuota.prestamoId);
      }
    }
  }, [isOpen, initialCuota]);

  const loadPrestamos = async () => {
    try {
      const list = await prestamosApi.getPrestamos(null, 'EnCurso');
      setPrestamos(list || []);
      if (list && list.length > 0 && !formData.prestamoId && !initialCuota) {
        setFormData(prev => ({ ...prev, prestamoId: list[0].id }));
        loadCuotas(list[0].id);
      }
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
      if (pendientes.length > 0 && !initialCuota) {
        setFormData(prev => ({
          ...prev,
          cuotaId: pendientes[0].id,
          monto: pendientes[0].montoCuota
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.prestamoId || !formData.monto) {
      setError('Seleccione un préstamo e ingrese un monto válido.');
      return;
    }
    setError('');
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
      const apiMsg = err.response?.data?.mensaje 
        || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : null)
        || err.response?.data?.title 
        || 'Error al registrar el cobro en el servidor.';
      setError(apiMsg);
    } finally {
      setLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div className="field-group" style={{ marginBottom: '1.25rem' }}>
              <label>Seleccionar Préstamo *</label>
              <select
                className="form-select no-icon"
                value={formData.prestamoId}
                onChange={(e) => {
                  const pid = e.target.value;
                  setFormData({ ...formData, prestamoId: pid });
                  loadCuotas(pid);
                }}
                required
              >
                <option value="">-- Seleccionar Préstamo --</option>
                {prestamos.map(p => (
                  <option key={p.id} value={p.id}>
                    Préstamo #{p.id} - {p.clienteNombre || p.nombreCliente} (Saldo: S/. {p.saldoPendiente})
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group" style={{ marginBottom: '1.25rem' }}>
              <label>Cuota a Cobrar *</label>
              <select
                className="form-select no-icon"
                value={formData.cuotaId}
                onChange={(e) => {
                  const cid = e.target.value;
                  const selected = cuotas.find(c => c.id === parseInt(cid));
                  setFormData({
                    ...formData,
                    cuotaId: cid,
                    monto: selected ? selected.montoCuota : formData.monto
                  });
                }}
                required
              >
                <option value="">-- Seleccionar Cuota Pendiente --</option>
                {cuotas.map(c => (
                  <option key={c.id} value={c.id}>
                    Cuota #{c.numeroCuota} (Vence: {c.fechaVencimiento?.split('T')[0] || c.fechaVencimiento}) - S/. {c.montoCuota} [{c.estado}]
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid">
              <div className="field-group">
                <label>Monto Recibido (S/.) *</label>
                <div className="input-group">
                  <DollarSign size={16} />
                  <input
                    type="number"
                    className="form-input"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Método de Pago</label>
                <select
                  className="form-select no-icon"
                  value={formData.metodoPago}
                  onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, numeroOperacion: e.target.value })}
                />
              </div>
            </div>

            <div className="field-group" style={{ marginTop: '1.25rem' }}>
              <label>Observaciones del Pago</label>
              <div className="input-group">
                <FileText size={16} />
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Notas adicionales..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  style={{ paddingLeft: '2.6rem' }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registrando...' : 'Confirmar Cobro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
