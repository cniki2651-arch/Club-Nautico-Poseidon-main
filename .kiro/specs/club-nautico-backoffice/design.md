# Diseño Técnico: Club Náutico Backoffice

## Visión General

El BackOffice del Club Náutico Poseidón del Perú es una SPA (Single Page Application) construida con React 18 + TypeScript + Vite. Centraliza la gestión administrativa de socios, embarcaciones, radas, zarpes y facturación mensual, con control de acceso basado en cuatro roles: Secretaria, Jefe, Naviero y Finanzas.

El sistema actualmente tiene páginas base funcionales con datos mock. El diseño técnico describe cómo completar e integrar todos los módulos para cumplir los 21 requisitos, manteniendo la arquitectura existente y extendiendo el estado local con un store centralizado basado en React Context + `useReducer`.

### Objetivos de diseño

- Completar la lógica de negocio faltante en cada módulo (validaciones, transiciones de estado, bloqueos).
- Centralizar el estado de la aplicación para que los cambios en un módulo se reflejen en otros (ej. morosidad bloquea zarpes).
- Mantener la coherencia visual con shadcn/ui y Tailwind CSS ya establecidos.
- Garantizar que el control de acceso por roles sea consistente en menú, rutas y acciones.

---

## Arquitectura

La aplicación sigue una arquitectura de capas dentro de la SPA:

```
┌─────────────────────────────────────────────────────────┐
│                     React Router v6                      │
│              (rutas protegidas por rol)                  │
├─────────────────────────────────────────────────────────┤
│                    Capa de Páginas                       │
│  SociosPage · EmbarcacionesPage · ZarpesPage            │
│  FacturacionPage · JefeView · SecretariaView            │
│  DashboardPage                                           │
├─────────────────────────────────────────────────────────┤
│               Capa de Contextos / Estado                 │
│  RoleContext · AppDataContext (nuevo)                    │
├─────────────────────────────────────────────────────────┤
│              Capa de Lógica de Negocio                   │
│  src/lib/businessRules.ts (funciones puras)             │
├─────────────────────────────────────────────────────────┤
│                  Capa de Datos Mock                      │
│  src/data/mockData.ts (estado inicial)                  │
└─────────────────────────────────────────────────────────┘
```

### Decisiones de arquitectura

1. **Estado centralizado con `AppDataContext`**: Se crea un nuevo contexto que contiene todos los datos de la aplicación (socios, solicitudes, embarcaciones, radas, zarpes, cuentas, tripulantes, cuotas) y un `dispatch` para mutarlos. Esto permite que cambios en facturación (pago de deuda) actualicen automáticamente el estado financiero visible en zarpes y socios.

2. **Lógica de negocio en funciones puras**: Las reglas de negocio (cálculo de intereses, validación de zarpe, transición de estados) se extraen a `src/lib/businessRules.ts` como funciones puras, facilitando las pruebas unitarias y de propiedades.

3. **Rutas protegidas por rol**: Se crea un componente `ProtectedRoute` que verifica el rol activo antes de renderizar una página, redirigiendo a `/dashboard` si el rol no tiene acceso.

4. **Sin backend**: Toda la persistencia es en memoria (estado React). Los datos mock en `mockData.ts` sirven como estado inicial del contexto.

---

## Componentes e Interfaces

### Árbol de componentes principal

```
App
└── RoleProvider
    └── AppDataProvider (nuevo)
        └── AppLayout
            ├── AppSidebar (menú filtrado por rol)
            ├── Header (selector de rol)
            └── <Outlet> / Routes
                ├── DashboardPage
                ├── SecretariaView       [Secretaria]
                │   ├── FormularioSolicitud
                │   └── TablaSolicitudes
                ├── SociosPage           [Secretaria]
                ├── JefeView             [Jefe]
                │   ├── BandejaAprobaciones
                │   └── BandejaRetiros
                ├── EmbarcacionesPage    [Naviero]
                │   ├── TablaEmbarcaciones
                │   ├── MapaRadas
                │   └── FormularioTripulante
                ├── ZarpesPage           [Naviero]
                │   ├── FormularioZarpe
                │   └── TablaZarpes
                └── FacturacionPage      [Finanzas]
                    ├── TablaFacturacion
                    ├── FormularioConsumo
                    ├── FormularioFraccionamiento
                    └── FormularioPago
```

