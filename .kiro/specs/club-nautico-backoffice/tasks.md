# Plan de Implementación: Club Náutico Backoffice

## Visión General

Completar e integrar todos los módulos del BackOffice del Club Náutico Poseidón del Perú. El plan parte de la base existente (páginas con datos mock) y construye incrementalmente: primero los tipos y el store centralizado, luego la lógica de negocio pura con sus tests de propiedades, y finalmente cada módulo funcional conectado al estado global.

## Tareas

- [ ] 1. Instalar dependencias y definir tipos de dominio extendidos
  - Instalar `fast-check` como devDependency: `npm install --save-dev fast-check`
  - Reemplazar las interfaces de `src/data/mockData.ts` con los tipos extendidos definidos en el diseño: `Socio`, `Solicitud`, `Embarcacion`, `Rada`, `Tripulante`, `Zarpe`, `Cuota`, `Consumo`, `Pago`, `CuentaSocio`, `ConfiguracionSistema`, `AppState` y todos los tipos de unión (`CategoriaPago`, `EstadoFinanciero`, `EstadoMembresía`, `EstadoSolicitud`, `EstadoValidacion`, `EstadoRada`, `EstadoZarpe`, `TipoEmbarcacion`, `TipoServicio`, `TipoClase`)
  - Actualizar los datos mock existentes para que sean compatibles con los nuevos tipos (añadir campos faltantes como `nombres`, `apellidos`, `estadoMembresia`, `estadoFinanciero`, `tripulanteIds`, `embarcacionIds`, etc.)
  - _Requisitos: 1.1, 4.1, 7.1, 9.1, 12.1, 14.1, 15.4, 16.1_

- [ ] 2. Implementar lógica de negocio pura en `src/lib/businessRules.ts`
  - [ ] 2.1 Implementar funciones de validación
    - Crear `src/lib/businessRules.ts` con las funciones: `dniEsDuplicado`, `socioEsElegibleParaAprobacion`, `zarpeEsPermitido`
    - `dniEsDuplicado(dni, socios, solicitudes): boolean` — busca el DNI en ambas listas
    - `socioEsElegibleParaAprobacion(solicitud): boolean` — retorna `true` solo si `categoriaPago === "Pagador"`
    - `zarpeEsPermitido(socio, embarcacion, tripulantes): { permitido: boolean; motivo?: string }` — verifica estado financiero, validación de capitanía y autorización de tripulantes
    - _Requisitos: 1.2, 1.3, 3.2, 3.3, 5.3, 8.2, 10.2, 11.1, 11.2_

  - [ ]* 2.2 Escribir property test: Propiedad 1 — Detección de DNI duplicado es exhaustiva
    - **Propiedad 1: `dniEsDuplicado` retorna `true` si y solo si el DNI aparece en socios o solicitudes**
    - **Valida: Requisitos 1.2, 1.3**
    - Crear `src/test/businessRules.property.test.ts` con `fc.assert(fc.property(...))`, mínimo 100 iteraciones

  - [ ]* 2.3 Escribir property test: Propiedad 6 — Elegibilidad depende exclusivamente de la categoría
    - **Propiedad 6: `socioEsElegibleParaAprobacion` retorna `true` si y solo si `categoriaPago === "Pagador"`**
    - **Valida: Requisitos 3.2, 3.3**

  - [ ]* 2.4 Escribir property test: Propiedad 9 — Validación de zarpe es correcta para todas las combinaciones
    - **Propiedad 9: `zarpeEsPermitido` retorna `{ permitido: false }` si socio moroso, embarcación sin validar o tripulante no autorizado; `{ permitido: true }` solo si todas las condiciones son favorables**
    - **Valida: Requisitos 5.3, 8.2, 10.2, 11.1, 11.2**

  - [ ] 2.5 Implementar funciones de cálculo financiero
    - Añadir a `businessRules.ts`: `calcularMontoCuota(deudaTotal, numeroCuotas): number`, `calcularInteresesMoratorios(cuotas, tasaSBS, fechaActual): Map<string, number>`, `calcularTotalCuenta(cuenta): number`, `determinarEstadoFinanciero(cuotas, fechaActual): EstadoFinanciero`
    - _Requisitos: 15.3, 17.1, 16.3, 18.1_

  - [ ]* 2.6 Escribir property test: Propiedad 10 — El cálculo de cuotas es exacto
    - **Propiedad 10: `calcularMontoCuota(deuda, n) * n === deuda` para cualquier deuda positiva y `n` en `[2, 6]` (tolerancia ±0.01)**
    - **Valida: Requisito 15.3**

  - [ ]* 2.7 Escribir property test: Propiedad 11 — El cálculo de intereses moratorios es correcto
    - **Propiedad 11: Para cuota no pagada y vencida, el interés calculado es `cuota.monto * tasaSBS`**
    - **Valida: Requisito 17.1**

  - [ ]* 2.8 Escribir property test: Propiedad 12 — Determinación de estado financiero es consistente
    - **Propiedad 12: Si hay cuota vencida sin pagar → `"Moroso"`; si todas pagadas → `"Al día"`**
    - **Valida: Requisitos 16.3, 18.1**

