import React, { useState } from 'react';
import { X, UserPlus, User, Phone, MapPin, Mail, CreditCard, Calendar, FileText, AlertCircle } from 'lucide-react';
import { clientesApi } from '../services/api';
import { extractApiErrorDetails } from '../services/errorHandler';

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
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const errors = {};

    // Validación DNI
    if (!formData.dni || !formData.dni.trim()) {
      errors.dni = 'El campo "Documento DNI" es obligatorio.';
    } else if (!/^\d{8}$/.test(formData.dni.trim())) {
      errors.dni = 'El "Documento DNI" debe contener exactamente 8 dígitos numéricos.';
    }

    // Validación Nombres
    if (!formData.nombres || !formData.nombres.trim()) {
      errors.nombres = 'El campo "Nombres" es obligatorio.';
    } else if (formData.nombres.trim().length < 2) {
      errors.nombres = 'El campo "Nombres" debe tener al menos 2 caracteres.';
    }

    // Validación Apellidos
    if (!formData.apellidos || !formData.apellidos.trim()) {
      errors.apellidos = 'El campo "Apellidos" es obligatorio.';
    } else if (formData.apellidos.trim().length < 2) {
      errors.apellidos = 'El campo "Apellidos" debe tener al menos 2 caracteres.';
    }

    // Validación Teléfono
    if (formData.telefono && formData.telefono.trim()) {
      if (!/^\d{9,}$/.test(formData.telefono.trim().replace(/[\s-]/g, ''))) {
        errors.telefono = 'El "Teléfono Principal" debe contener al menos 9 dígitos numéricos.';
      }
    }

    // Validación Correo
    if (formData.correo && formData.correo.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo.trim())) {
        errors.correo = 'El formato del "Correo Electrónico" no es válido (ej. usuario@correo.com).';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // 1. Validación exhaustiva en el cliente
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      const firstErrorKey = Object.keys(validationErrors)[0];
      setError(`⚠️ Error en campo: ${validationErrors[firstErrorKey]}`);
      return;
    }

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
      const details = extractApiErrorDetails(err, 'Error al registrar el cliente en el servidor.');
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

            <div className="form-grid">
              <div className="field-group">
                <label style={{ color: fieldErrors.dni ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Documento DNI *
                </label>
                <div className="input-group">
                  <CreditCard size={16} color={fieldErrors.dni ? '#dc2626' : undefined} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. 47859214 (8 dígitos)"
                    maxLength={8}
                    value={formData.dni}
                    onChange={(e) => handleInputChange('dni', e.target.value)}
                    style={fieldErrors.dni ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                    required
                  />
                </div>
                {fieldErrors.dni && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.dni}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label style={{ color: fieldErrors.nombres ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Nombres *
                </label>
                <div className="input-group">
                  <User size={16} color={fieldErrors.nombres ? '#dc2626' : undefined} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Roger"
                    value={formData.nombres}
                    onChange={(e) => handleInputChange('nombres', e.target.value)}
                    style={fieldErrors.nombres ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                    required
                  />
                </div>
                {fieldErrors.nombres && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.nombres}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label style={{ color: fieldErrors.apellidos ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Apellidos *
                </label>
                <div className="input-group">
                  <User size={16} color={fieldErrors.apellidos ? '#dc2626' : undefined} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Martinez Paz"
                    value={formData.apellidos}
                    onChange={(e) => handleInputChange('apellidos', e.target.value)}
                    style={fieldErrors.apellidos ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                    required
                  />
                </div>
                {fieldErrors.apellidos && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.apellidos}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label style={{ color: fieldErrors.telefono ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Teléfono Principal
                </label>
                <div className="input-group">
                  <Phone size={16} color={fieldErrors.telefono ? '#dc2626' : undefined} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. 983672561"
                    maxLength={15}
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    style={fieldErrors.telefono ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                  />
                </div>
                {fieldErrors.telefono && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.telefono}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label style={{ color: fieldErrors.correo ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Correo Electrónico
                </label>
                <div className="input-group">
                  <Mail size={16} color={fieldErrors.correo ? '#dc2626' : undefined} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="roger0101@gmail.com"
                    value={formData.correo}
                    onChange={(e) => handleInputChange('correo', e.target.value)}
                    style={fieldErrors.correo ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                  />
                </div>
                {fieldErrors.correo && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.correo}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label style={{ color: fieldErrors.fechaNacimiento ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Fecha Nacimiento
                </label>
                <div className="input-group">
                  <Calendar size={16} color={fieldErrors.fechaNacimiento ? '#dc2626' : undefined} />
                  <input
                    type="date"
                    className="form-input"
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                    style={fieldErrors.fechaNacimiento ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                  />
                </div>
                {fieldErrors.fechaNacimiento && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.fechaNacimiento}
                  </span>
                )}
              </div>
            </div>

            <div className="field-group" style={{ marginTop: '1.25rem' }}>
              <label style={{ color: fieldErrors.direccion ? '#dc2626' : undefined, fontWeight: 500 }}>
                Dirección Domiciliaria
              </label>
              <div className="input-group">
                <MapPin size={16} color={fieldErrors.direccion ? '#dc2626' : undefined} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Av. Las Flores 873"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  style={fieldErrors.direccion ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                />
              </div>
              {fieldErrors.direccion && (
                <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  ❌ {fieldErrors.direccion}
                </span>
              )}
            </div>

            <div className="field-group" style={{ marginTop: '1.25rem' }}>
              <label style={{ color: fieldErrors.contactoEmergencia ? '#dc2626' : undefined, fontWeight: 500 }}>
                Contacto de Emergencia / Referencia
              </label>
              <div className="input-group">
                <Phone size={16} color={fieldErrors.contactoEmergencia ? '#dc2626' : undefined} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nombre y Celular de familiar o aval"
                  value={formData.contactoEmergencia}
                  onChange={(e) => handleInputChange('contactoEmergencia', e.target.value)}
                  style={fieldErrors.contactoEmergencia ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                />
              </div>
              {fieldErrors.contactoEmergencia && (
                <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  ❌ {fieldErrors.contactoEmergencia}
                </span>
              )}
            </div>

            <div className="field-group" style={{ marginTop: '1.25rem' }}>
              <label style={{ color: fieldErrors.observaciones ? '#dc2626' : undefined, fontWeight: 500 }}>
                Observaciones Crediticias
              </label>
              <div className="input-group">
                <FileText size={16} color={fieldErrors.observaciones ? '#dc2626' : undefined} />
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Detalles sobre negocio, aval o historial..."
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
              {loading ? 'Guardando en la base de datos...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

