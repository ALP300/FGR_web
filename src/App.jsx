import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import PrestamosPage from './pages/PrestamosPage';
import CuotasCobranzaPage from './pages/CuotasCobranzaPage';
import PagosPage from './pages/PagosPage';
import ReportesPage from './pages/ReportesPage';
import LoginPage from './pages/LoginPage';

import SimuladorModal from './components/SimuladorModal';
import NuevoClienteModal from './components/NuevoClienteModal';
import NuevoPrestamoModal from './components/NuevoPrestamoModal';
import NuevoPagoModal from './components/NuevoPagoModal';

import { API_CONFIG } from './services/api';
import { MOCK_USER } from './services/mockData';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fgr_user');
    return saved ? JSON.parse(saved) : MOCK_USER;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMockMode, setIsMockMode] = useState(API_CONFIG.useMock);

  // Modals
  const [isSimuladorOpen, setIsSimuladorOpen] = useState(false);
  const [isNuevoClienteOpen, setIsNuevoClienteOpen] = useState(false);
  const [isNuevoPrestamoOpen, setIsNuevoPrestamoOpen] = useState(false);
  const [isNuevoPagoOpen, setIsNuevoPagoOpen] = useState(false);

  // Selected item for payment or loan flow
  const [prestamoInitialData, setPrestamoInitialData] = useState(null);
  const [cuotaInitialData, setCuotaInitialData] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('fgr_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('fgr_token');
    localStorage.removeItem('fgr_user');
    setUser(null);
  };

  const handleCobrarCuota = (cuota) => {
    setCuotaInitialData(cuota);
    setIsNuevoPagoOpen(true);
  };

  const handleProcederPrestamoDesdeSimulador = (simData) => {
    setPrestamoInitialData(simData);
    setIsNuevoPrestamoOpen(true);
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Dashboard General', subtitle: 'Resumen financiero, métricas de cartera y alertas de mora.' };
      case 'clientes':
        return { title: 'Gestión de Clientes', subtitle: 'Administración de padrón de clientes, expedientes e historial.' };
      case 'prestamos':
        return { title: 'Gestión de Préstamos', subtitle: 'Cartera de préstamos desembolsados, simulaciones y estados.' };
      case 'cuotas':
        return { title: 'Cuotas & Cobranzas', subtitle: 'Control estricto de vencimientos y cuotas en morosidad.' };
      case 'pagos':
        return { title: 'Historial de Pagos', subtitle: 'Registro transaccional de ingresos por cuota y comprobantes.' };
      case 'reportes':
        return { title: 'Módulo de Reportes', subtitle: 'Exportación masiva de datos en formatos Excel, CSV y PDF.' };
      default:
        return { title: 'Sistema FGR', subtitle: 'Gestión de Préstamos y Cobranzas' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        onOpenSimulador={() => setIsSimuladorOpen(true)}
      />

      <main className="main-content">
        <TopHeader
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          isMockMode={isMockMode}
          setIsMockMode={setIsMockMode}
          onNuevoCliente={() => setIsNuevoClienteOpen(true)}
          onNuevoPrestamo={() => {
            setPrestamoInitialData(null);
            setIsNuevoPrestamoOpen(true);
          }}
          onNuevoPago={() => {
            setCuotaInitialData(null);
            setIsNuevoPagoOpen(true);
          }}
        />

        {activeTab === 'dashboard' && (
          <DashboardPage
            onOpenSimulador={() => setIsSimuladorOpen(true)}
            onNuevoCliente={() => setIsNuevoClienteOpen(true)}
            onNuevoPrestamo={() => setIsNuevoPrestamoOpen(true)}
            onNuevoPago={() => setIsNuevoPagoOpen(true)}
          />
        )}

        {activeTab === 'clientes' && (
          <ClientesPage
            onNuevoCliente={() => setIsNuevoClienteOpen(true)}
          />
        )}

        {activeTab === 'prestamos' && (
          <PrestamosPage
            onNuevoPrestamo={() => setIsNuevoPrestamoOpen(true)}
            onOpenSimulador={() => setIsSimuladorOpen(true)}
            onCobrarCuota={handleCobrarCuota}
          />
        )}

        {activeTab === 'cuotas' && (
          <CuotasCobranzaPage
            onCobrarCuota={handleCobrarCuota}
          />
        )}

        {activeTab === 'pagos' && (
          <PagosPage
            onNuevoPago={() => setIsNuevoPagoOpen(true)}
          />
        )}

        {activeTab === 'reportes' && (
          <ReportesPage />
        )}
      </main>

      {/* Global Modals */}
      <SimuladorModal
        isOpen={isSimuladorOpen}
        onClose={() => setIsSimuladorOpen(false)}
        onProcederPrestamo={handleProcederPrestamoDesdeSimulador}
      />

      <NuevoClienteModal
        isOpen={isNuevoClienteOpen}
        onClose={() => setIsNuevoClienteOpen(false)}
      />

      <NuevoPrestamoModal
        isOpen={isNuevoPrestamoOpen}
        onClose={() => setIsNuevoPrestamoOpen(false)}
        initialData={prestamoInitialData}
      />

      <NuevoPagoModal
        isOpen={isNuevoPagoOpen}
        onClose={() => setIsNuevoPagoOpen(false)}
        initialCuota={cuotaInitialData}
      />
    </div>
  );
}