- [ ] 3. Checkpoint — Verificar lógica de negocio
  - Ejecutar `npm test` y asegurar que todos los tests de `businessRules` pasen. Consultar al usuario si hay dudas sobre las reglas de negocio antes de continuar.

- [ ] 4. Crear `AppDataContext` con `useReducer` como store centralizado
  - [ ] 4.1 Crear `src/contexts/AppDataContext.tsx`
    - Definir el tipo `AppAction` con todas las acciones del diseño: `CREAR_SOLICITUD`, `VERIFICAR_SOLICITUD`, `APROBAR_SOLICITUD`, `RECHAZAR_SOLICITUD`, `REGISTRAR_EMBARCACION`, `VALIDAR_CAPITANIA`, `ASIGNAR_RADA`, `DESASIGNAR_RADA`, `REGISTRAR_TRIPULANTE`, `AUTORIZAR_TRIPULANTE`, `CREAR_ZARPE`, `REGISTRAR_CONSUMO`, `REGISTRAR_PAGO`, `FRACCIONAR_DEUDA`, `ACTUALIZAR_TASA_SBS`, `SOLICITAR_RETIRO`, `CONFIRMAR_BAJA`, `CALCULAR_INTERESES`
    - Implementar el reducer `appReducer(state: AppState, action: AppAction): AppState` con lógica atómica para cada acción (sin mutaciones parciales)
    - Crear `AppDataProvider` que inicializa el estado con los datos mock de `mockData.ts` y expone `state` y `dispatch` vía contexto
    - Exportar el hook `useAppData()` que retorna `{ state, dispatch }`
    - _Requisitos: 1.4, 2.3, 3.4, 3.5, 4.2, 5.1, 6.3, 6.4, 7.2, 8.1, 11.1, 11.3, 12.2, 15.4, 16.2, 16.3, 17.2, 18.1, 19.2, 20.4_

  - [ ]* 4.2 Escribir property test: Propiedad 2 — Nueva solicitud siempre inicia en estado "Pendiente" con ID único
    - **Propiedad 2: Después de `CREAR_SOLICITUD`, la solicitud tiene `estado = "Pendiente"` e `id` único**
    - **Valida: Requisito 1.4**

  - [ ]* 4.3 Escribir property test: Propiedad 4 — Verificar solicitud transiciona a "Verificado"
    - **Propiedad 4: Después de `VERIFICAR_SOLICITUD` sobre una solicitud "Pendiente", el estado es `"Verificado"` y `categoriaPago` coincide con el payload**
    - **Valida: Requisito 2.3**

  - [ ]* 4.4 Escribir property test: Propiedad 7 — Aprobar solicitud crea socio con estado correcto
    - **Propiedad 7: Después de `APROBAR_SOLICITUD` sobre solicitud "Verificado"/"Pagador", existe un nuevo `Socio` con `estadoFinanciero = "Al día"` y `estadoMembresia = "Activo"`**
    - **Valida: Requisito 3.4**

  - [ ]* 4.5 Escribir property test: Propiedad 8 — Rechazar solicitud registra estado y fecha
    - **Propiedad 8: Después de `RECHAZAR_SOLICITUD` con motivo no vacío, la solicitud tiene `estado = "Rechazado"` y `fechaRechazo` definida**
    - **Valida: Requisito 3.5**

  - [ ] 4.6 Conectar `AppDataProvider` en `App.tsx`
    - Envolver `AppLayout` con `AppDataProvider` dentro de `RoleProvider` en `App.tsx`
    - _Requisitos: 21.1, 21.2_

