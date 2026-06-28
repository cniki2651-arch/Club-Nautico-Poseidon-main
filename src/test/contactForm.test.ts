
import { isValidEmail, validarFormularioContacto, ContactFormData } from '../lib/contactFormValidator';


// CP-CN-CONT-01 Validación de formato de correo electrónico

describe('CP-CN-CONT-01 — Validar formato de correo electrónico', () => {

  
  test('debe devolver false para "correo-invalido"', () => {
    expect(isValidEmail('correo-invalido')).toBe(false);
  });

  test('debe devolver false para "usuario@"', () => {
    expect(isValidEmail('usuario@')).toBe(false);
  });

  test('debe devolver false para "usuario@dominio"', () => {
    expect(isValidEmail('usuario@dominio')).toBe(false);
  });

  test('debe devolver false para cadena vacía', () => {
    expect(isValidEmail('')).toBe(false);
  });

  test('debe devolver true para "socio@clubposeidon.com"', () => {
    expect(isValidEmail('socio@clubposeidon.com')).toBe(true);
  });


  test('debe devolver true para "contacto@club.nautico.pe"', () => {
    expect(isValidEmail('contacto@club.nautico.pe')).toBe(true);
  });
});


// CP-CN-CONT-02  Validación del formulario completo de contacto

describe('CP-CN-CONT-02 — Validar envío del formulario de contacto', () => {

  
  test('debe retornar valido:true con nombre, correo y mensaje correctos', () => {
    const datos: ContactFormData = {
      nombre: 'Juan Pérez',
      email: 'juan.perez@email.com',
      mensaje: 'Quisiera obtener más información sobre el club.',
    };
    const resultado = validarFormularioContacto(datos);
    expect(resultado.valido).toBe(true);
    expect(resultado.errores).toHaveLength(0);
  });

  
  test('debe retornar valido:false cuando el correo no tiene formato válido', () => {
    const datos: ContactFormData = {
      nombre: 'Juan Pérez',
      email: 'correo-invalido',
      mensaje: 'Quisiera obtener más información sobre el club.',
    };
    const resultado = validarFormularioContacto(datos);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.length).toBeGreaterThan(0);
  });

  
  test('debe retornar valido:false cuando el nombre está vacío', () => {
    const datos: ContactFormData = {
      nombre: '',
      email: 'juan@email.com',
      mensaje: 'Consulta sobre membresía del club.',
    };
    const resultado = validarFormularioContacto(datos);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain(
      'El nombre es obligatorio y debe tener al menos 2 caracteres.'
    );
  });

  
  test('debe retornar valido:false cuando el mensaje tiene menos de 10 caracteres', () => {
    const datos: ContactFormData = {
      nombre: 'Ana Torres',
      email: 'ana@email.com',
      mensaje: 'Hola',
    };
    const resultado = validarFormularioContacto(datos);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain(
      'El mensaje es obligatorio y debe tener al menos 10 caracteres.'
    );
  });

  
  test('debe retornar los 3 errores cuando el formulario está completamente vacío', () => {
    const datos: ContactFormData = { nombre: '', email: '', mensaje: '' };
    const resultado = validarFormularioContacto(datos);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toHaveLength(3);
  });
});
