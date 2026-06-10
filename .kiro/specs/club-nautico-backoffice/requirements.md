# Documento de Requisitos

## Introducción

Sistema de gestión administrativa (BackOffice) para el Club Náutico Poseidón del Perú. El sistema centraliza el control de socios, embarcaciones, radas, zarpes y facturación mensual. El acceso está basado en roles: Secretaria, Jefe, Naviero y Finanzas. La aplicación es una SPA (Single Page Application) construida con React + TypeScript + Vite, usando componentes shadcn/ui y Tailwind CSS.

---

## Glosario

- **Sistema**: La aplicación BackOffice del Club Náutico Poseidón del Perú.
- **Secretaria**: Rol encargado del registro de solicitudes de inscripción y retiros.
- **Jefe**: Rol con autoridad para aprobar o rechazar membresías y liquidaciones.
- **Naviero**: Rol encargado de la gestión de embarcaciones, radas, tripulación y zarpes.
- **Finanzas**: Rol encargado de la facturación, pagos y control de morosidad.
- **Socio**: Persona natural admitida formalmente en el club con membresía activa.
- **Solicitante**: Persona que ha presentado una solicitud de inscripción aún no aprobada.
- **DNI**: Documento Nacional de Identidad peruano de 8 dígitos.
- **Categoría_Pago**: Clasificación del comportamiento de pago histórico de un solicitante: Pagador, Esporádico o Renuente.
- **Embarcacion**: Nave registrada en el sistema asociada a un Socio.
- **Rada**: Espacio físico de amarre dentro del club, identificado por un código único.
- **Tripulante**: Personal especializado autorizado para operar una Embarcacion.
- **Zarpe**: Permiso formal de salida de una Embarcacion desde el club.
- **Recibo_Mensual**: Documento consolidado de cobro mensual generado para cada Socio.
- **Cuota**: Fracción de una deuda dividida para pago diferido.
- **Tasa_SBS**: Tasa de interés moratorio publicada por la Superintendencia de Banca y Seguros del Perú.
- **Estado_Financiero**: Condición financiera de un Socio: "Al día" o "Moroso".
- **Liquidacion**: Proceso de cálculo y cancelación de deuda pendiente al momento del retiro de un Socio.

---

## Requisitos

---

### Requisito 1: Registro de Solicitud de Inscripción

**User Story:** Como Secretaria, quiero registrar la solicitud de inscripción de un nuevo candidato verificando que el DNI no esté duplicado, para iniciar el proceso de admisión de forma ordenada y sin duplicados.

#### Criterios de Aceptación

1. THE Sistema SHALL presentar un formulario de solicitud con los campos: nombres, apellidos, DNI (8 dígitos), teléfono, email y antecedentes en otros clubes.
2. WHEN la Secretaria envía una solicitud de inscripción, THE Sistema SHALL verificar que el DNI ingresado no exista previamente en el registro de Socios ni en el registro de Solicitudes activas.
3. IF el DNI ya existe en el sistema, THEN THE Sistema SHALL mostrar un mensaje de error indicando que el DNI ya se encuentra registrado y no permitir el guardado.
4. WHEN el DNI no está duplicado y todos los campos obligatorios están completos, THE Sistema SHALL guardar la solicitud con estado "Pendiente" y asignarle un identificador único.
5. THE Sistema SHALL permitir a la Secretaria buscar Socios existentes por nombre o DNI desde la vista de socios.

---

### Requisito 2: Verificación de Antecedentes de Pago

**User Story:** Como Secretaria, quiero registrar la validación del comportamiento de pago histórico de un Solicitante, para clasificarlo correctamente antes de que el Jefe tome una decisión.

#### Criterios de Aceptación

1. WHEN la Secretaria accede a una solicitud en estado "Pendiente", THE Sistema SHALL permitir registrar la Categoría_Pago del Solicitante seleccionando entre: Pagador, Esporádico o Renuente.
2. THE Sistema SHALL requerir que se seleccione una Categoría_Pago antes de marcar la verificación como completada.
3. WHEN la Categoría_Pago es registrada, THE Sistema SHALL actualizar el estado de la solicitud a "Verificado" y hacerla visible para el Jefe en la cola de aprobaciones.

