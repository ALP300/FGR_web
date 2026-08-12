// Mock Data real alineada exactamente con los DTOs de C# (DashboardKpisDto, ClienteResponseDto, PrestamoResponseDto, etc.)

export const MOCK_USER = {
  id: 1,
  nombreUsuario: "admin_fgr",
  email: "administracion@fgrprestamos.com",
  nombresApellidos: "Carlos Eduardo Mendoza",
  rol: "Admin"
};

export const INITIAL_CLIENTES = [
  {
    id: 1,
    dni: "47859214",
    nombres: "Juan Carlos",
    apellidos: "Gómez Pérez",
    nombreCompleto: "Juan Carlos Gómez Pérez",
    telefono: "987654321",
    direccion: "Av. Las Flores 452, San Juan de Lurigancho",
    fechaNacimiento: "1988-05-14",
    correo: "juancarlos.gomez@gmail.com",
    contactoEmergencia: "María Gómez - 987112233",
    observaciones: "Cliente puntual con préstamos previa y fielmente abonados.",
    estado: "Activo",
    fechaRegistro: "2024-01-15",
    totalPrestamos: 3,
    deudaTotal: 880.00
  },
  {
    id: 2,
    dni: "10458796",
    nombres: "Ana María",
    apellidos: "Torres Huamán",
    nombreCompleto: "Ana María Torres Huamán",
    telefono: "955443322",
    direccion: "Jr. Los Olivos 128, Los Olivos",
    fechaNacimiento: "1992-11-20",
    correo: "ana.torres@hotmail.com",
    contactoEmergencia: "Pedro Torres - 912345678",
    observaciones: "Negocio propio de bodega.",
    estado: "Activo",
    fechaRegistro: "2024-02-10",
    totalPrestamos: 1,
    deudaTotal: 5750.00
  },
  {
    id: 3,
    dni: "74125896",
    nombres: "Roberto",
    apellidos: "Castillo Ruiz",
    nombreCompleto: "Roberto Castillo Ruiz",
    telefono: "912334455",
    direccion: "Calle San Martín 890, Surquillo",
    fechaNacimiento: "1985-03-08",
    correo: "rcastillo@empresa.pe",
    contactoEmergencia: "Lucía Castillo - 966554433",
    observaciones: "Transporte independiente.",
    estado: "Activo",
    fechaRegistro: "2024-03-01",
    totalPrestamos: 1,
    deudaTotal: 2450.00
  },
  {
    id: 4,
    dni: "41526374",
    nombres: "Sofía Elena",
    apellidos: "Vargas Flores",
    nombreCompleto: "Sofía Elena Vargas Flores",
    telefono: "944887766",
    direccion: "Av. Arequipa 2450, Lince",
    fechaNacimiento: "1995-09-30",
    correo: "sofia.vargas@outlook.com",
    contactoEmergencia: "Elena Flores - 933221100",
    observaciones: "Inactivo a solicitud del cliente.",
    estado: "Inactivo",
    fechaRegistro: "2023-11-12",
    totalPrestamos: 0,
    deudaTotal: 0.00
  }
];

export const INITIAL_PRESTAMOS = [
  {
    id: 101,
    clienteId: 1,
    clienteNombre: "Juan Carlos Gómez Pérez",
    nombreCliente: "Juan Carlos Gómez Pérez",
    dniCliente: "47859214",
    montoDispersado: 2000,
    tasaInteres: 10,
    tipoInteres: "Diario",
    modalidadPago: "Diario",
    numeroCuotas: 20,
    montoCuota: 110,
    totalPagar: 2200,
    saldoPendiente: 880,
    fechaDesembolso: "2026-07-20",
    fechaPrimerPago: "2026-07-21",
    estado: "EnCurso",
    observaciones: "Préstamo de trabajo para mercadería."
  },
  {
    id: 102,
    clienteId: 2,
    clienteNombre: "Ana María Torres Huamán",
    nombreCliente: "Ana María Torres Huamán",
    dniCliente: "10458796",
    montoDispersado: 5000,
    tasaInteres: 15,
    tipoInteres: "Mensual",
    modalidadPago: "Quincenal",
    numeroCuotas: 6,
    montoCuota: 958.33,
    totalPagar: 5750,
    saldoPendiente: 5750,
    fechaDesembolso: "2026-08-01",
    fechaPrimerPago: "2026-08-15",
    estado: "Pendiente",
    observaciones: "Aprobación pendiente de documentación."
  },
  {
    id: 103,
    clienteId: 3,
    clienteNombre: "Roberto Castillo Ruiz",
    nombreCliente: "Roberto Castillo Ruiz",
    dniCliente: "74125896",
    montoDispersado: 3500,
    tasaInteres: 12,
    tipoInteres: "Diario",
    modalidadPago: "Semanal",
    numeroCuotas: 8,
    montoCuota: 490,
    totalPagar: 3920,
    saldoPendiente: 2450,
    fechaDesembolso: "2026-06-10",
    fechaPrimerPago: "2026-06-17",
    estado: "Vencido",
    observaciones: "Presenta mora en cuota 4."
  }
];

