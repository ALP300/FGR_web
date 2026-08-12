import apiClient from './apiClient';
import {
  MOCK_USER,
  INITIAL_CLIENTES,
  INITIAL_PRESTAMOS,
  INITIAL_CUOTAS,
  INITIAL_PAGOS,
  DASHBOARD_KPIS,
  DASHBOARD_GRAFICOS
} from './mockData';

// Almacenamiento local en memoria para mantener cambios durante la sesión demo si no hay backend activo
let memoryClientes = [...INITIAL_CLIENTES];
let memoryPrestamos = [...INITIAL_PRESTAMOS];
let memoryCuotas = [...INITIAL_CUOTAS];
let memoryPagos = [...INITIAL_PAGOS];

// Variable global para forzar o alternar entre Backend Real y Modo Mock
export const API_CONFIG = {
  useMock: localStorage.getItem('fgr_use_mock') === 'true' || false,
  setUseMock: (val) => {
    API_CONFIG.useMock = val;
    localStorage.setItem('fgr_use_mock', val ? 'true' : 'false');
  }
};

// --- AUTH API ---
export const authApi = {
  login: async (username, password) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.post('/api/Auth/login', { username, password });
        if (res.data && res.data.token) {
          localStorage.setItem('fgr_token', res.data.token);
        }
        return res.data;
      } catch (err) {
        console.warn('API backend no disponible en /api/Auth/login, usando fallback mock.', err);
      }
    }
    // Fallback Mock
    const mockToken = "mock_jwt_token_fgr_" + Date.now();
    localStorage.setItem('fgr_token', mockToken);
    return { token: mockToken, user: MOCK_USER, message: "Inicio de sesión exitoso (Modo Demo)" };
  },

  register: async (userData) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.post('/api/Auth/register', userData);
        return res.data;
      } catch (err) {
        console.warn('API backend no disponible en /api/Auth/register, usando fallback mock.', err);
      }
    }
    return { message: "Usuario registrado correctamente en modo demo." };
  },

  me: async () => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.get('/api/Auth/me');
        return res.data;
      } catch (err) {
        console.warn('API backend no disponible en /api/Auth/me, usando fallback mock.', err);
      }
    }
    return MOCK_USER;
  }
};

// --- CLIENTES API ---
export const clientesApi = {
  getClientes: async (busqueda = '', estado = '') => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.get('/api/Clientes', { params: { busqueda, estado } });
        return res.data;
      } catch (err) {
        console.warn('API backend no disponible en /api/Clientes, usando fallback mock.');
      }
    }
    let list = [...memoryClientes];
    if (busqueda) {
      const q = busqueda.toLowerCase();
      list = list.filter(c => 
        c.nombres.toLowerCase().includes(q) || 
        c.apellidos.toLowerCase().includes(q) || 
        c.dni.includes(q)
      );
    }
    if (estado) {
      list = list.filter(c => c.estado === estado);
    }
    return list;
  },

  getClienteById: async (id) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.get(`/api/Clientes/${id}`);
        return res.data;
      } catch (err) {
        console.warn(`API backend no disponible en /api/Clientes/${id}, usando fallback mock.`);
      }
    }
    return memoryClientes.find(c => c.id === parseInt(id)) || null;
  },

  createCliente: async (clienteData) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.post('/api/Clientes', clienteData);
        return res.data;
      } catch (err) {
        console.warn('API backend no disponible en POST /api/Clientes, usando fallback mock.');
      }
    }
    const newCliente = {
      id: memoryClientes.length + 101,
      ...clienteData,
      estado: clienteData.estado || 'Activo',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    memoryClientes.unshift(newCliente);
    return newCliente;
  },

  updateCliente: async (id, clienteData) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.put(`/api/Clientes/${id}`, clienteData);
        return res.data;
      } catch (err) {
        console.warn(`API backend no disponible en PUT /api/Clientes/${id}, usando fallback mock.`);
      }
    }
    const idx = memoryClientes.findIndex(c => c.id === parseInt(id));
    if (idx !== -1) {
      memoryClientes[idx] = { ...memoryClientes[idx], ...clienteData };
      return memoryClientes[idx];
    }
    return null;
  },

  getHistorialCliente: async (id) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.get(`/api/Clientes/${id}/historial`);
        return res.data;
      } catch (err) {
        console.warn(`API backend no disponible en /api/Clientes/${id}/historial, usando fallback mock.`);
      }
    }
    const cid = parseInt(id);
    const prestamos = memoryPrestamos.filter(p => p.clienteId === cid);
    const pagos = memoryPagos.filter(pg => pg.clienteId === cid);
    return { clienteId: cid, prestamos, pagos };
  },

  patchEstadoCliente: async (id, nuevoEstado) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.patch(`/api/Clientes/${id}/estado`, null, { params: { nuevoEstado } });
        return res.data;
      } catch (err) {
        console.warn(`API backend no disponible en PATCH /api/Clientes/${id}/estado, usando fallback mock.`);
      }
    }
    const cliente = memoryClientes.find(c => c.id === parseInt(id));
    if (cliente) {
      cliente.estado = nuevoEstado;
      return cliente;
    }
    return null;
  }
};

