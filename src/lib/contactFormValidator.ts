
export interface ContactFormData {
  nombre: string;
  email: string;
  mensaje: string;
}

export interface ValidationResult {
  valido: boolean;
  errores: string[];
}

/**
 * Valida el formato de un correo electrónico.
 * CP-CN-CONT-01
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Valida todos los campos del formulario de contacto.
 * CP-CN-CONT-02
 */
export function validarFormularioContacto(datos: ContactFormData): ValidationResult {
  const errores: string[] = [];

  if (!datos.nombre || datos.nombre.trim().length < 2) {
    errores.push('El nombre es obligatorio y debe tener al menos 2 caracteres.');
  }

  if (!isValidEmail(datos.email)) {
    errores.push('El correo electrónico no tiene un formato válido.');
  }

  if (!datos.mensaje || datos.mensaje.trim().length < 10) {
    errores.push('El mensaje es obligatorio y debe tener al menos 10 caracteres.');
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}
