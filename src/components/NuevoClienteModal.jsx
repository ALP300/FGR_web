import React, { useState } from 'react';
import { X, UserPlus, User, Phone, MapPin, Mail, CreditCard, Calendar, FileText } from 'lucide-react';
import { clientesApi } from '../services/api';

export default function NuevoClienteModal({ isOpen, onClose, onClienteCreado }) {
  const [formData, setFormData] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '1990-01-01',
    correo: '',
    contactoEmergencia: '',
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dni || !formData.nombres || !formData.apellidos) {
      setError('Por favor complete los campos obligatorios DNI, Nombres y Apellidos.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Formatear payload exactamente según ClienteCreateDto de ASP.NET Core C#
      const payload = {
        dni: formData.dni.trim(),
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        telefono: formData.telefono ? formData.telefono.trim() : '',
        direccion: formData.direccion ? formData.direccion.trim() : '',
        fechaNacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toISOString() : null,
        correo: formData.correo ? formData.correo.trim() : '',
        contactoEmergencia: formData.contactoEmergencia ? formData.contactoEmergencia.trim() : '',
        observaciones: formData.observaciones ? formData.observaciones.trim() : ''
      };

      const nuevo = await clientesApi.createCliente(payload);
      if (onClienteCreado) onClienteCreado(nuevo);
      onClose();
    } catch (err) {
      console.error('Error al crear cliente:', err);
      const apiMsg = err.response?.data?.mensaje 
        || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : null)
        || err.response?.data?.title 
        || 'Error al registrar el cliente en el servidor.';
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
            <UserPlus className="text-primary" size={22} />
            Registrar Nuevo Cliente
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

            <div className="form-grid">
              <div className="field-group">
                <label>Documento DNI *</label>
                <div className="input-group">
                  <CreditCard size={16} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. 47859214"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Nombres *</label>
                <div className="input-group">
                  <User size={16} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Juan Carlos"
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Apellidos *</label>
                <div className="input-group">
                  <User size={16} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Gómez Pérez"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Teléfono Principal</label>
                <div className="input-group">
                  <Phone size={16} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. 987654321"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Correo Electrónico</label>
                <div className="input-group">
                  <Mail size={16} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="ejemplo@correo.com"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Fecha Nacimiento</label>
                <div className="input-group">
                  <Calendar size={16} />
                  <input
                    type="date"
                    className="form-input"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="field-group" style={{ marginTop: '1.25rem' }}>
              <label>Dirección Domiciliaria</label>
              <div className="input-group">
                <MapPin size={16} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Av. Las Flores 452, San Juan de Lurigancho"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>
            </div>

            <div className="field-group" style={{ marginTop: '1.25rem' }}>
              <label>Contacto de Emergencia / Referencia</label>
              <div className="input-group">
                <Phone size={16} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nombre y Celular de familiar o aval"
                  value={formData.contactoEmergencia}
                  onChange={(e) => setFormData({ ...formData, contactoEmergencia: e.target.value })}
                />
              </div>
            </div>

            <div className="field-group" style={{ marginTop: '1.25rem' }}>
              <label>Observaciones Crediticias</label>
              <div className="input-group">
                <FileText size={16} />
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Detalles sobre negocio, aval o historial..."
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
              {loading ? 'Enviando a la API...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
