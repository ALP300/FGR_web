import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Eye, Phone, MapPin, ToggleLeft, Filter } from 'lucide-react';
import { clientesApi } from '../services/api';
import DetalleClienteModal from '../components/DetalleClienteModal';

export default function ClientesPage({ onNuevoCliente }) {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
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

  return (
    <div className="content-body">
      <div className="card-panel">
        <div className="panel-header">
          <div className="panel-title">Directorio de Clientes ({clientes.length})</div>

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
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Cargando clientes de la API...</td>
                </tr>
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No se encontraron clientes registrados con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                clientes.map((c) => {
                  const nombreMostrar = c.nombreCompleto || `${c.nombres || ''} ${c.apellidos || ''}`.trim() || '---';
                  return (
                    <tr key={c.id}>
                      <td><strong>{c.dni}</strong></td>
                      <td>{nombreMostrar}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={13} className="text-muted" />
                          {c.telefono || '---'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <MapPin size={13} className="text-muted" />
                          {c.direccion || '---'}
                        </div>
                      </td>
                      <td>{c.correo || '---'}</td>
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
