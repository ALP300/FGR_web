import React, { useState } from 'react';
import { Banknote, User, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { authApi } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('admin_fgr');
  const [password, setPassword] = useState('admin123');
  
  // Register fields
  const [email, setEmail] = useState('');
  const [nombresApellidos, setNombresApellidos] = useState('');
  const [rol, setRol] = useState('Admin');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await authApi.register({
          nombreUsuario: username,
          email,
          password,
          nombresApellidos,
          rol
        });
        alert('Usuario registrado exitosamente. Ya puede iniciar sesión.');
        setIsRegister(false);
      } else {
        const data = await authApi.login(username, password);
        onLoginSuccess(data.user || { nombreUsuario: username, rol: 'Admin', nombresApellidos: username });
      }
    } catch (err) {
      setError('Credenciales inválidas o error de conexión con la API.');
    } finally {
      setLoading(false);
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

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field-group" style={{ marginBottom: '1rem' }}>
            <label>Usuario</label>
            <div className="input-group">
              <User size={16} />
              <input
                type="text"
                className="form-input"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div className="field-group" style={{ marginBottom: '1rem' }}>
                <label>Nombres y Apellidos</label>
                <div className="input-group">
                  <User size={16} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Carlos Mendoza"
                    value={nombresApellidos}
                    onChange={(e) => setNombresApellidos(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field-group" style={{ marginBottom: '1rem' }}>
                <label>Correo Electrónico</label>
                <div className="input-group">
                  <Mail size={16} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
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
                    <option value="Admin">Administrador</option>
                    <option value="Operador">Operador de Cobranzas</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="field-group" style={{ marginBottom: '1.5rem' }}>
            <label>Contraseña</label>
            <div className="input-group">
              <Lock size={16} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
            <span>{loading ? 'Cargando...' : isRegister ? 'Registrar Usuario' : 'Ingresar al Sistema'}</span>
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
            }}
          >
            {isRegister ? '¿Ya tiene cuenta? Iniciar Sesión' : '¿No tiene cuenta? Registrarse'}
          </button>
        </div>
      </div>
    </div>
  );
}
