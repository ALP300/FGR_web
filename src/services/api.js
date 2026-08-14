import apiClient from './apiClient';

// --- HELPER WHATSAPP ---
export const getWhatsAppLink = (telefono, mensaje) => {
  if (!telefono) return null;
  const numLimpio = telefono.replace(/\D/g, '');
  const numFinal = numLimpio.length === 9 ? `51${numLimpio}` : numLimpio;
  return `https://wa.me/${numFinal}?text=${encodeURIComponent(mensaje)}`;
};

// --- AUTH API ---
export const authApi = {
  login: async (username, password) => {
    const res = await apiClient.post('/api/Auth/login', { username, password });
    if (res.data && res.data.token) {
      localStorage.setItem('fgr_token', res.data.token);
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await apiClient.post('/api/Auth/register', userData);
    return res.data;
  },

  me: async () => {
    const res = await apiClient.get('/api/Auth/me');
    return res.data;
  }
};

// --- CLIENTES API ---
export const clientesApi = {
  getClientes: async (busqueda = '', estado = '') => {
    const params = {};
    if (busqueda && busqueda.trim() !== '') {
      params.busqueda = busqueda.trim();
    }
    if (estado && estado.trim() !== '') {
      params.estado = estado.trim();
    }
    const res = await apiClient.get('/api/Clientes', { params });
    return res.data;
  },

  getClienteById: async (id) => {
    const res = await apiClient.get(`/api/Clientes/${id}`);
    return res.data;
  },

  createCliente: async (clienteData) => {
    const res = await apiClient.post('/api/Clientes', clienteData);
    return res.data;
  },

  updateCliente: async (id, clienteData) => {
    const res = await apiClient.put(`/api/Clientes/${id}`, clienteData);
    return res.data;
  },

  getHistorialCliente: async (id) => {
    const res = await apiClient.get(`/api/Clientes/${id}/historial`);
    return res.data;
  },

  patchEstadoCliente: async (id, nuevoEstado) => {
    const res = await apiClient.patch(`/api/Clientes/${id}/estado`, null, { params: { nuevoEstado } });
    return res.data;
  },

  patchScoreCrediticio: async (id, { estadoCrediticio, scoreCrediticio, motivo }) => {
    const res = await apiClient.patch(`/api/Clientes/${id}/score`, { estadoCrediticio, scoreCrediticio, motivo });
    return res.data;
  }
};

// --- PRESTAMOS API ---
export const prestamosApi = {
  simularPrestamo: async (simData) => {
    const res = await apiClient.post('/api/Prestamos/simular', simData);
    return res.data;
  },

  getPrestamos: async (clienteId = null, estado = '') => {
    const params = {};
    if (clienteId) params.clienteId = clienteId;
    if (estado && estado.trim() !== '') params.estado = estado.trim();
    const res = await apiClient.get('/api/Prestamos', { params });
    return res.data;
  },

  getPrestamoById: async (id) => {
    const res = await apiClient.get(`/api/Prestamos/${id}`);
    return res.data;
  },

  createPrestamo: async (prestamoData) => {
    const res = await apiClient.post('/api/Prestamos', prestamoData);
    return res.data;
  },

  refinanciarPrestamo: async (data) => {
    const res = await apiClient.post(`/api/Prestamos/${data.prestamoIdAnterior}/refinanciar`, data);
    return res.data;
  },

  cancelarPrestamo: async (id) => {
    const res = await apiClient.patch(`/api/Prestamos/${id}/cancelar`);
    return res.data;
  }
};

// --- CUOTAS & MORA API ---
export const cuotasApi = {
  getCuotasByPrestamo: async (prestamoId) => {
    const res = await apiClient.get(`/api/Cuotas/prestamo/${prestamoId}`);
    return res.data;
  },

  getCuotasVencidas: async () => {
    const res = await apiClient.get('/api/Cuotas/vencidas');
    return res.data;
  },

  getCuotasPorVencer: async (dias = 7) => {
    const res = await apiClient.get('/api/Cuotas/por-vencer', { params: { dias } });
    return res.data;
  },

  getAllCuotas: async () => {
    const res = await apiClient.get('/api/Cuotas');
    return res.data;
  }
};

// --- PAGOS API ---
export const pagosApi = {
  createPago: async (pagoData) => {
    const res = await apiClient.post('/api/Pagos', pagoData);
    return res.data;
  },

  getPagos: async (prestamoId = null, clienteId = null) => {
    const params = {};
    if (prestamoId) params.prestamoId = prestamoId;
    if (clienteId) params.clienteId = clienteId;
    const res = await apiClient.get('/api/Pagos', { params });
    return res.data;
  },

  getPagoById: async (id) => {
    const res = await apiClient.get(`/api/Pagos/${id}`);
    return res.data;
  }
};

// --- CAJA DIARIA API ---
export const cajaApi = {
  getEstadoCaja: async () => {
    const res = await apiClient.get('/api/Caja/estado');
    return res.data;
  },

  getMovimientos: async () => {
    const res = await apiClient.get('/api/Caja/movimientos');
    return res.data;
  },

  abrirCaja: async (montoInicial) => {
    const res = await apiClient.post('/api/Caja/apertura', { montoApertura: parseFloat(montoInicial || 0) });
    return res.data;
  },

  cerrarCaja: async () => {
    const res = await apiClient.post('/api/Caja/cierre');
    return res.data;
  },

  registrarMovimiento: async (data) => {
    const res = await apiClient.post('/api/Caja/movimiento', {
      ...data,
      monto: parseFloat(data.monto || 0)
    });
    return res.data;
  }
};

// --- AUDITORIA API ---
export const auditoriaApi = {
  getLogs: async () => {
    const res = await apiClient.get('/api/Auditoria');
    return res.data;
  },

  registrarLog: async (modulo, accion, detalle, tipo = 'info') => {
    const res = await apiClient.post('/api/Auditoria', { modulo, accion, detalle, tipo });
    return res.data;
  }
};

// --- DASHBOARD API ---
export const dashboardApi = {
  getKPIs: async (cobradorId = null) => {
    const url = cobradorId ? `/api/Dashboard/kpis?cobradorId=${cobradorId}` : '/api/Dashboard/kpis';
    const res = await apiClient.get(url);
    return res.data;
  },

  getGraficos: async (cobradorId = null) => {
    const url = cobradorId ? `/api/Dashboard/graficos?cobradorId=${cobradorId}` : '/api/Dashboard/graficos';
    const res = await apiClient.get(url);
    return res.data;
  }
};

// --- USUARIOS & COBRADORES API ---
export const usuariosApi = {
  getAll: async () => {
    const res = await apiClient.get('/api/Usuarios');
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/api/Usuarios/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await apiClient.post('/api/Usuarios', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/api/Usuarios/${id}`, data);
    return res.data;
  },

  toggleStatus: async (id) => {
    const res = await apiClient.patch(`/api/Usuarios/${id}/estado`);
    return res.data;
  }
};

// --- REPORTES API ---
export const reportesApi = {
  getDownloadUrl: (endpoint) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://appprestamosback-oficial.onrender.com';
    return `${baseUrl}/api/Reportes/${endpoint}`;
  },
  
  exportarSimulado: (nombreArchivo, datosJson) => {
    if (!datosJson || datosJson.length === 0) {
      console.warn('No hay datos para exportar en este reporte.');
      return false;
    }
    const headers = Object.keys(datosJson[0]).join(',');
    const rows = datosJson.map(obj => Object.values(obj).map(v => `"${v !== undefined && v !== null ? v : ''}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${nombreArchivo}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