- [ ] 5. Crear `ProtectedRoute` y proteger rutas por rol
  - [ ] 5.1 Crear `src/components/ProtectedRoute.tsx`
    - Implementar `ProtectedRoute({ allowedRoles, children })` que lee el rol activo de `RoleContext` y renderiza `children` si el rol está en `allowedRoles`, o redirige a `/dashboard` si no
    - _Requisitos: 21.3_

  - [ ]* 5.2 Escribir property test: Propiedad 14 — Las rutas protegidas redirigen a roles no autorizados
    - **Propiedad 14: Para cualquier rol y ruta no permitida para ese rol, `ProtectedRoute` renderiza redirección**
    - **Valida: Requisito 21.3**

  - [ ] 5.3 Aplicar `ProtectedRoute` en `App.tsx`
    - Envolver cada `<Route>` del dashboard con `ProtectedRoute` y los `allowedRoles` correspondientes según el diseño
    - _Requisitos: 21.3_

- [ ] 6. Módulo de Secretaría — Solicitudes de inscripción
  - [ ] 6.1 Refactorizar `SecretariaView.tsx` para usar `AppDataContext`
    - Reemplazar el estado local de solicitudes por `state.solicitudes` del contexto
    - Conectar el formulario de nueva solicitud al dispatch `CREAR_SOLICITUD`, incluyendo validación de DNI duplicado con `dniEsDuplicado` (mostrar toast de error si duplicado, no guardar)
    - Validar que el DNI tenga exactamente 8 dígitos con mensaje inline
    - Mostrar la lista de solicitudes con todos los campos del tipo `Solicitud` extendido
    - _Requisitos: 1.1, 1.2, 1.3, 1.4_

  - [ ] 6.2 Añadir flujo de verificación de antecedentes en `SecretariaView.tsx`
    - Agregar acción en cada solicitud con `estado = "Pendiente"` para registrar la `CategoriaPago`
    - Conectar al dispatch `VERIFICAR_SOLICITUD` con la categoría seleccionada
    - Requerir que se seleccione categoría antes de permitir la verificación (deshabilitar botón si no hay selección)
    - _Requisitos: 2.1, 2.2, 2.3_

  - [ ] 6.3 Refactorizar `SociosPage.tsx` para usar `AppDataContext`
    - Reemplazar datos mock por `state.socios`
    - Conectar el formulario de nueva solicitud al dispatch `CREAR_SOLICITUD`
    - Asegurar que el filtro de búsqueda funcione sobre `nombre` y `dni` (case-insensitive)
    - _Requisitos: 1.5_

  - [ ]* 6.4 Escribir property test: Propiedad 3 — El filtro de búsqueda de socios es correcto y completo
    - **Propiedad 3: El resultado del filtro contiene exactamente los socios cuyo `nombre` o `dni` incluye la cadena de búsqueda (case-insensitive), sin falsos positivos ni falsos negativos**
    - **Valida: Requisito 1.5**

  - [ ] 6.5 Añadir flujo de solicitud de retiro en `SociosPage.tsx`
    - Agregar botón "Solicitar Retiro" en la fila de cada socio activo
    - Mostrar dialog con campo de motivo y conectar al dispatch `SOLICITAR_RETIRO`
    - Mostrar badge "En proceso de retiro" para socios con ese estado
    - _Requisitos: 19.1, 19.2, 19.3_

- [ ] 7. Módulo del Jefe — Aprobaciones y retiros
  - [ ] 7.1 Refactorizar `JefeView.tsx` para usar `AppDataContext`
    - Reemplazar estado local por `state.solicitudes` filtradas a `estado === "Verificado"` para la bandeja de aprobaciones
    - Conectar botón "Aprobar" al dispatch `APROBAR_SOLICITUD` (solo habilitado si `socioEsElegibleParaAprobacion` retorna `true`)
    - Mostrar badge de inelegibilidad y deshabilitar "Aprobar" para solicitudes con categoría "Esporádico" o "Renuente"
    - Conectar botón "Rechazar" al dispatch `RECHAZAR_SOLICITUD` con el motivo ingresado
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 7.2 Escribir property test: Propiedad 5 — La cola de aprobaciones solo muestra solicitudes "Verificado"
    - **Propiedad 5: El subconjunto filtrado para la bandeja del Jefe contiene única y exclusivamente solicitudes con `estado = "Verificado"`**
    - **Valida: Requisito 3.1**

  - [ ] 7.3 Refactorizar bandeja de retiros en `JefeView.tsx`
    - Reemplazar estado local por `state.socios` filtrados a `estadoMembresia === "En proceso de retiro"`
    - Mostrar saldo pendiente de `state.cuentas` para cada socio en retiro
    - Deshabilitar "Dar de Baja" si saldo > 0, habilitar si saldo === 0
    - Conectar "Dar de Baja" al dispatch `CONFIRMAR_BAJA`
    - _Requisitos: 20.1, 20.2, 20.3, 20.4_