---

### Requisito 3: Aprobación o Rechazo de Membresía

**User Story:** Como Jefe, quiero aprobar o rechazar solicitudes de membresía verificadas, para oficializar el ingreso de nuevos Socios al club.

#### Criterios de Aceptación

1. WHEN el Jefe accede a la cola de aprobaciones, THE Sistema SHALL mostrar únicamente las solicitudes con estado "Verificado".
2. WHILE una solicitud tiene Categoría_Pago igual a "Pagador", THE Sistema SHALL habilitar la acción de aprobación para esa solicitud.
3. IF la solicitud tiene Categoría_Pago "Esporádico" o "Renuente", THEN THE Sistema SHALL deshabilitar la acción de aprobación y mostrar el motivo de inelegibilidad.
4. WHEN el Jefe aprueba una solicitud con Categoría_Pago "Pagador", THE Sistema SHALL crear el registro de Socio con Estado_Financiero "Al día" y estado de membresía "Activo".
5. WHEN el Jefe rechaza una solicitud, THE Sistema SHALL actualizar el estado de la solicitud a "Rechazado" y registrar la fecha de rechazo.

---

### Requisito 4: Registro de Embarcación

**User Story:** Como Naviero, quiero registrar la ficha de una Embarcacion asociada a un Socio, para mantener el inventario de naves del club actualizado.

#### Criterios de Aceptación

1. THE Sistema SHALL presentar un formulario de registro de Embarcacion con los campos: nombre de la nave, tipo (Velero, Lancha, Yate, Catamarán u otro), eslora en metros, y Socio propietario.
2. WHEN el Naviero guarda una nueva Embarcacion, THE Sistema SHALL asociarla al Socio propietario seleccionado y asignarle estado de validación "Pendiente".
3. THE Sistema SHALL mostrar la lista de Embarcaciones con su propietario, tipo, eslora y estado de validación de Capitanía.

---

### Requisito 5: Validación de Capitanía

**User Story:** Como Naviero, quiero registrar la validación legal de una Embarcacion ante la Capitanía de Puerto, para garantizar que solo naves legalmente habilitadas operen desde el club.

#### Criterios de Aceptación

1. WHEN el Naviero registra la validación de Capitanía de una Embarcacion, THE Sistema SHALL actualizar el estado de validación de esa Embarcacion a "Validado".
2. THE Sistema SHALL mostrar visualmente la diferencia entre Embarcaciones con estado "Validado" y "Pendiente" en la lista de embarcaciones.
3. WHILE una Embarcacion tiene estado de validación "Pendiente", THE Sistema SHALL impedir la emisión de un Zarpe para esa Embarcacion.

---

### Requisito 6: Asignación de Rada

**User Story:** Como Naviero, quiero asignar una Rada disponible a una Embarcacion según sus características físicas, para optimizar el uso de los espacios de amarre del club.

#### Criterios de Aceptación

1. WHEN el Naviero solicita asignar una Rada, THE Sistema SHALL mostrar únicamente las Radas con estado "Disponible".
2. THE Sistema SHALL mostrar el mapa visual de Radas con código, estado (Disponible, Ocupado, Mantenimiento) y la Embarcacion asignada cuando corresponda.
3. WHEN el Naviero asigna una Rada a una Embarcacion, THE Sistema SHALL actualizar el estado de la Rada a "Ocupado" y registrar la Embarcacion asignada.
4. WHEN una Embarcacion es desasignada de una Rada, THE Sistema SHALL actualizar el estado de la Rada a "Disponible".

---

### Requisito 7: Registro de Tripulación

