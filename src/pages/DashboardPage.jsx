import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Banknote, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Calculator, 
  ArrowUpRight, 
  Clock,
  Wallet,
  CalendarCheck,
  ShieldAlert,
  FileSpreadsheet,
  Bike,
  Filter,
  Shield
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardApi, cuotasApi, clientesApi, prestamosApi, cajaApi, usuariosApi } from '../services/api';

export default function DashboardPage({ 
  user,
  onOpenSimulador, 
  onNuevoCliente, 
  onNuevoPrestamo, 
  onNuevoPago,
  onNavigateTab
}) {
  const [kpis, setKpis] = useState(null);
  const [graficos, setGraficos] = useState(null);
  const [cuotasVencidas, setCuotasVencidas] = useState([]);
  const [clientesCount, setClientesCount] = useState(0);
  const [prestamosCount, setPrestamosCount] = useState(0);
  const [estadoCaja, setEstadoCaja] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prestamista / Rol filter
  const userRole = user?.rol?.toString()?.toLowerCase() || 'admin';
  const isAdmin = userRole === 'admin' || userRole === '1';

  const [cobradoresList, setCobradoresList] = useState([]);
  const [selectedCobradorId, setSelectedCobradorId] = useState('');

  useEffect(() => {
    if (isAdmin) {
      usuariosApi.getAll().then(data => {
        setCobradoresList(data || []);
      }).catch(err => console.warn('Error cargando lista de cobradores:', err));
    }
  }, [isAdmin]);

  useEffect(() => {
    loadDashboard(selectedCobradorId ? parseInt(selectedCobradorId) : null);
  }, [selectedCobradorId]);

  const loadDashboard = async (cobradorId = null) => {
    setLoading(true);
    try {
      const [kpiData, grafData, vencidasData, clientesList, prestamosList, cajaData] = await Promise.all([
        dashboardApi.getKPIs(cobradorId).catch(() => null),
        dashboardApi.getGraficos(cobradorId).catch(() => null),
        cuotasApi.getCuotasVencidas(cobradorId).catch(() => []),
        clientesApi.getClientes('', 'Activo', cobradorId).catch(() => []),
        prestamosApi.getPrestamos(null, 'EnCurso', cobradorId).catch(() => []),
        cajaApi.getEstadoCaja().catch(() => null)
      ]);

      setKpis(kpiData);
      setGraficos(grafData);
      setCuotasVencidas(vencidasData || []);
      setClientesCount(Array.isArray(clientesList) ? clientesList.length : 0);
      setPrestamosCount(Array.isArray(prestamosList) ? prestamosList.length : 0);
      setEstadoCaja(cajaData);
    } catch (err) {
      console.error('Error cargando Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalClientes = kpis?.clientesActivos ?? kpis?.totalClientesActivos ?? clientesCount;
  const totalPrestamosActivos = kpis?.totalPrestamosActivos ?? prestamosCount;
  const dineroPrestado = kpis?.dineroPrestado ?? kpis?.montoTotalDispersado ?? 0;
  const dineroRecuperado = kpis?.dineroRecuperado ?? kpis?.montoTotalCobrado ?? 0;
  const cuotasVencidasCant = kpis?.cuotasVencidasCount ?? cuotasVencidas.length ?? 0;
  const montoVencido = kpis?.montoVencido ?? cuotasVencidas.reduce((sum, c) => sum + (c.montoCuota || 0) + (c.interesMoratorio || 0), 0);

  const barChartData = (graficos?.pagosPorMes || graficos?.ingresosMensuales || [
    { mes: "Marzo", monto: 4200 },
    { mes: "Abril", monto: 5100 },
    { mes: "Mayo", monto: 6300 },
    { mes: "Junio", monto: 5800 },
    { mes: "Julio", monto: 7200 },
    { mes: "Agosto", monto: 2600 }
  ]).map(d => ({
    mes: d.mes,
    ingresos: d.monto !== undefined ? d.monto : (d.ingresos || 0)
  }));

  const pieChartData = graficos?.estadoPrestamos || [
    { name: "En Curso", value: totalPrestamosActivos || 2, color: "#059669" },
    { name: "Pendiente", value: 1, color: "#2563eb" },
    { name: "Pagado", value: 15, color: "#7c3aed" },
    { name: "Vencido", value: cuotasVencidasCant || 2, color: "#dc2626" }
  ];

  return (
    <div className="content-body">
      {/* Selector de Ruta / Cobrador para Admin o Badge para Cobrador */}
      {isAdmin && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Consolidado y Supervisión de Rutas</h3>
              <p className="text-xs text-slate-500">Selecciona una ruta específica o consulta el consolidado general de la empresa.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCobradorId}
              onChange={(e) => setSelectedCobradorId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">🌐 Todas las Rutas (Consolidado General)</option>
              {cobradoresList.map(c => (
                <option key={c.id} value={c.id}>
                  🚴‍♂️ Ruta: {c.nombresApellidos || c.nombreUsuario} (@{c.nombreUsuario})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <Bike className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                Prestamista: {user?.nombresApellidos || user?.nombreUsuario}
              </h3>
              <p className="text-xs text-emerald-700">
                Mostrando únicamente tus clientes, préstamos y metas asignadas para hoy.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-200/80 text-emerald-900 font-semibold text-xs rounded-full">
            Prestamista Activo
          </span>
        </div>
      )}

      {/* Top Banner KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon emerald">
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <h4>Clientes Activos</h4>
            <div className="kpi-value">{loading ? '...' : totalClientes}</div>
            <div className="kpi-subtext">Titulares en sistema</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Banknote size={24} />
          </div>
          <div className="kpi-info">
            <h4>Préstamos Activos</h4>
            <div className="kpi-value">{loading ? '...' : totalPrestamosActivos}</div>
            <div className="kpi-subtext">Operaciones vigentes</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon gold">
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <h4>Dinero Desembolsado</h4>
            <div className="kpi-value">S/. {loading ? '...' : dineroPrestado.toLocaleString()}</div>
            <div className="kpi-subtext">Capital total colocado</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-info">
            <h4>Total Recaudado</h4>
            <div className="kpi-value text-primary">S/. {loading ? '...' : dineroRecuperado.toLocaleString()}</div>
            <div className="kpi-subtext">Capital + Intereses cobrados</div>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: cuotasVencidasCant > 0 ? '4px solid #dc2626' : undefined }}>
          <div className="kpi-icon red">
            <ShieldAlert size={24} />
          </div>
          <div className="kpi-info">
            <h4>Cartera en Riesgo</h4>
            <div className="kpi-value" style={{ color: '#dc2626' }}>
              S/. {loading ? '...' : montoVencido.toFixed(2)}
            </div>
            <div className="kpi-subtext">{cuotasVencidasCant} cuotas con atraso</div>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="card-panel" style={{ padding: '1.25rem' }}>
        <div className="panel-header" style={{ marginBottom: '1rem' }}>
          <div className="panel-title" style={{ fontSize: '1.05rem' }}>Centro de Operaciones Rápidas</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={onNuevoPago} style={{ justifyContent: 'center' }}>
            <DollarSign size={16} />
            Registrar Cobro
          </button>

          <button className="btn btn-secondary" onClick={onNuevoPrestamo} style={{ justifyContent: 'center' }}>
            <Banknote size={16} />
            Nuevo Préstamo
          </button>

          <button className="btn btn-secondary" onClick={onNuevoCliente} style={{ justifyContent: 'center' }}>
            <Users size={16} />
            Nuevo Cliente
          </button>

          <button className="btn btn-secondary" onClick={onOpenSimulador} style={{ justifyContent: 'center' }}>
            <Calculator size={16} />
            Simulador Express
          </button>

          {onNavigateTab && (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={() => onNavigateTab('cartera-vencida')} 
                style={{ justifyContent: 'center', color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.3)' }}
              >
                <AlertTriangle size={16} />
                Gestión de Mora
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={() => onNavigateTab('caja')} 
                style={{ justifyContent: 'center', color: '#059669', borderColor: 'rgba(5, 150, 105, 0.3)' }}
              >
                <Wallet size={16} />
                Caja Diaria
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={() => onNavigateTab('calendario')} 
                style={{ justifyContent: 'center', color: '#2563eb', borderColor: 'rgba(37, 99, 235, 0.3)' }}
              >
                <CalendarCheck size={16} />
                Calendario
              </button>
            </>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
        {/* Recaudación Mensual Bar Chart */}
        <div className="card-panel">
          <div className="panel-title" style={{ marginBottom: '1rem', fontSize: '1.05rem' }}>
            Recaudación de Cobros Mensuales (S/.)
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={barChartData}>
                <XAxis dataKey="mes" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  formatter={(val) => [`S/. ${val}`, 'Cobrado']}
                />
                <Bar dataKey="ingresos" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estado de Cartera Pie Chart */}
        <div className="card-panel">
          <div className="panel-title" style={{ marginBottom: '1rem', fontSize: '1.05rem' }}>
            Distribución del Estado de Préstamos
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#059669'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
