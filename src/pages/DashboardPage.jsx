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
  Clock 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardApi, cuotasApi, clientesApi, prestamosApi } from '../services/api';

export default function DashboardPage({ onOpenSimulador, onNuevoCliente, onNuevoPrestamo, onNuevoPago }) {
  const [kpis, setKpis] = useState(null);
  const [graficos, setGraficos] = useState(null);
  const [cuotasVencidas, setCuotasVencidas] = useState([]);
  const [clientesCount, setClientesCount] = useState(0);
  const [prestamosCount, setPrestamosCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [kpiData, grafData, vencidasData, clientesList, prestamosList] = await Promise.all([
        dashboardApi.getKPIs().catch(() => null),
        dashboardApi.getGraficos().catch(() => null),
        cuotasApi.getCuotasVencidas().catch(() => []),
        clientesApi.getClientes('', 'Activo').catch(() => []),
        prestamosApi.getPrestamos(null, 'EnCurso').catch(() => [])
      ]);

      setKpis(kpiData);
      setGraficos(grafData);
      setCuotasVencidas(vencidasData || []);
      setClientesCount(Array.isArray(clientesList) ? clientesList.length : 0);
      setPrestamosCount(Array.isArray(prestamosList) ? prestamosList.length : 0);
    } catch (err) {
      console.error('Error cargando Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mapeo inteligente con soporte para los DTOs C# DashboardKpisDto
  const totalClientes = kpis?.clientesActivos ?? kpis?.totalClientesActivos ?? clientesCount;
  const totalPrestamosActivos = kpis?.totalPrestamosActivos ?? prestamosCount;
  const dineroPrestado = kpis?.dineroPrestado ?? kpis?.montoTotalDispersado ?? 0;
  const dineroRecuperado = kpis?.dineroRecuperado ?? kpis?.montoTotalCobrado ?? 0;
  const cuotasVencidasCant = kpis?.cuotasVencidasCount ?? cuotasVencidas.length ?? 0;

  // Preparar datos para el gráfico de ingresos/pagos por mes
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
    { name: "En Curso", value: totalPrestamosActivos || 1, color: "#059669" },
    { name: "Pendiente", value: 2, color: "#2563eb" },
    { name: "Pagado", value: 5, color: "#7c3aed" },
    { name: "Vencido", value: cuotasVencidasCant || 1, color: "#dc2626" }
  ];

  return (
    <div className="content-body">
      {/* Top Banner KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon emerald">
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <h4>Clientes Activos</h4>
            <div className="kpi-value">{loading ? '...' : totalClientes}</div>
            <div className="kpi-subtext">Clientes en sistema</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Banknote size={24} />
          </div>
          <div className="kpi-info">
            <h4>Préstamos en Curso</h4>
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
            <div className="kpi-subtext">Capital invertido</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-info">
            <h4>Total Recaudado</h4>
            <div className="kpi-value text-primary">S/. {loading ? '...' : dineroRecuperado.toLocaleString()}</div>
            <div className="kpi-subtext">Cap. + Intereses cobrados</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon red">
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-info">
            <h4>Cuotas Vencidas</h4>
            <div className="kpi-value" style={{ color: '#dc2626' }}>{loading ? '...' : cuotasVencidasCant}</div>
            <div className="kpi-subtext">Alerta de mora</div>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="card-panel">
        <div className="panel-header">
          <div className="panel-title" style={{ flexWrap: 'wrap', whiteSpace: 'normal' }}>
            <ArrowUpRight className="text-primary" size={20} />
            <span>Acciones Rápidas de Cobranza & Gestión</span>
          </div>
        </div>
        <div className="quick-actions-row">
          <button className="btn btn-primary" onClick={onNuevoPago}>
            <DollarSign size={16} />
            <span>Registrar Cobro de Cuota</span>
          </button>
          <button className="btn btn-secondary" onClick={onNuevoPrestamo}>
            <Banknote size={16} />
            <span>Desembolsar Préstamo</span>
          </button>
          <button className="btn btn-secondary" onClick={onNuevoCliente}>
            <Users size={16} />
            <span>Agregar Cliente</span>
          </button>
          <button className="btn btn-secondary" onClick={onOpenSimulador}>
            <Calculator size={16} />
            <span>Simulador Amortización</span>
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="dashboard-charts-grid">
        {/* Chart 1: Revenue trend */}
        <div className="card-panel" style={{ minWidth: 0 }}>
          <div className="panel-header">
            <div className="panel-title" style={{ whiteSpace: 'normal' }}>
              <TrendingUp className="text-primary" size={18} />
              <span>Flujo de Recaudación Mensual (S/.)</span>
            </div>
          </div>
          <div style={{ width: '100%', height: 260, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="mes" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#0f172a' }} />
                <Bar dataKey="ingresos" fill="#059669" radius={[6, 6, 0, 0]} name="Recaudación" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Loan state distribution */}
        <div className="card-panel" style={{ minWidth: 0 }}>
          <div className="panel-header">
            <div className="panel-title" style={{ whiteSpace: 'normal' }}>
              <CheckCircle className="text-primary" size={18} />
              <span>Estado General de Préstamos</span>
            </div>
          </div>
          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={40}
                  paddingAngle={4}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || "#059669"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#0f172a' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Urgent Overdue Table Section */}
      <div className="card-panel">
        <div className="panel-header">
          <div className="panel-title" style={{ color: '#dc2626', whiteSpace: 'normal' }}>
            <AlertTriangle size={20} />
            <span>Alerta Inmediata: Cuotas Vencidas ({cuotasVencidas.length})</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Préstamo #</th>
                <th>Fecha Vencimiento</th>
                <th>Monto Cuota</th>
                <th>Días Atraso</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cuotasVencidas.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                    ¡Excelente! No hay cuotas vencidas en este momento.
                  </td>
                </tr>
              ) : (
                cuotasVencidas.map(c => (
                  <tr key={c.id}>
                    <td><strong>Préstamo #{c.prestamoId}</strong></td>
                    <td>{c.fechaVencimiento?.split('T')[0] || c.fechaVencimiento}</td>
                    <td style={{ color: '#dc2626', fontWeight: 700 }}>S/. {parseFloat(c.montoCuota).toFixed(2)}</td>
                    <td>
                      <span className="badge badge-vencido">
                        <Clock size={12} />
                        {c.diasAtraso || 0} días
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-vencido">{c.estado}</span>
                    </td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={onNuevoPago}>
                        Cobrar Ahora
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
