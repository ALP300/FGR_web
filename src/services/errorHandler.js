/**
 * Utilidad centralizada para mapeo, extracción y visualización amigable
 * de errores de validación de campos y errores de servidor / API.
 */

export const FIELD_LABELS = {
  dni: 'Documento DNI',
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  nombrecompleto: 'Nombre Completo',
  telefono: 'Teléfono Principal',
  direccion: 'Dirección Domiciliaria',
  fechanacimiento: 'Fecha de Nacimiento',
  correo: 'Correo Electrónico',
  email: 'Correo Electrónico',
  contactoemergencia: 'Contacto de Emergencia',
  observaciones: 'Observaciones',
  clienteid: 'Cliente',
  montodispersado: 'Monto a Desembolsar',
  tasainteres: 'Tasa de Interés',
  tipointeres: 'Tipo de Interés',
  modalidadpago: 'Modalidad de Pago',
  numerocuotas: 'Número de Cuotas',
  fechadesembolso: 'Fecha de Desembolso',
  fechaprimeropago: 'Fecha de Primer Pago',
  fechaprimerpago: 'Fecha de Primer Pago',
  prestamoid: 'Préstamo',
  cuotaid: 'Cuota',
  monto: 'Monto del Pago',
  metodopago: 'Método de Pago',
  numerooperacion: 'Número de Operación / Recibo',
  username: 'Usuario',
  nombreusuario: 'Nombre de Usuario',
  password: 'Contraseña',
  nombresapellidos: 'Nombres y Apellidos',
  rol: 'Rol de Usuario',
  estadocrediticio: 'Estado Crediticio',
  scorecrediticio: 'Score Crediticio',
  nuevomontodispersado: 'Nuevo Monto',
  prestamoidanterior: 'Préstamo a Refinanciar'
};

/**
 * Obtiene el nombre amigable en español para una propiedad o campo
 */
export function getFieldLabel(rawKey) {
  if (!rawKey) return 'Campo';
  // Limpiar prefijos comunes de ASP.NET Core como "$.", "dto.", "model."
  const cleanKey = rawKey.replace(/^\$\./, '').replace(/^dto\./i, '').replace(/^model\./i, '').trim();
  const normalized = cleanKey.toLowerCase().replace(/[^a-z0-9]/g, '');
  return FIELD_LABELS[normalized] || cleanKey;
}

/**
 * Extrae y formatea de forma exhaustiva todos los errores de un objeto AxiosError o Error
 * devolviendo el mensaje general, lista formateada y diccionario por campo.
 */