// --- PRESTAMOS API ---
export const prestamosApi = {
  simularPrestamo: async (simData) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.post('/api/Prestamos/simular', simData);
        return res.data;
      } catch (err) {
        console.warn('API backend no disponible en /api/Prestamos/simular, usando fallback mock.');
      }
    }
    const { monto, tasaInteres, numeroCuotas, modalidadPago, fechaPrimerPago } = simData;
    const interesTotal = (parseFloat(monto) * (parseFloat(tasaInteres) / 100));
    const totalPagar = parseFloat(monto) + interesTotal;
    const montoCuota = (totalPagar / parseInt(numeroCuotas)).toFixed(2);
    
    // Generar cronograma simulado
    const cronograma = [];
    let fecha = new Date(fechaPrimerPago || Date.now());
    
    for (let i = 1; i <= parseInt(numeroCuotas); i++) {
      cronograma.push({
        numeroCuota: i,
        fechaVencimiento: fecha.toISOString().split('T')[0],
        montoCuota: parseFloat(montoCuota),
        capital: (parseFloat(monto) / parseInt(numeroCuotas)).toFixed(2),
        interes: (interesTotal / parseInt(numeroCuotas)).toFixed(2),
        estado: "Pendiente"
      });
      
      // Incrementar según modalidad
      if (modalidadPago === 'Diario') fecha.setDate(fecha.getDate() + 1);
      else if (modalidadPago === 'Semanal') fecha.setDate(fecha.getDate() + 7);
      else if (modalidadPago === 'Quincenal') fecha.setDate(fecha.getDate() + 15);
      else if (modalidadPago === 'Mensual') fecha.setMonth(fecha.getMonth() + 1);
      else fecha.setDate(fecha.getDate() + 1);
    }

    return {
      monto: parseFloat(monto),
      tasaInteres: parseFloat(tasaInteres),
      totalInteres: parseFloat(interesTotal.toFixed(2)),
      totalPagar: parseFloat(totalPagar.toFixed(2)),
      montoCuota: parseFloat(montoCuota),
      cronograma
    };
  },

  getPrestamos: async (clienteId = null, estado = '') => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.get('/api/Prestamos', { params: { clienteId, estado } });
        return res.data;
      } catch (err) {
        console.warn('API backend no disponible en /api/Prestamos, usando fallback mock.');
      }
    }
    let list = [...memoryPrestamos];
    if (clienteId) {
      list = list.filter(p => p.clienteId === parseInt(clienteId));
    }
    if (estado) {
      list = list.filter(p => p.estado === estado);
    }
    return list;
  },

  getPrestamoById: async (id) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.get(`/api/Prestamos/${id}`);
        return res.data;
      } catch (err) {
        console.warn(`API backend no disponible en /api/Prestamos/${id}, usando fallback mock.`);
      }
    }
    return memoryPrestamos.find(p => p.id === parseInt(id)) || null;
  },

  createPrestamo: async (prestamoData) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.post('/api/Prestamos', prestamoData);
        return res.data;
      } catch (err) {
        console.warn('API backend no disponible en POST /api/Prestamos, usando fallback mock.');
      }
    }
    const cliente = memoryClientes.find(c => c.id === parseInt(prestamoData.clienteId));
    const sim = await prestamosApi.simularPrestamo({
      monto: prestamoData.montoDispersado,
      tasaInteres: prestamoData.tasaInteres,
      numeroCuotas: prestamoData.numeroCuotas,
      modalidadPago: prestamoData.modalidadPago,
      fechaPrimerPago: prestamoData.fechaPrimerPago
    });

    const newId = memoryPrestamos.length + 201;
    const newPrestamo = {
      id: newId,
      clienteId: parseInt(prestamoData.clienteId),
      clienteNombre: cliente ? `${cliente.nombres} ${cliente.apellidos}` : 'Cliente #' + prestamoData.clienteId,
      montoDispersado: parseFloat(prestamoData.montoDispersado),
      tasaInteres: parseFloat(prestamoData.tasaInteres),
      tipoInteres: prestamoData.tipoInteres || 'Diario',
      modalidadPago: prestamoData.modalidadPago || 'Diario',
      numeroCuotas: parseInt(prestamoData.numeroCuotas),
      montoCuota: sim.montoCuota,
      totalPagar: sim.totalPagar,
      saldoPendiente: sim.totalPagar,
      fechaDesembolso: prestamoData.fechaDesembolso || new Date().toISOString().split('T')[0],
      fechaPrimerPago: prestamoData.fechaPrimerPago,
      estado: 'EnCurso',
      observaciones: prestamoData.observaciones || ''
    };

    // Crear cuotas correspondientes
    sim.cronograma.forEach((c, idx) => {
      memoryCuotas.push({
        id: newId * 100 + (idx + 1),
        prestamoId: newId,
        numeroCuota: c.numeroCuota,
        fechaVencimiento: c.fechaVencimiento,
        montoCuota: c.montoCuota,
        capital: c.capital,
        interes: c.interes,
        estado: 'Pendiente',
        diasAtraso: 0
      });
    });

    memoryPrestamos.unshift(newPrestamo);
    return newPrestamo;
  },

  cancelarPrestamo: async (id) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.patch(`/api/Prestamos/${id}/cancelar`);
        return res.data;
      } catch (err) {
        console.warn(`API backend no disponible en PATCH /api/Prestamos/${id}/cancelar, usando fallback mock.`);
      }
    }
    const prestamo = memoryPrestamos.find(p => p.id === parseInt(id));
    if (prestamo) {
      prestamo.estado = 'Cancelado';
      return prestamo;
    }
    return null;
  }
};

