// Mock Data real para el Sistema de Gestión de Préstamos y Cobranzas FGR

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
    telefono: "987654321",
    direccion: "Av. Las Flores 452, San Juan de Lurigancho",
    fechaNacimiento: "1988-05-14",
    correo: "juancarlos.gomez@gmail.com",
    contactoEmergencia: "María Gómez - 987112233",
    observaciones: "Cliente puntual con 3 préstamos liquidados previamente.",
    estado: "Activo",
    fechaRegistro: "2024-01-15"
  },
  {
    id: 2,
    dni: "10458796",
    nombres: "Ana María",
    apellidos: "Torres Huamán",
    telefono: "955443322",
    direccion: "Jr. Los Olivos 128, Los Olivos",
    fechaNacimiento: "1992-11-20",
    correo: "ana.torres@hotmail.com",
    contactoEmergencia: "Pedro Torres - 912345678",
    observaciones: "Negocio propio de abarrotes en mercado local.",
    estado: "Activo",
    fechaRegistro: "2024-02-10"
  },
  {
    id: 3,
    dni: "74125896",
    nombres: "Roberto",
    apellidos: "Castillo Ruiz",
    telefono: "912334455",
    direccion: "Calle San Martín 890, Surquillo",
    fechaNacimiento: "1985-03-08",
    correo: "rcastillo@empresa.pe",
    contactoEmergencia: "Lucía Castillo - 966554433",
    observaciones: "Tiene 1 cuota atrasada. Se envió recordatorio de pago.",
    estado: "Activo",
    fechaRegistro: "2024-03-01"
  },
  {
    id: 4,
    dni: "41526374",
    nombres: "Sofía Elena",
    apellidos: "Vargas Flores",
    telefono: "944887766",
    direccion: "Av. Arequipa 2450, Lince",
    fechaNacimiento: "1995-09-30",
    correo: "sofia.vargas@outlook.com",
    contactoEmergencia: "Elena Flores - 933221100",
    observaciones: "Préstamo cancelado a solicitud del cliente.",
    estado: "Inactivo",
    fechaRegistro: "2023-11-12"
  },
  {
    id: 5,
    dni: "78965412",
    nombres: "Miguel Ángel",
    apellidos: "Navarro Benítez",
    telefono: "977112244",
    direccion: "Urbanización El Sol Mz B Lote 4, Ate",
    fechaNacimiento: "1980-07-04",
    correo: "mnavarro@gmail.com",
    contactoEmergencia: "Jorge Navarro - 999887766",
    observaciones: "Transportista independiente. Pagos semanales.",
    estado: "Activo",
    fechaRegistro: "2024-04-05"
  }
];

export const INITIAL_PRESTAMOS = [
  {
    id: 101,
    clienteId: 1,
    clienteNombre: "Juan Carlos Gómez Pérez",
    montoDispersado: 2000,
    tasaInteres: 10, // 10%
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
    observaciones: "Aprobación pendiente de entrega de documentos."
  },
  {
    id: 103,
    clienteId: 3,
    clienteNombre: "Roberto Castillo Ruiz",
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
    observaciones: "Presenta mora en la 4ta cuota."
  },
  {
    id: 104,
    clienteId: 5,
    clienteNombre: "Miguel Ángel Navarro Benítez",
    montoDispersado: 1500,
    tasaInteres: 8,
    tipoInteres: "Diario",
    modalidadPago: "Diario",
    numeroCuotas: 15,
    montoCuota: 108,
    totalPagar: 1620,
    saldoPendiente: 0,
    fechaDesembolso: "2026-05-01",
    fechaPrimerPago: "2026-05-02",
    estado: "Pagado",
    observaciones: "Préstamo pagado en su totalidad a tiempo."
  }
];