### Nuevos componentes a crear

| Componente | Ubicación | Responsabilidad |
|---|---|---|
| `AppDataContext` | `src/contexts/AppDataContext.tsx` | Estado global de la app + dispatch |
| `ProtectedRoute` | `src/components/ProtectedRoute.tsx` | Guarda de rutas por rol |
| `FormularioTripulante` | `src/components/FormularioTripulante.tsx` | CRUD de tripulantes |
| `FormularioPago` | `src/components/FormularioPago.tsx` | Registro de pagos |
| `ConfiguracionTasaSBS` | `src/components/ConfiguracionTasaSBS.tsx` | Configurar tasa moratoria |
| `AlertaMorosidad` | `src/components/AlertaMorosidad.tsx` | Alerta visual reutilizable |

### Interfaces de componentes clave

```typescript
// ProtectedRoute
interface ProtectedRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

// AppDataContext dispatch actions
type AppAction =
  | { type: "CREAR_SOLICITUD"; payload: NuevaSolicitud }
  | { type: "VERIFICAR_SOLICITUD"; payload: { id: string; categoria: CategoriaPago } }
  | { type: "APROBAR_SOLICITUD"; payload: { id: string } }
  | { type: "RECHAZAR_SOLICITUD"; payload: { id: string; motivo: string } }
  | { type: "REGISTRAR_EMBARCACION"; payload: NuevaEmbarcacion }
  | { type: "VALIDAR_CAPITANIA"; payload: { id: string } }
  | { type: "ASIGNAR_RADA"; payload: { radaId: string; embarcacionId: string } }
  | { type: "DESASIGNAR_RADA"; payload: { radaId: string } }
  | { type: "REGISTRAR_TRIPULANTE"; payload: NuevoTripulante }
  | { type: "AUTORIZAR_TRIPULANTE"; payload: { id: string } }
  | { type: "CREAR_ZARPE"; payload: NuevoZarpe }
  | { type: "REGISTRAR_CONSUMO"; payload: NuevoConsumo }
  | { type: "REGISTRAR_PAGO"; payload: NuevoPago }
  | { type: "FRACCIONAR_DEUDA"; payload: { socioId: string; numeroCuotas: number } }
  | { type: "ACTUALIZAR_TASA_SBS"; payload: { tasa: number } }
  | { type: "SOLICITAR_RETIRO"; payload: { socioId: string; motivo: string } }
  | { type: "CONFIRMAR_BAJA"; payload: { socioId: string } }
  | { type: "CALCULAR_INTERESES" };
```

---

## Modelos de Datos

Los modelos extienden los tipos existentes en `mockData.ts` para soportar todos los requisitos.

### Tipos extendidos