**User Story:** Como Naviero, quiero registrar al personal especializado que operará las naves de los Socios, para mantener un registro actualizado de Tripulantes habilitados.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir registrar Tripulantes con los campos: nombre completo, documento de identidad, especialidad y Embarcacion(es) a las que está asignado.
2. WHEN un Tripulante es registrado y asociado a una Embarcacion, THE Sistema SHALL incluirlo en la lista de tripulación de esa Embarcacion.
3. THE Sistema SHALL mostrar la tripulación asignada a cada Embarcacion en la ficha de la nave.

---

### Requisito 8: Autorización de Tripulantes

**User Story:** Como Naviero, quiero validar y autorizar a los Tripulantes registrados, para evitar bloqueos marítimos por personal no habilitado.

#### Criterios de Aceptación

1. WHEN el Naviero autoriza a un Tripulante, THE Sistema SHALL actualizar el estado del Tripulante a "Autorizado".
2. WHILE un Tripulante tiene estado distinto a "Autorizado", THE Sistema SHALL impedir que ese Tripulante sea incluido en un Zarpe activo.
3. THE Sistema SHALL mostrar visualmente el estado de autorización de cada Tripulante en la ficha de la Embarcacion.

---

### Requisito 9: Solicitud de Salida (Zarpe)

**User Story:** Como Naviero, quiero registrar el itinerario, fechas y pasajeros de una salida, para documentar formalmente cada Zarpe desde el club.

#### Criterios de Aceptación

1. THE Sistema SHALL presentar un formulario de Zarpe con los campos: Socio, Embarcacion, fecha de salida, hora de salida, hora de retorno estimada, destino y lista de pasajeros.
2. WHEN el Naviero selecciona un Socio en el formulario de Zarpe, THE Sistema SHALL mostrar visualmente si el Socio tiene Estado_Financiero "Moroso" o "Al día".
3. WHEN el Naviero selecciona una Embarcacion, THE Sistema SHALL filtrar y mostrar solo las Embarcaciones asociadas al Socio seleccionado.
4. THE Sistema SHALL mostrar la lista de Zarpes registrados con embarcación, socio, fecha, horarios, destino y estado.

---

### Requisito 10: Validación de Deuda para Zarpe

**User Story:** Como Sistema, quiero validar automáticamente si el Socio es "Moroso" al momento de registrar un Zarpe, para bloquear o permitir la salida de forma visual e inmediata.

#### Criterios de Aceptación

1. WHEN el Naviero selecciona un Socio con Estado_Financiero "Moroso" en el formulario de Zarpe, THE Sistema SHALL mostrar una alerta visual de bloqueo indicando que el Socio tiene deudas pendientes.
2. WHILE el Socio seleccionado tiene Estado_Financiero "Moroso", THE Sistema SHALL deshabilitar el botón de confirmación del Zarpe.
3. WHEN el Socio seleccionado tiene Estado_Financiero "Al día", THE Sistema SHALL mostrar una confirmación visual de habilitación para zarpar.

---

### Requisito 11: Emisión de Permiso de Zarpe

**User Story:** Como Naviero, quiero emitir el permiso formal de Zarpe con la tripulación y nave en regla, para autorizar oficialmente la salida de una Embarcacion.

#### Criterios de Aceptación

1. WHEN todos los campos del formulario de Zarpe están completos, el Socio está "Al día", la Embarcacion tiene validación "Validado" y la tripulación está "Autorizada", THE Sistema SHALL permitir confirmar y guardar el Zarpe con estado "Aprobado".
2. IF alguna condición de habilitación no se cumple (Socio Moroso, Embarcacion sin validar, Tripulante no autorizado), THEN THE Sistema SHALL mostrar el motivo específico del bloqueo y no permitir la emisión del permiso.
3. WHEN el Zarpe es emitido, THE Sistema SHALL registrar la fecha y hora de emisión del permiso.

---

### Requisito 12: Registro de Consumos Internos

