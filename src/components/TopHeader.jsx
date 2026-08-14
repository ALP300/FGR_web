import React from 'react';
import { Plus, Banknote, UserPlus, Menu, Shield, Bike, UserCheck } from 'lucide-react';

export default function TopHeader({ 
  title, 
  subtitle, 
  user,
  onNuevoCliente, 
  onNuevoPrestamo, 
  onNuevoPago,
  onOpenMobileMenu 
}) {
  const userRole = user?.rol?.toString()?.toLowerCase() || 'admin';
  const isAdmin = userRole === 'admin' || userRole === '1';
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
          <div className="flex items-center gap-2">
            <h1>{title}</h1>
            {user && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isAdmin 
                  ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {isAdmin ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                <span>{user?.rol || (isAdmin ? 'Admin' : 'Prestamista')}</span>
              </span>
            )}
          </div>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className="header-actions">
        {!isAdmin && onNuevoPago && (
          <button className="btn btn-secondary btn-sm" onClick={onNuevoPago}>
            <Plus size={15} />
            <span>Cobrar</span>
          </button>
        )}

        {!isAdmin && onNuevoCliente && (
          <button className="btn btn-secondary btn-sm" onClick={onNuevoCliente}>
            <UserPlus size={15} />
            <span>Cliente</span>
          </button>
        )}

        {!isAdmin && onNuevoPrestamo && (
          <button className="btn btn-primary btn-sm" onClick={onNuevoPrestamo}>
            <Banknote size={15} />
            <span>Préstamo</span>
          </button>
        )}
      </div>
    </header>
  );
}
