import React from 'react';
import { Plus, Banknote, UserPlus, Menu } from 'lucide-react';

export default function TopHeader({ 
  title, 
  subtitle, 
  onNuevoCliente, 
  onNuevoPrestamo, 
  onNuevoPago,
  onOpenMobileMenu 
}) {
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
