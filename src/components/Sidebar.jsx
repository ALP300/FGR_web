import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Banknote, 
  CalendarClock, 
  Receipt, 
  FileText, 
  Calculator, 
  LogOut, 
  ShieldCheck,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, onOpenSimulador, isOpen, onClose }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'prestamos', label: 'Préstamos', icon: Banknote },
    { id: 'cuotas', label: 'Cuotas & Cobranzas', icon: CalendarClock },
    { id: 'pagos', label: 'Historial de Pagos', icon: Receipt },
    { id: 'reportes', label: 'Reportes', icon: FileText },
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose(); // Cerrar menú móvil al seleccionar opción
  };

  return (
    <>
      {/* Backdrop overlay para móvil */}
      {isOpen && (
        <div 
          className="sidebar-mobile-backdrop"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="brand-header">
          <div className="brand-logo-icon">
            <Banknote size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="brand-title">FGR</div>
            <div className="brand-subtitle">Préstamos & Cobranzas</div>
          </div>
          {/* Botón para cerrar drawer en móvil */}
          <button className="sidebar-close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <nav className="nav-menu">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectTab(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              className="btn btn-secondary w-full"
              onClick={() => {
                onOpenSimulador();
                if (onClose) onClose();
              }}
              style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--primary)' }}
            >
              <Calculator size={18} />
              <span>Simulador Express</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-avatar">
              {user?.nombresApellidos ? user.nombresApellidos.charAt(0) : 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.nombresApellidos || user?.nombreUsuario || 'Usuario FGR'}</div>
              <div className="user-role" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} />
                {user?.rol || 'Admin'}
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