```typescript
// Tipos de dominio
export type CategoriaPago = "Pagador" | "Esporádico" | "Renuente";
export type EstadoFinanciero = "Al día" | "Moroso";
export type EstadoMembresía =
  | "Activo"
  | "Inactivo"
  | "En proceso de retiro";
export type EstadoSolicitud =
  | "Pendiente"
  | "Verificado"
  | "Aprobado"
  | "Rechazado";
export type EstadoValidacion = "Validado" | "Pendiente";
export type EstadoRada = "Disponible" | "Ocupado" | "Mantenimiento";
export type EstadoZarpe = "Aprobado" | "Pendiente" | "Rechazado";
export type TipoEmbarcacion =
  | "Velero"
  | "Lancha"
  | "Yate"
  | "Catamarán"
  | "Otro";
export type TipoServicio =
  | "Cafetería"
  | "Limpieza"
  | "Cabotaje"
  | "Instrucción"
  | "Otros";
export type TipoClase = "Natación" | "Buceo";

// Socio (extendido)
export interface Socio {
  id: string;
  nombres: string;
  apellidos: string;
  nombre: string;           // nombres + apellidos (derivado)
  dni: string;              // 8 dígitos
  telefono: string;
  email: string;
  antecedentes: string;
  categoria: CategoriaPago;
  estadoFinanciero: EstadoFinanciero;
  estadoMembresia: EstadoMembresía;
  fechaIngreso: string;     // ISO date
  fechaBaja?: string;       // ISO date, solo si Inactivo
  motivoRetiro?: string;
  fechaSolicitudRetiro?: string;
}

// Solicitud de inscripción (extendida)
export interface Solicitud {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  antecedentes: string;
  categoriaPago?: CategoriaPago;
  estado: EstadoSolicitud;
  fechaSolicitud: string;
  fechaRechazo?: string;
  motivoRechazo?: string;
}

// Tripulante (nuevo)
export interface Tripulante {
  id: string;
  nombreCompleto: string;
  documento: string;
  especialidad: string;
  embarcacionIds: string[];
  autorizado: boolean;
}

// Embarcacion (extendida)
export interface Embarcacion {
  id: string;
  nombre: string;
  tipo: TipoEmbarcacion;
  eslora: number;           // metros
  socioId: string;
  propietario: string;      // derivado del socio
  validacion: EstadoValidacion;
  tripulanteIds: string[];
  radaId?: string;
}

// Rada (sin cambios)
export interface Rada {
  id: string;
  codigo: string;
  estado: EstadoRada;
  embarcacionId?: string;
  embarcacion?: string;     // nombre derivado
}

// Zarpe (extendido)
export interface Zarpe {
  id: string;
  socioId: string;
  socio: string;
  embarcacionId: string;
  embarcacion: string;
  fechaSalida: string;
  horaSalida: string;
  horaRetorno: string;
  destino: string;
  pasajeros: string[];
  estado: EstadoZarpe;
  fechaEmision?: string;
}

// Cuota de fraccionamiento (nuevo)
export interface Cuota {
  id: string;
  socioId: string;
  monto: number;
  fechaVencimiento: string;
  pagada: boolean;
  fechaPago?: string;
}

// Consumo registrado (nuevo)
export interface Consumo {
  id: string;
  socioId: string;
  tipo: TipoServicio;
  monto: number;
  descripcion?: string;
  fecha: string;
  // Para instrucción:
  tipoClase?: TipoClase;
  sesiones?: number;
}

// Pago registrado (nuevo)
export interface Pago {
  id: string;
  socioId: string;
  monto: number;
  fecha: string;
  concepto: string;
}

// Cuenta del socio (extendida)
export interface CuentaSocio {
  socioId: string;
  nombre: string;
  membresia: number;
  rada: number;
  cafeteria: number;
  limpieza: number;
  cabotaje: number;
  instruccion: number;
  intereses: number;
  total: number;
  estadoFinanciero: EstadoFinanciero;
  periodoFacturacion?: string;  // "YYYY-MM"
  fechaGeneracion?: string;
}

// Configuración del sistema (nuevo)
export interface ConfiguracionSistema {
  tasaSBS: number;          // porcentaje, ej: 0.025 = 2.5%
}

// Estado global de la aplicación
export interface AppState {
  socios: Socio[];
  solicitudes: Solicitud[];
  embarcaciones: Embarcacion[];
  radas: Rada[];
  tripulantes: Tripulante[];
  zarpes: Zarpe[];
  consumos: Consumo[];
  pagos: Pago[];
  cuotas: Cuota[];
  cuentas: CuentaSocio[];
  configuracion: ConfiguracionSistema;
}
```

### Reglas de negocio puras (`src/lib/businessRules.ts`)