export const INITIAL_CUOTAS = [
  // Cuotas Préstamo 101 (Juan Carlos - EnCurso)
  { id: 1001, prestamoId: 101, numeroCuota: 1, fechaVencimiento: "2026-07-21", montoCuota: 110, capital: 100, interes: 10, estado: "Pagado", diasAtraso: 0 },
  { id: 1002, prestamoId: 101, numeroCuota: 2, fechaVencimiento: "2026-07-22", montoCuota: 110, capital: 100, interes: 10, estado: "Pagado", diasAtraso: 0 },
  { id: 1003, prestamoId: 101, numeroCuota: 3, fechaVencimiento: "2026-07-23", montoCuota: 110, capital: 100, interes: 10, estado: "Pagado", diasAtraso: 0 },
  { id: 1004, prestamoId: 101, numeroCuota: 4, fechaVencimiento: "2026-07-24", montoCuota: 110, capital: 100, interes: 10, estado: "Pagado", diasAtraso: 0 },
  { id: 1005, prestamoId: 101, numeroCuota: 5, fechaVencimiento: "2026-07-25", montoCuota: 110, capital: 100, interes: 10, estado: "Pagado", diasAtraso: 0 },
  { id: 1006, prestamoId: 101, numeroCuota: 6, fechaVencimiento: "2026-07-26", montoCuota: 110, capital: 100, interes: 10, estado: "Pagado", diasAtraso: 0 },
  { id: 1007, prestamoId: 101, numeroCuota: 7, fechaVencimiento: "2026-07-27", montoCuota: 110, capital: 100, interes: 10, estado: "Pagado", diasAtraso: 0 },
  { id: 1008, prestamoId: 101, numeroCuota: 8, fechaVencimiento: "2026-07-28", montoCuota: 110, capital: 100, interes: 10, estado: "Pagado", diasAtraso: 0 },
  { id: 1009, prestamoId: 101, numeroCuota: 9, fechaVencimiento: "2026-07-29", montoCuota: 110, capital: 100, interes: 10, estado: "Pagado", diasAtraso: 0 },
  { id: 1010, prestamoId: 101, numeroCuota: 10, fechaVencimiento: "2026-07-30", montoCuota: 110, capital: 100, interes: 10, estado: "Pagado", diasAtraso: 0 },
  { id: 1011, prestamoId: 101, numeroCuota: 11, fechaVencimiento: "2026-07-31", montoCuota: 110, capital: 100, interes: 10, estado: "Pagado", diasAtraso: 0 },
  { id: 1012, prestamoId: 101, numeroCuota: 12, fechaVencimiento: "2026-08-01", montoCuota: 110, capital: 100, interes: 10, estado: "Pagado", diasAtraso: 0 },
  { id: 1013, prestamoId: 101, numeroCuota: 13, fechaVencimiento: "2026-08-12", montoCuota: 110, capital: 100, interes: 10, estado: "Pendiente", diasAtraso: 0 },
  { id: 1014, prestamoId: 101, numeroCuota: 14, fechaVencimiento: "2026-08-13", montoCuota: 110, capital: 100, interes: 10, estado: "Pendiente", diasAtraso: 0 },
  { id: 1015, prestamoId: 101, numeroCuota: 15, fechaVencimiento: "2026-08-14", montoCuota: 110, capital: 100, interes: 10, estado: "Pendiente", diasAtraso: 0 },
  
  // Cuotas Préstamo 103 (Roberto Castillo - Vencido)
  { id: 1031, prestamoId: 103, numeroCuota: 1, fechaVencimiento: "2026-06-17", montoCuota: 490, capital: 437.5, interes: 52.5, estado: "Pagado", diasAtraso: 0 },
  { id: 1032, prestamoId: 103, numeroCuota: 2, fechaVencimiento: "2026-06-24", montoCuota: 490, capital: 437.5, interes: 52.5, estado: "Pagado", diasAtraso: 0 },
  { id: 1033, prestamoId: 103, numeroCuota: 3, fechaVencimiento: "2026-07-01", montoCuota: 490, capital: 437.5, interes: 52.5, estado: "Pagado", diasAtraso: 0 },
  { id: 1034, prestamoId: 103, numeroCuota: 4, fechaVencimiento: "2026-07-08", montoCuota: 490, capital: 437.5, interes: 52.5, estado: "Vencido", diasAtraso: 35 },
  { id: 1035, prestamoId: 103, numeroCuota: 5, fechaVencimiento: "2026-07-15", montoCuota: 490, capital: 437.5, interes: 52.5, estado: "Vencido", diasAtraso: 28 },
  { id: 1036, prestamoId: 103, numeroCuota: 6, fechaVencimiento: "2026-07-22", montoCuota: 490, capital: 437.5, interes: 52.5, estado: "Vencido", diasAtraso: 21 },
  { id: 1037, prestamoId: 103, numeroCuota: 7, fechaVencimiento: "2026-07-29", montoCuota: 490, capital: 437.5, interes: 52.5, estado: "Vencido", diasAtraso: 14 },
  { id: 1038, prestamoId: 103, numeroCuota: 8, fechaVencimiento: "2026-08-05", montoCuota: 490, capital: 437.5, interes: 52.5, estado: "Vencido", diasAtraso: 7 }
];

