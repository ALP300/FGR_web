import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Eye, Phone, MapPin, MessageSquare, ShieldAlert, ShieldCheck, Filter, RefreshCw } from 'lucide-react';
import { clientesApi, getWhatsAppLink } from '../services/api';
import DetalleClienteModal from '../components/DetalleClienteModal';

export default function ClientesPage({ onNuevoCliente }) {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [scoreFiltro, setScoreFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);

  useEffect(() => {
    loadClientes();
  }, [busqueda, estadoFiltro]);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const data = await clientesApi.getClientes(busqueda, estadoFiltro);
      setClientes(data || []);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (c) => {
    setSelectedCliente(c);
    setIsDetalleOpen(true);
  };

  const handleWhatsAppDirecto = (c) => {
    const nombre = c.nombreCompleto || `${c.nombres || ''} ${c.apellidos || ''}`.trim();
    const mensaje = `Hola ${nombre}, le saludamos de *FGR Préstamos*. ¿En qué podemos ayudarle el día de hoy?`;
    const url = getWhatsAppLink(c.telefono, mensaje);
    if (url) {
      window.open(url, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
    }
  };

  const clientesFiltrados = clientes.filter(c => {
    if (!scoreFiltro) return true;
    return (c.estadoCrediticio || 'Al día') === scoreFiltro;
  });

  return (
    <div className="content-body">
      <div className="card-panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div className="panel-title">Directorio de Clientes & Scoring ({clientesFiltrados.length})</div>

          <div className="search-filter-bar">
            <div className="input-group">
              <Search size={16} />
              <input
                type="text"
                className="form-input"
                placeholder="Buscar por DNI o Nombres..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <select
              className="form-select no-icon"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="">Todos los Estados</option>
              <option value="Activo">Activos</option>
              <option value="Inactivo">Inactivos</option>
            </select>

            <select
              className="form-select no-icon"
              value={scoreFiltro}
              onChange={(e) => setScoreFiltro(e.target.value)}
            >
              <option value="">Score Crediticio (Todos)</option>
              <option value="Al día">🟢 Al día (A / B)</option>
              <option value="En mora">🟡 En mora (C)</option>
              <option value="Bloqueado">🔴 Bloqueado (D)</option>
            </select>

            <button className="btn btn-secondary" onClick={loadClientes} title="Actualizar Datos" disabled={loading} style={{ padding: '0.5rem' }}>
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>

            <button className="btn btn-primary" onClick={onNuevoCliente}>
              <UserPlus size={16} />
              Nuevo Cliente
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombres y Apellidos</th>
                <th>Contacto & WhatsApp</th>
                <th>Dirección</th>
                <th>Score Crediticio</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Cargando clientes de la API...</td>
                </tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No se encontraron clientes registrados con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((c) => {
                  const nombreMostrar = c.nombreCompleto || `${c.nombres || ''} ${c.apellidos || ''}`.trim() || '---';
                  const score = c.estadoCrediticio || 'Al día';
                  const scoreBadge = score === 'Bloqueado' ? 'badge-inactivo' : score === 'En mora' ? 'badge-pendiente' : 'badge-activo';

                  return (
                    <tr key={c.id}>
                      <td><strong>{c.dni}</strong></td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{nombreMostrar}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reg: {c.fechaRegistro}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={13} className="text-muted" />
                          <span>{c.telefono || '---'}</span>
                          {c.telefono && (
                            <button
                              onClick={() => handleWhatsAppDirecto(c)}
                              title="Abrir chat de WhatsApp"
                              style={{
                                background: 'rgba(5, 150, 105, 0.1)',
                                border: '1px solid rgba(5, 150, 105, 0.3)',
                                borderRadius: '4px',
                                color: '#059669',
                                cursor: 'pointer',
                                padding: '2px 4px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <MessageSquare size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <MapPin size={13} className="text-muted" />
                          {c.direccion || '---'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${scoreBadge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {score === 'Bloqueado' ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                          {score} ({c.scoreCrediticio || 'A'})
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${c.estado?.toLowerCase()}`}>{c.estado}</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleVerDetalle(c)}
                        >
                          <Eye size={14} />
                          Expediente
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DetalleClienteModal
        isOpen={isDetalleOpen}
        onClose={() => setIsDetalleOpen(false)}
        cliente={selectedCliente}
        onActualizar={loadClientes}
      />
    </div>
  );
}