- [ ] 8. Checkpoint — Verificar módulos de Secretaría y Jefe
  - Ejecutar `npm test` y asegurar que todos los tests pasen. Verificar manualmente el flujo completo: crear solicitud → verificar → aprobar → socio activo.

- [ ] 9. Módulo del Naviero — Embarcaciones, radas y tripulantes
  - [ ] 9.1 Refactorizar `EmbarcacionesPage.tsx` para usar `AppDataContext`
    - Reemplazar datos mock por `state.embarcaciones` y `state.radas`
    - Añadir formulario de registro de nueva embarcación con campos: nombre, tipo, eslora, socio propietario; conectar al dispatch `REGISTRAR_EMBARCACION`
    - Añadir botón "Validar Capitanía" en cada embarcación con `validacion === "Pendiente"`; conectar al dispatch `VALIDAR_CAPITANIA`
    - Mostrar badge visual diferenciado para "Validado" vs "Pendiente"
    - _Requisitos: 4.1, 4.2, 4.3, 5.1, 5.2_

  - [ ] 9.2 Implementar asignación de radas en `EmbarcacionesPage.tsx`
    - En el mapa de radas, añadir acción de asignar embarcación a rada disponible; conectar al dispatch `ASIGNAR_RADA`
    - Añadir acción de desasignar; conectar al dispatch `DESASIGNAR_RADA`
    - Mostrar solo radas "Disponible" en el selector de asignación
    - _Requisitos: 6.1, 6.2, 6.3, 6.4_

  - [ ] 9.3 Crear `src/components/FormularioTripulante.tsx`
    - Formulario con campos: nombre completo, documento, especialidad, embarcación(es) asignada(s)
    - Conectar al dispatch `REGISTRAR_TRIPULANTE`
    - Mostrar lista de tripulantes con su estado de autorización
    - Añadir botón "Autorizar" por tripulante; conectar al dispatch `AUTORIZAR_TRIPULANTE`
    - Integrar el componente en `EmbarcacionesPage.tsx` como nueva pestaña o sección
    - _Requisitos: 7.1, 7.2, 7.3, 8.1, 8.2, 8.3_

- [ ] 10. Módulo del Naviero — Zarpes
  - [ ] 10.1 Refactorizar `ZarpesPage.tsx` para usar `AppDataContext`
    - Reemplazar datos mock por `state.zarpes`, `state.socios`, `state.embarcaciones`, `state.tripulantes`
    - Al seleccionar socio, leer `estadoFinanciero` desde `state.socios` (no el campo `estado` del mock antiguo)
    - Filtrar embarcaciones del selector por `socioId === selectedSocio`
    - Validar con `zarpeEsPermitido` antes de habilitar el botón de confirmar; mostrar motivo específico de bloqueo si no está permitido
    - Conectar formulario al dispatch `CREAR_ZARPE` con `estado: "Aprobado"` si todas las condiciones se cumplen
    - _Requisitos: 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 11.1, 11.2, 11.3_

  - [ ] 10.2 Bloquear zarpes para socios en proceso de retiro
    - En el formulario de zarpe, verificar `estadoMembresia !== "En proceso de retiro"` antes de permitir el registro
    - Mostrar mensaje específico si el socio está en proceso de retiro
    - _Requisitos: 19.3_

