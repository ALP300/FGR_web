import React, { useState } from 'react';
import { Banknote, User, Lock, Mail, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api';
import { extractApiErrorDetails } from '../services/errorHandler';

export default function LoginPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Campos de registro
  const [email, setEmail] = useState('');
  const [nombresApellidos, setNombresApellidos] = useState('');
  const [rol, setRol] = useState('Admin');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!username || !username.trim()) {
      errors.username = 'El campo "Usuario" es obligatorio.';
    }

    if (!password || !password.trim()) {
      errors.password = 'El campo "Contraseña" es obligatorio.';
    } else if (isRegister && password.length < 6) {
      errors.password = 'La "Contraseña" debe contener al menos 6 caracteres.';
    }

    if (isRegister) {
      if (!nombresApellidos || !nombresApellidos.trim()) {
        errors.nombresApellidos = 'El campo "Nombres y Apellidos" es obligatorio.';
      }
      if (!email || !email.trim()) {
        errors.email = 'El campo "Correo Electrónico" es obligatorio.';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          errors.email = 'El formato del "Correo Electrónico" no es válido.';
        }
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
      if (isRegister) {
        const res = await authApi.register({
          nombreUsuario: username.trim(),
          email: email.trim(),
          password,
          nombresApellidos: nombresApellidos.trim(),
          rol
        });
        setSuccessMessage(res?.mensaje || '¡Usuario registrado exitosamente! Ya puedes iniciar sesión con tus credenciales.');
        setIsRegister(false);
        setPassword('');
      } else {
        // Petición real POST /api/Auth/login
        const data = await authApi.login(username.trim(), password);
        const userObj = data.user || {
          id: data.id,
          nombreUsuario: data.nombreUsuario || username.trim(),
          nombresApellidos: data.nombreCompleto || data.nombresApellidos || username.trim(),
          email: data.email,
          rol: data.rol || 'Admin'
        };
        onLoginSuccess(userObj);
      }
    } catch (err) {
      console.error('Error de autenticación API:', err);
      const details = extractApiErrorDetails(err, 'Credenciales inválidas o error de conexión con el servidor.');
      setError(details.message);
      setFieldErrors(details.fieldErrors || {});
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, setter, val) => {
    setter(val);
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
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-icon">
            <Banknote size={32} />
          </div>
          <h2 className="auth-title">FGR Préstamos</h2>
          <p className="auth-subtitle">Sistema de Gestión de Préstamos y Cobranzas</p>
        </div>

        {successMessage && (
          <div style={{
            padding: '0.85rem 1rem',
            background: 'rgba(5, 150, 105, 0.1)',
            border: '1px solid rgba(5, 150, 105, 0.3)',
            borderRadius: '8px',
            color: '#059669',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            lineHeight: '1.4',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            fontWeight: 500
          }}>
            <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{successMessage}</div>
          </div>
        )}

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

        <form onSubmit={handleSubmit} noValidate>
          <div className="field-group" style={{ marginBottom: '1rem' }}>
            <label style={{ color: fieldErrors.username ? '#dc2626' : undefined, fontWeight: 500 }}>
              Usuario *
            </label>
            <div className="input-group">
              <User size={16} color={fieldErrors.username ? '#dc2626' : undefined} />
              <input
                type="text"
                className="form-input"
                placeholder="Ingrese su usuario o email"
                value={username}
                onChange={(e) => handleInputChange('username', setUsername, e.target.value)}
                style={fieldErrors.username ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                required
              />
            </div>
            {fieldErrors.username && (
              <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                ❌ {fieldErrors.username}
              </span>
            )}
          </div>

          {isRegister && (
            <>
              <div className="field-group" style={{ marginBottom: '1rem' }}>
                <label style={{ color: fieldErrors.nombresApellidos ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Nombres y Apellidos *
                </label>
                <div className="input-group">
                  <User size={16} color={fieldErrors.nombresApellidos ? '#dc2626' : undefined} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Carlos Mendoza"
                    value={nombresApellidos}
                    onChange={(e) => handleInputChange('nombresApellidos', setNombresApellidos, e.target.value)}
                    style={fieldErrors.nombresApellidos ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                    required
                  />
                </div>
                {fieldErrors.nombresApellidos && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.nombresApellidos}
                  </span>
                )}
              </div>

              <div className="field-group" style={{ marginBottom: '1rem' }}>
                <label style={{ color: fieldErrors.email ? '#dc2626' : undefined, fontWeight: 500 }}>
                  Correo Electrónico *
                </label>
                <div className="input-group">
                  <Mail size={16} color={fieldErrors.email ? '#dc2626' : undefined} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => handleInputChange('email', setEmail, e.target.value)}
                    style={fieldErrors.email ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                    ❌ {fieldErrors.email}
                  </span>
                )}
              </div>

              <div className="field-group" style={{ marginBottom: '1rem' }}>
                <label>Rol del Sistema</label>
                <div className="input-group">
                  <ShieldCheck size={16} />
                  <select
                    className="form-select"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                  >
                    <option value="Admin">Admin (Creador)</option>
                    <option value="Prestamista">Prestamista</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="field-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: fieldErrors.password ? '#dc2626' : undefined, fontWeight: 500 }}>
              Contraseña *
            </label>
            <div className="input-group">
              <Lock size={16} color={fieldErrors.password ? '#dc2626' : undefined} />
              <input
                type="password"
                className="form-input"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => handleInputChange('password', setPassword, e.target.value)}
                style={fieldErrors.password ? { borderColor: '#ef4444', backgroundColor: 'rgba(254, 242, 242, 0.6)' } : {}}
                required
              />
            </div>
            {fieldErrors.password && (
              <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                ❌ {fieldErrors.password}
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
            <span>{loading ? 'Procesando...' : isRegister ? 'Registrar Usuario' : 'Ingresar al Sistema'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setFieldErrors({});
            }}
          >
            {isRegister ? '¿Ya tiene cuenta? Iniciar Sesión' : '¿No tiene cuenta? Registrarse'}
          </button>
        </div>
      </div>
    </div>
  );
}