**User Story:** Como personal del club, quiero registrar consumos de cafetería, limpieza y cabotaje al perfil individual del Socio, para que sean incluidos en su facturación mensual.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir registrar consumos con los campos: Socio, tipo de servicio (Cafetería, Limpieza, Cabotaje, Otros), monto en soles y descripción opcional.
2. WHEN un consumo es registrado, THE Sistema SHALL sumarlo al saldo pendiente del Socio en la categoría de servicio correspondiente.
3. THE Sistema SHALL mostrar el desglose de consumos por categoría (Cafetería, Limpieza, Cabotaje) en la cuenta del Socio.

---

### Requisito 13: Registro de Uso de Servicios de Instrucción

**User Story:** Como personal del club, quiero registrar el uso de clases de natación y buceo por parte de los Socios, para añadirlos a la facturación mensual correspondiente.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir registrar el uso de servicios de instrucción con los campos: Socio, tipo de clase (Natación, Buceo), fecha, cantidad de sesiones y monto total.
2. WHEN el uso de un servicio de instrucción es registrado, THE Sistema SHALL sumarlo al saldo pendiente del Socio como consumo adicional.
3. THE Sistema SHALL mostrar los servicios de instrucción registrados en el historial de consumos del Socio.

---

### Requisito 14: Generación de Facturación Mensual Unificada

**User Story:** Como Finanzas, quiero consolidar la membresía, uso de radas y consumos adicionales en un solo Recibo_Mensual por Socio, para simplificar el proceso de cobro.

#### Criterios de Aceptación

1. WHEN Finanzas genera la facturación mensual, THE Sistema SHALL consolidar en un Recibo_Mensual por Socio los conceptos: cuota de membresía, uso de Rada, consumos de cafetería, limpieza, cabotaje, instrucción e intereses moratorios acumulados.
2. THE Sistema SHALL mostrar el desglose de cada concepto y el total a pagar en el Recibo_Mensual.
3. THE Sistema SHALL mostrar la tabla de cuentas de todos los Socios con su desglose y Estado_Financiero actual.
4. WHEN el Recibo_Mensual es generado, THE Sistema SHALL registrar la fecha de generación y el período al que corresponde.

---

### Requisito 15: Fraccionamiento de Deuda

**User Story:** Como Finanzas, quiero fraccionar deudas de servicios adicionales de un Socio Moroso en cuotas, para facilitar la regularización de su situación financiera.

#### Criterios de Aceptación

1. WHILE un Socio tiene Estado_Financiero "Moroso", THE Sistema SHALL habilitar la opción de fraccionar su deuda total.
2. WHEN Finanzas solicita fraccionar una deuda, THE Sistema SHALL permitir seleccionar entre 2 y 6 Cuotas.
3. WHEN se confirma el fraccionamiento, THE Sistema SHALL calcular el monto de cada Cuota dividiendo la deuda total entre el número de Cuotas seleccionado y mostrar el resultado antes de confirmar.
4. THE Sistema SHALL registrar el plan de fraccionamiento con las fechas de vencimiento de cada Cuota.

---

### Requisito 16: Registro de Pagos

**User Story:** Como Finanzas, quiero registrar los pagos recibidos de los Socios en el sistema, para actualizar su Estado_Financiero de forma inmediata.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir registrar un pago con los campos: Socio, monto pagado en soles, fecha de pago y concepto (membresía, cuota fraccionada, consumo, etc.).
2. WHEN un pago es registrado, THE Sistema SHALL descontar el monto del saldo pendiente del Socio en el concepto correspondiente.
3. WHEN el saldo pendiente total del Socio llega a cero, THE Sistema SHALL actualizar automáticamente el Estado_Financiero del Socio a "Al día".
4. THE Sistema SHALL mostrar el historial de pagos registrados por Socio.

---

### Requisito 17: Cálculo de Intereses Moratorios

**User Story:** Como Sistema, quiero calcular el interés moratorio sobre las Cuotas vencidas usando la Tasa_SBS, para penalizar los impagos conforme a la normativa vigente.

#### Criterios de Aceptación

