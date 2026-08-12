import React from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Users, 
  Banknote, 
  Receipt, 
  AlertTriangle, 
  TrendingUp, 
  PieChart 
} from 'lucide-react';
import { reportesApi, clientesApi, prestamosApi, pagosApi, cuotasApi } from '../services/api';

export default function ReportesPage() {
  const handleExport = async (tipo, formato) => {
    try {
      let data = [];
      let filename = `Reporte_${tipo}`;

      if (tipo === 'clientes') {
        data = await clientesApi.getClientes();
        filename = 'Reporte_Clientes_FGR';
      } else if (tipo === 'prestamos') {
        data = await prestamosApi.getPrestamos();
        filename = 'Reporte_Prestamos_FGR';
      } else if (tipo === 'pagos') {
        data = await pagosApi.getPagos();
        filename = 'Reporte_Pagos_FGR';
      } else if (tipo === 'cuotas-vencidas') {
        data = await cuotasApi.getCuotasVencidas();
        filename = 'Reporte_Cuotas_Vencidas_FGR';
      } else if (tipo === 'cuotas-por-vencer') {
        data = await cuotasApi.getCuotasPorVencer(7);
        filename = 'Reporte_Cuotas_Por_Vencer_FGR';
      }

      reportesApi.exportarSimulado(filename, data);
    } catch (err) {
      alert('Error generando reporte.');
    }
  };

  const reportesConfig = [
    {
      id: 'clientes',
      title: 'Reporte Consolidado de Clientes',
      desc: 'Exportación de padrón con DNI, contacto, historial y estado crediticio.',
      icon: Users,
      color: '#3b82f6'
    },
    {
      id: 'prestamos',
      title: 'Reporte General de Préstamos',
      desc: 'Consolidado de capital entregado, cuotas, tasas e intereses proyectados.',
      icon: Banknote,
      color: '#10b981'
    },
    {
      id: 'pagos',
      title: 'Historial Transaccional de Pagos',
      desc: 'Detalle de caja, transferencias, Yape/Plin con números de operación.',
      icon: Receipt,
      color: '#8b5cf6'
    },
    {
      id: 'cuotas-vencidas',
      title: 'Reporte de Cuotas Vencidas & Mora',
      desc: 'Detalle de atrasos, días en mora y saldo vencido pendiente.',
      icon: AlertTriangle,
      color: '#ef4444'
    },
    {
      id: 'cuotas-por-vencer',
      title: 'Cronograma Próximo de Cobros',
      desc: 'Proyección de cobros a realizar en los próximos 7 días.',
      icon: TrendingUp,
      color: '#f59e0b'
    }
  ];

  return (
    <div className="content-body">
      <div className="card-panel">
        <div className="panel-header">
          <div className="panel-title">
            <FileSpreadsheet className="text-primary" size={22} />
            Centro de Reportes y Exportación de Datos
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Genere descargas instantáneas en formatos Excel, CSV o PDF para análisis contable, auditoría y control de cartera.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {reportesConfig.map((rep) => {
            const Icon = rep.icon;
            return (
              <div 
                key={rep.id} 
                className="kpi-card" 
                style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', padding: '1.5rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div className="kpi-icon" style={{ background: `${rep.color}20`, color: rep.color }}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{rep.title}</h3>
                  </div>
                </div>

                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                  {rep.desc}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: 'auto' }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ flex: 1 }}
                    onClick={() => handleExport(rep.id, 'excel')}
                  >
                    <FileSpreadsheet size={14} style={{ color: '#10b981' }} />
                    Excel (.xlsx)
                  </button>

                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ flex: 1 }}
                    onClick={() => handleExport(rep.id, 'csv')}
                  >
                    <Download size={14} style={{ color: '#3b82f6' }} />
                    CSV
                  </button>

                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ flex: 1 }}
                    onClick={() => handleExport(rep.id, 'pdf')}
                  >
                    <FileText size={14} style={{ color: '#ef4444' }} />
                    PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
