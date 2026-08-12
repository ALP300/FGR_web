import React, { useState, useEffect } from 'react';
import { X, Banknote, User, DollarSign, Percent, Calendar, FileText } from 'lucide-react';
import { clientesApi, prestamosApi } from '../services/api';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clienteId) {
      setError('Seleccione un cliente para desembolsar el préstamo.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const nuevo = await prestamosApi.createPrestamo(formData);
      if (onPrestamoCreado) onPrestamoCreado(nuevo);
      onClose();
    } catch (err) {
      setError('Error al registrar el préstamo.');
    } finally {
      setLoading(false);
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div className="field-group" style={{ marginBottom: '1.25rem' }}>
              <label>Cliente Titular *</label>
              <div className="input-group">
                <User size={16} />
                <select
                  className="form-select"
                  value={formData.clienteId}
                  onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                  required
                >
                  <option value="">-- Seleccione Cliente --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombres} {c.apellidos} (DNI: {c.dni})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="field-group">
                <label>Monto Desembolsado (S/.) *</label>
                <div className="input-group">
                  <DollarSign size={16} />
                  <input
                    type="number"
                    className="form-input"
                    value={formData.montoDispersado}
                    onChange={(e) => setFormData({ ...formData, montoDispersado: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Tasa Interés (%) *</label>
                <div className="input-group">
                  <Percent size={16} />
                  <input
                    type="number"
                    className="form-input"
                    value={formData.tasaInteres}
                    onChange={(e) => setFormData({ ...formData, tasaInteres: e.target.value })}
                    step="0.5"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Modalidad de Cobro</label>
                <select
                  className="form-select no-icon"
                  value={formData.modalidadPago}
                  onChange={(e) => setFormData({ ...formData, modalidadPago: e.target.value, tipoInteres: e.target.value })}
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
                  value={formData.numeroCuotas}
                  onChange={(e) => setFormData({ ...formData, numeroCuotas: e.target.value })}
                  min="1"
                  required
                />
              </div>

              <div className="field-group">
                <label>Fecha Desembolso</label>
                <div className="input-group">
                  <Calendar size={16} />
                  <input
                    type="date"
                    className="form-input"
                    value={formData.fechaDesembolso}
                    onChange={(e) => setFormData({ ...formData, fechaDesembolso: e.target.value })}
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Fecha Primer Pago</label>
                <div className="input-group">
                  <Calendar size={16} />
                  <input
                    type="date"
                    className="form-input"
                    value={formData.fechaPrimerPago}
                    onChange={(e) => setFormData({ ...formData, fechaPrimerPago: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="field-group" style={{ marginTop: '1.25rem' }}>
              <label>Observaciones del Desembolso</label>
              <div className="input-group">
                <FileText size={16} />
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Detalles sobre entrega en efectivo, cuenta bancaria o condiciones especiales..."
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
              {loading ? 'Procesando...' : 'Desembolsar Préstamo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