1. WHEN una Cuota supera su fecha de vencimiento sin haber sido pagada, THE Sistema SHALL calcular el interés moratorio aplicando la Tasa_SBS vigente sobre el monto de la Cuota vencida.
2. THE Sistema SHALL acumular los intereses moratorios calculados en el campo de intereses del saldo del Socio.
3. THE Sistema SHALL mostrar el monto de intereses acumulados de forma diferenciada en la cuenta del Socio.
4. THE Sistema SHALL permitir configurar la Tasa_SBS vigente desde el módulo de Finanzas.

---

### Requisito 18: Bloqueo Automático de Servicios por Morosidad

**User Story:** Como Sistema, quiero cambiar el Estado_Financiero del Socio a "Moroso" de forma automática al detectar impagos, para restringir sus privilegios sin intervención manual.

#### Criterios de Aceptación

1. WHEN un Socio tiene una o más Cuotas vencidas sin pagar, THE Sistema SHALL actualizar automáticamente su Estado_Financiero a "Moroso".
2. WHILE el Socio tiene Estado_Financiero "Moroso", THE Sistema SHALL bloquear la emisión de nuevos Zarpes para ese Socio.
3. THE Sistema SHALL mostrar visualmente el Estado_Financiero "Moroso" en todas las vistas donde aparezca el Socio (lista de socios, formulario de zarpe, cuenta de facturación).

---

### Requisito 19: Solicitud de Retiro de Socio

**User Story:** Como Secretaria, quiero registrar la intención de salida formal de un Socio, para iniciar el proceso administrativo de baja.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir a la Secretaria registrar una solicitud de retiro para un Socio activo, indicando la fecha de solicitud y el motivo.
2. WHEN la solicitud de retiro es registrada, THE Sistema SHALL cambiar el estado del Socio a "En proceso de retiro" y notificar al Jefe para revisión.
3. WHILE un Socio tiene estado "En proceso de retiro", THE Sistema SHALL impedir el registro de nuevos consumos o zarpes para ese Socio.

---

### Requisito 20: Liquidación y Baja Administrativa

**User Story:** Como Jefe, quiero revisar la Liquidacion de deuda pendiente de un Socio en proceso de retiro y dar de baja al Socio solo si su saldo es cero, para garantizar que el club no tenga pérdidas por retiros con deuda.

#### Criterios de Aceptación

1. WHEN el Jefe accede a la solicitud de retiro de un Socio, THE Sistema SHALL mostrar el resumen de Liquidacion con el saldo total pendiente del Socio.
2. WHILE el saldo pendiente del Socio es mayor a cero, THE Sistema SHALL deshabilitar la acción de dar de baja y mostrar el monto adeudado.
3. WHEN el saldo pendiente del Socio es igual a cero, THE Sistema SHALL habilitar la acción de dar de baja definitiva.
4. WHEN el Jefe confirma la baja definitiva, THE Sistema SHALL actualizar el estado del Socio a "Inactivo", liberar la Rada asignada a sus Embarcaciones y registrar la fecha de baja.

---

### Requisito 21: Control de Acceso Basado en Roles

**User Story:** Como administrador del sistema, quiero que cada rol (Secretaria, Jefe, Naviero, Finanzas) acceda únicamente a las funcionalidades que le corresponden, para garantizar la seguridad y segregación de responsabilidades.

#### Criterios de Aceptación

1. THE Sistema SHALL mostrar en el menú lateral únicamente las opciones de navegación correspondientes al rol activo del usuario.
2. WHEN el usuario cambia de rol en la sesión, THE Sistema SHALL actualizar inmediatamente el menú lateral y las vistas disponibles para reflejar el nuevo rol.
3. THE Sistema SHALL restringir el acceso a las rutas de cada módulo según el rol activo, redirigiendo al usuario si intenta acceder a una ruta no autorizada.
4. THE Sistema SHALL permitir al usuario seleccionar su rol activo desde la interfaz principal del BackOffice.