// --- CUOTAS API ---
export const cuotasApi = {
  getCuotasByPrestamo: async (prestamoId) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.get(`/api/Cuotas/prestamo/${prestamoId}`);
        return res.data;
      } catch (err) {
        console.warn(`API backend no disponible en /api/Cuotas/prestamo/${prestamoId}, usando fallback mock.`);
      }
    }
    return memoryCuotas.filter(c => c.prestamoId === parseInt(prestamoId));
  },

  getCuotasVencidas: async () => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.get('/api/Cuotas/vencidas');
        return res.data;
      } catch (err) {
        console.warn('API backend no disponible en /api/Cuotas/vencidas, usando fallback mock.');
      }
    }
    return memoryCuotas.filter(c => c.estado === 'Vencido');
  },

  getCuotasPorVencer: async (dias = 7) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.get('/api/Cuotas/por-vencer', { params: { dias } });
        return res.data;
      } catch (err) {
        console.warn('API backend no disponible en /api/Cuotas/por-vencer, usando fallback mock.');
      }
    }
    return memoryCuotas.filter(c => c.estado === 'Pendiente');
  }
};

// --- PAGOS API ---
export const pagosApi = {
  createPago: async (pagoData) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.post('/api/Pagos', pagoData);
        return res.data;
      } catch (err) {
        console.warn('API backend no disponible en POST /api/Pagos, usando fallback mock.');
      }
    }
    const prestamo = memoryPrestamos.find(p => p.id === parseInt(pagoData.prestamoId));
    const cuota = memoryCuotas.find(c => c.id === parseInt(pagoData.cuotaId));
    
    if (cuota) {
      cuota.estado = 'Pagado';
    }

    if (prestamo) {
      prestamo.saldoPendiente = Math.max(0, prestamo.saldoPendiente - parseFloat(pagoData.monto));
      if (prestamo.saldoPendiente === 0) {
        prestamo.estado = 'Pagado';
      }
    }

    const newPago = {
      id: memoryPagos.length + 601,
      prestamoId: parseInt(pagoData.prestamoId),
      cuotaId: parseInt(pagoData.cuotaId),
      clienteId: prestamo ? prestamo.clienteId : 1,
      clienteNombre: prestamo ? prestamo.clienteNombre : 'Cliente Generico',
      monto: parseFloat(pagoData.monto),
      metodoPago: pagoData.metodoPago || 'Efectivo',
      numeroOperacion: pagoData.numeroOperacion || `REC-${Date.now().toString().slice(-6)}`,
      fechaPago: new Date().toISOString().replace('T', ' ').slice(0, 19),
      observaciones: pagoData.observaciones || ''
    };

    memoryPagos.unshift(newPago);
    return newPago;
  },

  getPagos: async (prestamoId = null, clienteId = null) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.get('/api/Pagos', { params: { prestamoId, clienteId } });
        return res.data;
      } catch (err) {
        console.warn('API backend no disponible en /api/Pagos, usando fallback mock.');
      }
    }
    let list = [...memoryPagos];
    if (prestamoId) {
      list = list.filter(p => p.prestamoId === parseInt(prestamoId));
    }
    if (clienteId) {
      list = list.filter(p => p.clienteId === parseInt(clienteId));
    }
    return list;
  },

  getPagoById: async (id) => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.get(`/api/Pagos/${id}`);
        return res.data;
      } catch (err) {
        console.warn(`API backend no disponible en /api/Pagos/${id}, usando fallback mock.`);
      }
    }
    return memoryPagos.find(p => p.id === parseInt(id)) || null;
  }
};

