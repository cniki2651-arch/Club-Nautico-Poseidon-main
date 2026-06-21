# Club Náutico Poseidón - Sistema Administrativo

Plataforma web desarrollada para automatizar los procesos internos y la atención al cliente del Club Náutico Poseidón del Perú.

## Tecnologías Utilizadas

* **Frontend:** React, TypeScript, Vite
* **Estilos:** Tailwind CSS, shadcn/ui
* **Iconos:** Lucide React
* **Enrutamiento:** React Router DOM
* **Backend:** Node.js, Express
* **Base de datos:** PostgreSQL (Supabase)

## Roles del Sistema (Demo)

El sistema cuenta con un panel administrativo protegido por roles:

1. **Secretaría:** Gestión de solicitudes, inscripciones y registro de consumos de servicios (cafetería, instrucción, anclaje, etc.).
2. **Jefatura:** Aprobaciones, retiros, gestión de usuarios y métricas generales.
3. **Naviero:** Control de flota, asignación de radas y permisos de zarpe.
4. **Finanzas:** Generación de facturación mensual (consolidando consumos registrados por Secretaría) y aprobación de fraccionamiento de deuda.
5. **Cobranza:** Gestión de morosidad, cálculo de intereses (Tasa SBS), registro de pagos y aplicación de bloqueo de zarpes a socios morosos.

## Instalación Local

1. Clonar el repositorio: `git clone [tu-link-de-github]`
2. Instalar dependencias: `npm install`
3. Ejecutar en desarrollo: `npm run dev`
