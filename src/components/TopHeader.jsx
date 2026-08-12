import React from 'react';
import { Server, Database, Plus, Banknote, UserPlus, Menu } from 'lucide-react';
import { API_CONFIG } from '../services/api';

export default function TopHeader({ 
  title, 
  subtitle, 
  isMockMode, 
  setIsMockMode, 
  onNuevoCliente, 
  onNuevoPrestamo, 
  onNuevoPago,
  onOpenMobileMenu 
}) {
  const toggleMode = () => {
    const nextVal = !isMockMode;
    API_CONFIG.setUseMock(nextVal);
    setIsMockMode(nextVal);
  };

  return (
    <header className="top-header">
      <div className="top-header-left">
        {/* Hamburguesa para pantallas móviles */}
        <button 
          className="mobile-menu-toggle"
          onClick={onOpenMobileMenu}
          title="Abrir menú de navegación"
        >
          <Menu size={22} />
        </button>

        <div className="page-title-group">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className="header-actions">
        <button 
          className={`mode-toggle-btn ${isMockMode ? 'mock' : 'backend'}`}
          onClick={toggleMode}
          title="Click para alternar entre Servidor Backend REST y Modo Demo Mock"
        >
          <span className="pulse-dot"></span>
          {isMockMode ? (
            <>
              <Database size={14} />
              <span>Modo Demo (Mock)</span>
            </>
          ) : (
            <>
              <Server size={14} />
              <span>Backend REST</span>
            </>
          )}
        </button>

        {onNuevoPago && (
          <button className="btn btn-secondary btn-sm" onClick={onNuevoPago}>
            <Plus size={15} />
            <span>Cobrar</span>
          </button>
        )}

        {onNuevoCliente && (
          <button className="btn btn-secondary btn-sm" onClick={onNuevoCliente}>
            <UserPlus size={15} />
            <span>Cliente</span>
          </button>
        )}

        {onNuevoPrestamo && (
          <button className="btn btn-primary btn-sm" onClick={onNuevoPrestamo}>
            <Banknote size={15} />
            <span>Préstamo</span>
          </button>
        )}
      </div>
    </header>
  );
}