```typescript
// Validaciones
export function dniEsDuplicado(
  dni: string,
  socios: Socio[],
  solicitudes: Solicitud[]
): boolean

export function socioEsElegibleParaAprobacion(
  solicitud: Solicitud
): boolean  // true solo si categoria === "Pagador"

export function zarpeEsPermitido(
  socio: Socio,
  embarcacion: Embarcacion,
  tripulantes: Tripulante[]
): { permitido: boolean; motivo?: string }

// Cálculos financieros
export function calcularInteresesMoratorios(
  cuotas: Cuota[],
  tasaSBS: number,
  fechaActual: Date
): Map<string, number>  // cuotaId -> interés calculado

export function calcularMontoCuota(
  deudaTotal: number,
  numeroCuotas: number
): number

export function calcularTotalCuenta(cuenta: CuentaSocio): number

// Transiciones de estado
export function determinarEstadoFinanciero(
  cuotas: Cuota[],
  fechaActual: Date
): EstadoFinanciero
```

---

## Propiedades de Corrección

*Una propiedad es una característica o comportamiento que debe ser verdadero en todas las ejecuciones válidas del sistema — esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de corrección verificables por máquinas.*

Las siguientes propiedades se derivan del análisis de los criterios de aceptación. Se implementarán con **Vitest** (ya instalado) usando la librería **fast-check** para property-based testing, con un mínimo de 100 iteraciones por propiedad.

---

### Propiedad 1: Detección de DNI duplicado es exhaustiva

*Para cualquier* DNI y cualquier combinación de listas de socios y solicitudes activas, la función `dniEsDuplicado(dni, socios, solicitudes)` retorna `true` si y solo si el DNI aparece en alguna de las dos listas.

**Valida: Requisitos 1.2, 1.3**

---

### Propiedad 2: Nueva solicitud siempre inicia en estado "Pendiente" con ID único

*Para cualquier* conjunto de datos válidos de solicitud (DNI no duplicado, campos obligatorios completos), después de ejecutar la acción `CREAR_SOLICITUD`, la solicitud resultante tiene `estado = "Pendiente"` y un `id` que no existía previamente en la lista de solicitudes.

**Valida: Requisitos 1.4**

---

### Propiedad 3: El filtro de búsqueda de socios es correcto y completo

*Para cualquier* cadena de búsqueda y cualquier lista de socios, el resultado del filtro contiene exactamente los socios cuyo `nombre` o `dni` incluye la cadena de búsqueda (sin importar mayúsculas/minúsculas), y no excluye ningún socio que sí coincida.

**Valida: Requisitos 1.5**

---

### Propiedad 4: Verificar solicitud transiciona a "Verificado"

*Para cualquier* solicitud con `estado = "Pendiente"` y cualquier `CategoriaPago` válida, después de ejecutar `VERIFICAR_SOLICITUD`, la solicitud tiene `estado = "Verificado"` y la `categoriaPago` registrada coincide con la ingresada.

**Valida: Requisitos 2.3**

---

### Propiedad 5: La cola de aprobaciones solo muestra solicitudes "Verificado"

*Para cualquier* lista de solicitudes con estados mixtos, el subconjunto filtrado para la cola de aprobaciones del Jefe contiene única y exclusivamente las solicitudes con `estado = "Verificado"`.

**Valida: Requisitos 3.1**

---

### Propiedad 6: Elegibilidad de aprobación depende exclusivamente de la categoría

*Para cualquier* solicitud, `socioEsElegibleParaAprobacion(solicitud)` retorna `true` si y solo si `solicitud.categoriaPago === "Pagador"`. Para cualquier otra categoría ("Esporádico" o "Renuente"), retorna `false`.

**Valida: Requisitos 3.2, 3.3**

---

### Propiedad 7: Aprobar solicitud crea socio con estado correcto

*Para cualquier* solicitud con `categoriaPago = "Pagador"` y `estado = "Verificado"`, después de ejecutar `APROBAR_SOLICITUD`, existe un nuevo `Socio` en el sistema con `estadoFinanciero = "Al día"` y `estadoMembresia = "Activo"`, y los datos del socio corresponden a los de la solicitud.

**Valida: Requisitos 3.4**

---

### Propiedad 8: Rechazar solicitud registra estado y fecha