export function extractApiErrorDetails(err, defaultMsg = 'Ocurrió un error al procesar la solicitud.') {
  const result = {
    message: defaultMsg,
    fieldErrors: {},
    errorList: [],
    status: null,
    isAuthError: false,
    isTimeout: false,
    isNetworkError: false
  };

  if (!err) return result;

  // 1. Error de tiempo de espera (Timeout)
  if (err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout'))) {
    result.isTimeout = true;
    result.message = '⏱️ Tiempo de espera agotado (15s): El servidor backend no respondió a tiempo. Si está alojado en Render (plan gratuito), el contenedor puede estar saliendo de reposo (demora ~40s en el primer inicio).';
    result.errorList.push('El servidor no respondió dentro del límite de 15 segundos.');
    return result;
  }

  // 2. Error de Red / Servidor apagado
  if (err.message === 'Network Error' || (!err.response && !err.status)) {
    result.isNetworkError = true;
    result.message = '🌐 Error de Conexión: No se pudo establecer comunicación con el servidor backend. Verifica si el servicio está activo o si hay problemas de conexión a internet.';
    result.errorList.push('No se recibió respuesta del servidor.');
    return result;
  }

  const response = err.response;
  if (response) {
    result.status = response.status;
    const data = response.data;

    // 3. Error 401 - No Autorizado / Token JWT inválido o expirado
    if (response.status === 401) {
      result.isAuthError = true;
      result.message = '🔒 Error de Autenticación (401 No Autorizado): Tu sesión no está autorizada o el token JWT ha expirado. Por favor, cierra sesión e inicia sesión nuevamente con un usuario válido en el backend.';
      result.errorList.push('Acceso no autorizado: Se requiere un token JWT válido.');
      return result;
    }

    // 4. Error 403 - Prohibido
    if (response.status === 403) {
      result.message = '⛔ Acceso Restringido (403 Prohibido): Tu usuario no posee permisos suficientes para ejecutar esta operación.';
      result.errorList.push('Permisos insuficientes.');
      return result;
    }

    // 5. Error 404 - No Encontrado
    if (response.status === 404) {
      const msg = typeof data === 'string' ? data : (data?.mensaje || data?.title || 'El recurso solicitado no fue encontrado en el servidor (404).');
      result.message = `🔍 No encontrado (404): ${msg}`;
      result.errorList.push(msg);
      return result;
    }

    // 6. Validación con errores de campo (ASP.NET Core Validation Problem Details 400)
    if (data && typeof data === 'object') {
      if (data.errors && typeof data.errors === 'object') {
        Object.entries(data.errors).forEach(([fieldKey, messages]) => {
          const label = getFieldLabel(fieldKey);
          const rawKeyClean = fieldKey.replace(/^\$\./, '').replace(/^dto\./i, '');
          const normalizedKey = rawKeyClean.charAt(0).toLowerCase() + rawKeyClean.slice(1);

          const msgArray = Array.isArray(messages) ? messages : [messages];
          msgArray.forEach((msg) => {
            if (msg) {
              const formattedLine = `Campo "${label}": ${msg}`;
              result.errorList.push(formattedLine);
              if (!result.fieldErrors[normalizedKey]) {
                result.fieldErrors[normalizedKey] = msg;
              }
              // Mapeo adicional sin mayúsculas
              result.fieldErrors[normalizedKey.toLowerCase()] = msg;
            }
          });
        });

        if (result.errorList.length > 0) {
          result.message = `⚠️ Se encontraron errores en los siguientes campos:\n• ` + result.errorList.join('\n• ');
          return result;
        }
      }

      // Mensaje explícito devuelto por el backend en catch (new { mensaje = ex.Message })
      if (data.mensaje || data.message || data.title || data.detail) {
        const backendMsg = data.mensaje || data.message || data.detail || data.title;
        result.message = `⚠️ ${backendMsg}`;
        result.errorList.push(backendMsg);

        // Detectar si el mensaje menciona un campo específico para asociar el error visual
        const msgLower = backendMsg.toLowerCase();
        if (msgLower.includes('dni')) {
          result.fieldErrors['dni'] = backendMsg;
        } else if (msgLower.includes('correo') || msgLower.includes('email')) {
          result.fieldErrors['correo'] = backendMsg;
          result.fieldErrors['email'] = backendMsg;
        } else if (msgLower.includes('monto') || msgLower.includes('saldo')) {
          result.fieldErrors['monto'] = backendMsg;
          result.fieldErrors['montoDispersado'] = backendMsg;
          result.fieldErrors['nuevoMonto'] = backendMsg;
        } else if (msgLower.includes('cuota')) {
          result.fieldErrors['cuotaId'] = backendMsg;
          result.fieldErrors['numeroCuotas'] = backendMsg;
        } else if (msgLower.includes('cliente')) {
          result.fieldErrors['clienteId'] = backendMsg;
        } else if (msgLower.includes('usuario') || msgLower.includes('password') || msgLower.includes('contraseña')) {
          result.fieldErrors['username'] = backendMsg;
          result.fieldErrors['password'] = backendMsg;
        }
        return result;
      }
    }

    if (typeof data === 'string' && data.length > 0) {
      result.message = `⚠️ ${data}`;
      result.errorList.push(data);
      return result;
    }
  }

  // Si tiene mensaje estándar de JS Error
  if (err.message) {
    result.message = `⚠️ ${err.message}`;
    result.errorList.push(err.message);
    return result;
  }

  return result;
}
