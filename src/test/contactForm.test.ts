import {
  isValidEmail,
  validarFormularioContacto,
  ContactFormData,
} from '../lib/contactFormValidator';

// =============================================================================
// CP-CN-CONT-01 — Validar formato de correo electrónico
// Estado: Aprobado
// =============================================================================
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

// =============================================================================
// CP-CN-CONT-02 (parte 1) — Validación de los datos del formulario
// Estado: Aprobado (la validación de campos sí funciona correctamente)
// =============================================================================
describe('CP-CN-CONT-02 — Validar datos del formulario de contacto', () => {
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


// CP-CN-CONT-02 (parte 2) — Envío del correo al cliente

describe('CP-CN-CONT-02 — Envío de correo al cliente (INCIDENCIA / Pendiente)', () => {
  const datosValidos: ContactFormData = {
    nombre: 'Juan Pérez',
    email: 'juan.perez@email.com',
    mensaje: 'Quisiera obtener más información sobre el club.',
  };

  // ---------------------------------------------------------------------
  // PARTE A — Evidencia objetiva: no existe ningún endpoint/servicio de envío
 
  // ---------------------------------------------------------------------
  describe('Evidencia: no existe implementación de envío de correo', () => {
    const fs = require('fs');
    const path = require('path');

    const CARPETAS_A_ESCANEAR = ['src/lib', 'lib', 'src/pages', 'pages', 'src/hooks', 'hooks'];
    const EXTENSIONES = ['.ts', '.tsx'];

    const PATRONES_ENVIO_CORREO =
      /nodemailer|resend|sendgrid|smtp|sendmail|send-email|sendemail|emailjs|mailgun|ses\.send|transporter\.sendmail/i;

    function listarArchivos(dir: string): string[] {
      if (!fs.existsSync(dir)) return [];
      const entradas = fs.readdirSync(dir, { withFileTypes: true });
      let archivos: string[] = [];
      for (const entrada of entradas) {
        const rutaCompleta = path.join(dir, entrada.name);
        if (entrada.isDirectory() && entrada.name !== 'node_modules') {
          archivos = archivos.concat(listarArchivos(rutaCompleta));
        } else if (EXTENSIONES.includes(path.extname(entrada.name))) {
          archivos.push(rutaCompleta);
        }
      }
      return archivos;
    }

    function buscarEvidenciaDeEnvio(): { archivo: string; linea: string }[] {
      const coincidencias: { archivo: string; linea: string }[] = [];
      const carpetasExistentes = CARPETAS_A_ESCANEAR
        .map((c) => path.resolve(process.cwd(), c))
        .filter((c) => fs.existsSync(c));

      const archivosUnicos = new Set<string>();
      for (const carpeta of carpetasExistentes) {
        listarArchivos(carpeta).forEach((a) => archivosUnicos.add(a));
      }

      for (const archivo of archivosUnicos) {
        const contenido = fs.readFileSync(archivo, 'utf-8');
        const lineas = contenido.split('\n');
        lineas.forEach((linea: string) => {
          if (PATRONES_ENVIO_CORREO.test(linea)) {
            coincidencias.push({ archivo, linea: linea.trim() });
          }
        });
      }
      return coincidencias;
    }

    test('no existe en lib/pages/hooks ninguna referencia a un proveedor o función de envío de correo', () => {
      const coincidencias = buscarEvidenciaDeEnvio();

     
      if (coincidencias.length > 0) {
        console.log('Coincidencias encontradas:', coincidencias);
      }
      expect(coincidencias).toEqual([]);
    });

    test('lib/apiClient.ts no expone ninguna función relacionada con el envío del formulario de contacto', () => {
      const rutaApiClient = path.resolve(process.cwd(), 'src/lib/apiClient.ts');
      const rutaApiClientAlt = path.resolve(process.cwd(), 'lib/apiClient.ts');
      const ruta = fs.existsSync(rutaApiClient) ? rutaApiClient : rutaApiClientAlt;

      expect(fs.existsSync(ruta)).toBe(true);

      const contenido: string = fs.readFileSync(ruta, 'utf-8');

      
      const tieneFuncionDeContacto = /contact[oa]?/i.test(contenido) &&
        /(send|enviar|post|submit)/i.test(contenido);

    
      expect(tieneFuncionDeContacto).toBe(false);
    });

    test('validarFormularioContacto no envía correos, solo valida datos (no debe tener efectos secundarios de red)', () => {
      const fetchSpy = jest.spyOn(global, 'fetch' as any).mockImplementation(() => {
        throw new Error('No debería llamarse a fetch desde el validador.');
      });

      expect(() => validarFormularioContacto(datosValidos)).not.toThrow();
      expect(fetchSpy).not.toHaveBeenCalled();

      fetchSpy.mockRestore();
    });
  });

  
  describe('Especificación esperada (a implementar)', () => {
    test.todo(
      'debe existir una función/endpoint que reciba ContactFormData válido y envíe el correo'
    );
    test.todo(
      'el correo enviado debe tener como remitente la cuenta empresarial y como destinatario el correo del cliente'
    );
    test.todo(
      'debe devolver { success: true } y un mensaje de confirmación cuando el envío sea exitoso'
    );
    test.todo(
      'debe devolver { success: false } y un mensaje de error claro si el proveedor de correo falla'
    );
    test.todo(
      'no debe aceptar datos inválidos: debe rechazar la solicitud si validarFormularioContacto retorna valido:false'
    );
  });
});
