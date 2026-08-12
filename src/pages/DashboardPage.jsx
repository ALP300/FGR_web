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
import { dashboardApi, cuotasApi } from '../services/api';

export default function DashboardPage({ onOpenSimulador, onNuevoCliente, onNuevoPrestamo, onNuevoPago }) {
  const [kpis, setKpis] = useState(null);
  const [graficos, setGraficos] = useState(null);
  const [cuotasVencidas, setCuotasVencidas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [kpiData, grafData, vencidasData] = await Promise.all([
        dashboardApi.getKPIs(),
        dashboardApi.getGraficos(),
        cuotasApi.getCuotasVencidas()
      ]);
      setKpis(kpiData);
      setGraficos(grafData);
      setCuotasVencidas(vencidasData || []);
    } catch (err) {
      console.error('Error cargando Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-body">
      {/* Top Banner KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon emerald">
            <Users size={26} />
          </div>
          <div className="kpi-info">
            <h4>Clientes Activos</h4>
            <div className="kpi-value">{kpis?.totalClientesActivos || 0}</div>
            <div className="kpi-subtext">Clientes registrados</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Banknote size={26} />
          </div>
          <div className="kpi-info">
            <h4>Préstamos en Curso</h4>
            <div className="kpi-value">{kpis?.totalPrestamosActivos || 0}</div>
            <div className="kpi-subtext">Operaciones vigentes</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon gold">
            <DollarSign size={26} />
          </div>
          <div className="kpi-info">
            <h4>Dinero Desembolsado</h4>
            <div className="kpi-value">S/. {kpis?.montoTotalDispersado ? kpis.montoTotalDispersado.toLocaleString() : '0'}</div>
            <div className="kpi-subtext">Capital invertido</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <TrendingUp size={26} />
          </div>
          <div className="kpi-info">
            <h4>Total Recaudado</h4>
            <div className="kpi-value text-primary">S/. {kpis?.montoTotalCobrado ? kpis.montoTotalCobrado.toLocaleString() : '0'}</div>
            <div className="kpi-subtext">Cap. + Intereses cobrados</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon red">
            <AlertTriangle size={26} />
          </div>
          <div className="kpi-info">
            <h4>Cuotas Vencidas</h4>
            <div className="kpi-value" style={{ color: '#ef4444' }}>{kpis?.cuotasVencidasCount || 0}</div>
            <div className="kpi-subtext">Alerta de mora</div>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="card-panel" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))' }}>
        <div className="panel-header">
          <div className="panel-title">
            <ArrowUpRight className="text-primary" size={20} />
            Acciones Rápidas de Cobranza & Gestión
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onNuevoPago}>
            <DollarSign size={16} />
            Registrar Cobro de Cuota
          </button>
          <button className="btn btn-secondary" onClick={onNuevoPrestamo}>
            <Banknote size={16} />
            Desembolsar Nuevo Préstamo
          </button>
          <button className="btn btn-secondary" onClick={onNuevoCliente}>
            <Users size={16} />
            Agregar Cliente
          </button>
          <button className="btn btn-secondary" onClick={onOpenSimulador}>
            <Calculator size={16} />
            Simulador de Amortización
          </button>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Chart 1: Revenue trend */}
        <div className="card-panel">
          <div className="panel-header">
            <div className="panel-title">
              <TrendingUp className="text-primary" size={18} />
              Flujo de Recaudación Mensual (S/.)
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            {graficos?.ingresosMensuales && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graficos.ingresosMensuales}>
                  <XAxis dataKey="mes" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="ingresos" fill="#10b981" radius={[6, 6, 0, 0]} name="Recaudación" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Loan state distribution */}
        <div className="card-panel">
          <div className="panel-header">
            <div className="panel-title">
              <CheckCircle className="text-primary" size={18} />
              Estado General de Préstamos
            </div>
          </div>
          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {graficos?.estadoPrestamos && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={graficos.estadoPrestamos}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={4}
                  >
                    {graficos.estadoPrestamos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Urgent Overdue Table Section */}
      <div className="card-panel">
        <div className="panel-header">
          <div className="panel-title" style={{ color: '#ef4444' }}>
            <AlertTriangle size={20} />
            Alerta Inmediata: Cuotas Vencidas y en Mora ({cuotasVencidas.length})
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
                    <td>{c.fechaVencimiento}</td>
                    <td style={{ color: '#ef4444', fontWeight: 700 }}>S/. {parseFloat(c.montoCuota).toFixed(2)}</td>
                    <td>
                      <span className="badge badge-vencido">
                        <Clock size={12} />
                        {c.diasAtraso} días
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