export const INITIAL_CUOTAS = [
  { id: 1001, prestamoId: 101, numeroCuota: 1, fechaVencimiento: "2026-07-21", montoCuota: 110, capital: 100, interes: 10, estado: "Pagado", diasAtraso: 0 },
  { id: 1002, prestamoId: 101, numeroCuota: 2, fechaVencimiento: "2026-07-22", montoCuota: 110, capital: 100, interes: 10, estado: "Pagado", diasAtraso: 0 },
  { id: 1003, prestamoId: 101, numeroCuota: 3, fechaVencimiento: "2026-07-23", montoCuota: 110, capital: 100, interes: 10, estado: "Pagado", diasAtraso: 0 },
  { id: 1013, prestamoId: 101, numeroCuota: 13, fechaVencimiento: "2026-08-12", montoCuota: 110, capital: 100, interes: 10, estado: "Pendiente", diasAtraso: 0 },
  { id: 1034, prestamoId: 103, numeroCuota: 4, fechaVencimiento: "2026-07-08", montoCuota: 490, capital: 437.5, interes: 52.5, estado: "Vencido", diasAtraso: 35 }
];

export const INITIAL_PAGOS = [
  {
    id: 501,
    prestamoId: 101,
    cuotaId: 1001,
    clienteId: 1,
    clienteNombre: "Juan Carlos Gómez Pérez",
    nombreCliente: "Juan Carlos Gómez Pérez",
    monto: 110,
    metodoPago: "Efectivo",
    numeroOperacion: "REC-2026-0801",
    fechaPago: "2026-08-01 10:30:00",
    observaciones: "Pago presencial en ventanilla."
  }
];

export const DASHBOARD_KPIS = {
  clientesActivos: 3,
  dineroPrestado: 10500.00,
  dineroRecuperado: 4500.00,
  montoPorCobrar: 6000.00,
  montoVencido: 490.00,
  pagosDelDiaMonto: 110.00,
  pagosDelDiaCantidad: 1
};

export const DASHBOARD_GRAFICOS = {
  prestamosPorMes: [
    { mes: "Marzo", anio: 2026, monto: 4200 },
    { mes: "Abril", anio: 2026, monto: 5100 },
    { mes: "Mayo", anio: 2026, monto: 6300 },
    { mes: "Junio", anio: 2026, monto: 5800 },
    { mes: "Julio", anio: 2026, monto: 7200 },
    { mes: "Agosto", anio: 2026, monto: 2600 }
  ],
  pagosPorMes: [
    { mes: "Marzo", anio: 2026, monto: 3800 },
    { mes: "Abril", anio: 2026, monto: 4900 },
    { mes: "Mayo", anio: 2026, monto: 5900 },
    { mes: "Junio", anio: 2026, monto: 5200 },
    { mes: "Julio", anio: 2026, monto: 6800 },
    { mes: "Agosto", anio: 2026, monto: 2100 }
  ],
  estadoPrestamos: [
    { name: "En Curso", value: 12, color: "#059669" },
    { name: "Pendiente", value: 3, color: "#2563eb" },
    { name: "Pagado", value: 25, color: "#7c3aed" },
    { name: "Vencido", value: 4, color: "#dc2626" },
    { name: "Cancelado", value: 2, color: "#64748b" }
  ]
};