*Para cualquier* solicitud y cualquier motivo de rechazo no vacío, después de ejecutar `RECHAZAR_SOLICITUD`, la solicitud tiene `estado = "Rechazado"` y `fechaRechazo` está definida.

**Valida: Requisitos 3.5**

---

### Propiedad 9: Validación de zarpe es correcta para todas las combinaciones de habilitación

*Para cualquier* combinación de socio, embarcación y tripulantes:
- Si `socio.estadoFinanciero = "Moroso"` → `zarpeEsPermitido` retorna `{ permitido: false }`.
- Si `embarcacion.validacion = "Pendiente"` → `zarpeEsPermitido` retorna `{ permitido: false }`.
- Si algún tripulante tiene `autorizado = false` → `zarpeEsPermitido` retorna `{ permitido: false }`.
- Si todas las condiciones son favorables (socio al día, embarcación validada, todos los tripulantes autorizados) → `zarpeEsPermitido` retorna `{ permitido: true }`.

**Valida: Requisitos 5.3, 8.2, 10.2, 11.1, 11.2**

---

### Propiedad 10: El cálculo de cuotas es exacto

*Para cualquier* deuda total positiva y cualquier número de cuotas `n` en el rango `[2, 6]`, `calcularMontoCuota(deuda, n) * n` es igual a `deuda` (con tolerancia de punto flotante de ±0.01).

**Valida: Requisitos 15.3**

---

### Propiedad 11: El cálculo de intereses moratorios es correcto

*Para cualquier* cuota no pagada cuya `fechaVencimiento` es anterior a la fecha actual, y cualquier `tasaSBS > 0`, `calcularInteresesMoratorios` retorna un interés igual a `cuota.monto * tasaSBS` para esa cuota.

**Valida: Requisitos 17.1**

---

### Propiedad 12: La determinación de estado financiero es consistente con las cuotas

*Para cualquier* lista de cuotas:
- Si al menos una cuota tiene `pagada = false` y `fechaVencimiento < fechaActual` → `determinarEstadoFinanciero` retorna `"Moroso"`.
- Si todas las cuotas tienen `pagada = true` → `determinarEstadoFinanciero` retorna `"Al día"`.

**Valida: Requisitos 16.3, 18.1**

---

### Propiedad 13: El menú lateral muestra exactamente las opciones del rol activo

*Para cualquier* rol válido (`Secretaria`, `Jefe`, `Naviero`, `Finanzas`), los ítems renderizados en el `AppSidebar` corresponden exactamente al conjunto `menuByRole[rol]`, sin ítems adicionales ni faltantes.

**Valida: Requisitos 21.1**

---

### Propiedad 14: Las rutas protegidas redirigen a roles no autorizados

*Para cualquier* rol y cualquier ruta que no esté en la lista de rutas permitidas para ese rol, el componente `ProtectedRoute` renderiza una redirección en lugar del contenido protegido.

**Valida: Requisitos 21.3**

---

## Manejo de Errores

### Errores de validación de formularios

| Situación | Comportamiento |
|---|---|
| DNI duplicado al crear solicitud | Toast de error + campo DNI marcado con error, no se guarda |
| Campos obligatorios vacíos | Validación HTML5 nativa + mensajes inline con `react-hook-form` |
| DNI con longitud != 8 dígitos | Mensaje inline: "El DNI debe tener exactamente 8 dígitos" |
| Monto negativo en consumo/pago | Campo rechazado con `min="0"` + mensaje inline |
| Número de cuotas fuera de rango [2-6] | Select limitado a opciones válidas |

### Errores de reglas de negocio

| Situación | Comportamiento |
|---|---|
| Zarpe con socio moroso | `Alert` destructivo visible + botón "Registrar Zarpe" deshabilitado |
| Zarpe con embarcación sin validar | Mensaje específico en el formulario: "Embarcación sin validación de Capitanía" |
| Zarpe con tripulante no autorizado | Mensaje específico: "Tripulante [nombre] no está autorizado" |
| Aprobación de solicitud no-Pagador | Botón "Aprobar" deshabilitado + badge de inelegibilidad |
| Baja de socio con deuda pendiente | Botón "Dar de Baja" deshabilitado + monto adeudado visible |
| Consumo/zarpe para socio en retiro | Acción bloqueada con mensaje: "Socio en proceso de retiro" |