export const INITIAL_PAGOS = [
  {
    id: 501,
    prestamoId: 101,
    cuotaId: 1012,
    clienteId: 1,
    clienteNombre: "Juan Carlos Gómez Pérez",
    monto: 110,
    metodoPago: "Efectivo",
    numeroOperacion: "REC-2026-0801",
    fechaPago: "2026-08-01 10:30:00",
    observaciones: "Pago presencial en ventanilla."
  },
  {
    id: 502,
    prestamoId: 101,
    cuotaId: 1011,
    clienteId: 1,
    clienteNombre: "Juan Carlos Gómez Pérez",
    monto: 110,
    metodoPago: "Yape",
    numeroOperacion: "YAP-887412",
    fechaPago: "2026-07-31 16:45:00",
    observaciones: "Transferencia Yape confirmada."
  },
  {
    id: 503,
    prestamoId: 103,
    cuotaId: 1033,
    clienteId: 3,
    clienteNombre: "Roberto Castillo Ruiz",
    monto: 490,
    metodoPago: "Transferencia",
    numeroOperacion: "BCP-00124875",
    fechaPago: "2026-07-01 11:20:00",
    observaciones: "Transferencia bancaria BCP."
  }
];

export const DASHBOARD_KPIS = {
  totalClientesActivos: 18,
  totalPrestamosActivos: 12,
  montoTotalDispersado: 45000.00,
  montoTotalCobrado: 31200.00,
  montoDineroPendiente: 13800.00,
  interesesGenerados: 5400.00,
  cuotasVencidasCount: 5,
  montoEnMora: 2450.00
};

export const DASHBOARD_GRAFICOS = {
  ingresosMensuales: [
    { mes: "Mar", ingresos: 4200, meta: 4000 },
    { mes: "Abr", ingresos: 5100, meta: 4500 },
    { mes: "May", ingresos: 6300, meta: 5000 },
    { mes: "Jun", ingresos: 5800, meta: 5500 },
    { mes: "Jul", ingresos: 7200, meta: 6000 },
    { mes: "Ago", ingresos: 2600, meta: 6500 }
  ],
  estadoPrestamos: [
    { name: "En Curso", value: 12, color: "#10b981" },
    { name: "Pendiente", value: 3, color: "#3b82f6" },
    { name: "Pagado", value: 25, color: "#6366f1" },
    { name: "Vencido", value: 4, color: "#ef4444" },
    { name: "Cancelado", value: 2, color: "#6b7280" }
  ],
  modalidadDistribucion: [
    { name: "Diario", porcentaje: 55 },
    { name: "Semanal", porcentaje: 25 },
    { name: "Quincenal", porcentaje: 12 },
    { name: "Mensual", porcentaje: 8 }
  ]
};