- [ ] 11. Módulo de Finanzas — Facturación, consumos y pagos
  - [ ] 11.1 Refactorizar `FacturacionPage.tsx` para usar `AppDataContext`
    - Reemplazar datos mock por `state.cuentas` y `state.socios`
    - Añadir columna "Instrucción" en la tabla de cuentas
    - Mostrar `estadoFinanciero` desde el estado centralizado (se actualiza automáticamente con los pagos)
    - _Requisitos: 14.1, 14.2, 14.3, 18.3_

  - [ ] 11.2 Conectar formulario de consumos al dispatch
    - Conectar el formulario "Registrar Consumo" al dispatch `REGISTRAR_CONSUMO`
    - Añadir campo de tipo de clase (Natación/Buceo) y sesiones cuando el tipo de servicio es "Instrucción"
    - Bloquear registro de consumos para socios con `estadoMembresia === "En proceso de retiro"`
    - _Requisitos: 12.1, 12.2, 12.3, 13.1, 13.2, 13.3, 19.3_

  - [ ] 11.3 Conectar fraccionamiento de deuda al dispatch
    - Conectar el formulario "Fraccionar Deuda" al dispatch `FRACCIONAR_DEUDA`
    - Usar `calcularMontoCuota` para mostrar el monto por cuota antes de confirmar
    - Mostrar el plan de cuotas con fechas de vencimiento después de confirmar
    - _Requisitos: 15.1, 15.2, 15.3, 15.4_

  - [ ] 11.4 Crear `src/components/FormularioPago.tsx` e integrarlo en `FacturacionPage.tsx`
    - Formulario con campos: socio, monto, fecha, concepto
    - Conectar al dispatch `REGISTRAR_PAGO`
    - Mostrar historial de pagos por socio
    - _Requisitos: 16.1, 16.2, 16.3, 16.4_

  - [ ] 11.5 Crear `src/components/ConfiguracionTasaSBS.tsx` e integrarlo en `FacturacionPage.tsx`
    - Input numérico para configurar la tasa SBS vigente (porcentaje)
    - Conectar al dispatch `ACTUALIZAR_TASA_SBS`
    - Mostrar la tasa actual configurada
    - _Requisitos: 17.4_

  - [ ] 11.6 Implementar cálculo y acumulación de intereses moratorios
    - Añadir botón "Calcular Intereses" en `FacturacionPage.tsx` que dispara `CALCULAR_INTERESES`
    - El reducer debe usar `calcularInteresesMoratorios` para actualizar el campo `intereses` de cada `CuentaSocio`
    - Mostrar intereses acumulados diferenciados en la tabla de cuentas
    - _Requisitos: 17.1, 17.2, 17.3_

- [ ] 12. Control de acceso — Menú y sidebar
  - [ ] 12.1 Verificar que `AppSidebar.tsx` muestra exactamente las opciones del rol activo
    - Revisar que `menuByRole` en `AppSidebar.tsx` esté completo y correcto para los 4 roles
    - Asegurar que el cambio de rol en `RoleContext` actualiza el menú inmediatamente (ya funciona por reactividad de React)
    - _Requisitos: 21.1, 21.2_

  - [ ]* 12.2 Escribir property test: Propiedad 13 — El menú lateral muestra exactamente las opciones del rol activo
    - **Propiedad 13: Para cualquier rol válido, los ítems renderizados en `AppSidebar` corresponden exactamente a `menuByRole[rol]`**
    - **Valida: Requisito 21.1**

  - [ ] 12.3 Crear `src/components/AlertaMorosidad.tsx`
    - Componente reutilizable que recibe `socio: Socio` y renderiza un `Alert` destructivo si `estadoFinanciero === "Moroso"`, o un `Alert` de éxito si está al día
    - Usar en `ZarpesPage.tsx` y cualquier otro formulario que requiera verificar morosidad
    - _Requisitos: 10.1, 10.3, 18.3_

- [ ] 13. Checkpoint final — Integración completa
  - Ejecutar `npm test` y asegurar que todos los tests pasen.
  - Verificar que el estado financiero "Moroso" se refleja en todas las vistas (lista de socios, formulario de zarpe, tabla de facturación).
  - Consultar al usuario si hay ajustes finales antes de cerrar.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los tests de propiedades usan `fast-check` con mínimo 100 iteraciones (`{ numRuns: 100 }`)
- El archivo de property tests es `src/test/businessRules.property.test.ts`
- El reducer de `AppDataContext` debe ser atómico: ninguna acción deja el estado parcialmente mutado
- Los datos mock de `mockData.ts` sirven como estado inicial del contexto; no se eliminan, se extienden