### Errores de estado inconsistente

Dado que el sistema usa estado en memoria, no hay errores de red. Sin embargo, el reducer de `AppDataContext` debe ser defensivo:

- Acciones sobre IDs inexistentes son ignoradas silenciosamente (no lanzan excepciones).
- El estado nunca queda en un estado parcialmente mutado: cada acción del reducer es atómica.

### Feedback al usuario

Todos los mensajes de éxito y error se comunican mediante:
- **Toast (Sonner)**: para confirmaciones de acciones completadas.
- **Alert (shadcn/ui)**: para bloqueos persistentes visibles en el formulario.
- **Badge de estado**: para indicar el estado financiero/validación en tablas y fichas.

---

## Estrategia de Testing

### Enfoque dual

Se combinan pruebas de ejemplo (unit tests) con pruebas basadas en propiedades (property-based tests) para cobertura completa.

### Librería de property-based testing

Se usará **fast-check** (`npm install --save-dev fast-check`), compatible con Vitest y el entorno jsdom ya configurado.

### Pruebas de propiedades (property-based)

Cada propiedad del documento se implementa como un test con `fc.assert(fc.property(...))` con mínimo **100 iteraciones**.

Cada test lleva un comentario de trazabilidad:
```typescript
// Feature: club-nautico-backoffice, Propiedad 1: Detección de DNI duplicado es exhaustiva
```

Archivo de pruebas: `src/test/businessRules.property.test.ts`

```typescript
import fc from "fast-check";
import { describe, it, expect } from "vitest";
import {
  dniEsDuplicado,
  socioEsElegibleParaAprobacion,
  zarpeEsPermitido,
  calcularMontoCuota,
  calcularInteresesMoratorios,
  determinarEstadoFinanciero,
} from "@/lib/businessRules";

// Propiedad 1
it("dniEsDuplicado detecta duplicados correctamente", () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 8, maxLength: 8 }),
      fc.array(fc.record({ dni: fc.string() })),
      fc.array(fc.record({ dni: fc.string() })),
      (dni, socios, solicitudes) => {
        const resultado = dniEsDuplicado(dni, socios as any, solicitudes as any);
        const existeEnSocios = socios.some((s) => s.dni === dni);
        const existeEnSolicitudes = solicitudes.some((s) => s.dni === dni);
        return resultado === (existeEnSocios || existeEnSolicitudes);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Pruebas de ejemplo (unit tests)

Archivo: `src/test/businessRules.test.ts`

Cubren:
- Formulario de solicitud renderiza todos los campos requeridos (Req 1.1)
- Verificación sin categoría es rechazada (Req 2.2)
- Alerta de morosidad visible al seleccionar socio moroso (Req 10.1)
- Cambio de rol actualiza el menú inmediatamente (Req 21.2)

### Pruebas de integración de componentes

Archivo: `src/test/components.test.tsx`

Usando `@testing-library/react` (ya instalado):
- `ZarpesPage` con socio moroso: botón deshabilitado y alerta visible.
- `JefeView` con solicitud Renuente: botón Aprobar deshabilitado.
- `AppSidebar` con cada rol: solo muestra ítems del rol activo.
- `ProtectedRoute` con rol incorrecto: renderiza redirección.

### Cobertura objetivo

| Módulo | Tipo de test | Cobertura objetivo |
|---|---|---|
| `businessRules.ts` | Property + Unit | 100% de funciones |
| `AppDataContext` reducer | Unit | Todas las acciones |
| `ProtectedRoute` | Unit | Todos los roles × rutas |
| `AppSidebar` | Unit + Property | Todos los roles |
| `ZarpesPage` | Integration | Flujos de bloqueo |
| `JefeView` | Integration | Aprobación y rechazo |
| `FacturacionPage` | Integration | Fraccionamiento y pago |
