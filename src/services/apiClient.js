import axios from 'axios';

// URL base de la API backend configurada en .env o por defecto http://localhost:5000 (o la URL activa de ASP.NET Core)
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:5000') 
  : '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
});

// Interceptor para inyectar Token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fgr_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