// --- DASHBOARD API ---
export const dashboardApi = {
  getKPIs: async () => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.get('/api/Dashboard/kpis');
        return res.data;
      } catch (err) {
        console.warn('API backend no disponible en /api/Dashboard/kpis, usando fallback mock.');
      }
    }
    // Calcular métricas dinámicas basadas en memoria
    const totalClientesActivos = memoryClientes.filter(c => c.estado === 'Activo').length;
    const totalPrestamosActivos = memoryPrestamos.filter(p => p.estado === 'EnCurso').length;
    const montoTotalDispersado = memoryPrestamos.reduce((sum, p) => sum + p.montoDispersado, 0);
    const montoTotalCobrado = memoryPagos.reduce((sum, p) => sum + p.monto, 0);
    const montoDineroPendiente = memoryPrestamos.reduce((sum, p) => sum + p.saldoPendiente, 0);
    const cuotasVencidasCount = memoryCuotas.filter(c => c.estado === 'Vencido').length;

    return {
      ...DASHBOARD_KPIS,
      totalClientesActivos,
      totalPrestamosActivos,
      montoTotalDispersado,
      montoTotalCobrado,
      montoDineroPendiente,
      cuotasVencidasCount
    };
  },

  getGraficos: async () => {
    if (!API_CONFIG.useMock) {
      try {
        const res = await apiClient.get('/api/Dashboard/graficos');
        return res.data;
      } catch (err) {
        console.warn('API backend no disponible en /api/Dashboard/graficos, usando fallback mock.');
      }
    }
    return DASHBOARD_GRAFICOS;
  }
};

// --- REPORTES API ---
export const reportesApi = {
  getDownloadUrl: (endpoint) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}/api/Reportes/${endpoint}`;
  },
  
  exportarSimulado: (nombreArchivo, datosJson) => {
    // Generador CSV en frontend como fallback para descarga inmediata
    if (!datosJson || datosJson.length === 0) return;
    const headers = Object.keys(datosJson[0]).join(',');
    const rows = datosJson.map(obj => Object.values(obj).map(v => `"${v}"`).join(','));
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
