export interface Socio {
  id: string;
  nombre: string;
  dni: string;
  categoria: "Pagador" | "Esporádico" | "Renuente";
  estado: "Al día" | "Moroso";
  email: string;
  telefono: string;
  fechaIngreso: string;
}

export interface Embarcacion {
  id: string;
  nombre: string;
  propietario: string;
  socioId: string;
  validacion: "Validado" | "Pendiente";
  tripulacion: string[];
  tipo: string;
  eslora: string;
}

export interface Rada {
  id: string;
  codigo: string;
  estado: "Ocupado" | "Disponible" | "Mantenimiento";
  embarcacion?: string;
}

export interface Solicitud {
  id: string;
  nombre: string;
  dni: string;
  fecha: string;
  estado: "Pendiente" | "Aprobado" | "Rechazado";
}

export interface Zarpe {
  id: string;
  embarcacion: string;
  socio: string;
  socioId: string;
  fechaSalida: string;
  horaSalida: string;
  horaRetorno: string;
  destino: string;
  estado: "Aprobado" | "Pendiente" | "Rechazado";
}

export interface CuentaSocio {
  socioId: string;
  nombre: string;
  membresia: number;
  cafeteria: number;
  limpieza: number;
  cabotaje: number;
  intereses: number;
  total: number;
  estado: "Al día" | "Moroso";
}

export const socios: Socio[] = [
  { id: "S001", nombre: "Carlos Mendoza Rivera", dni: "45678912", categoria: "Pagador", estado: "Al día", email: "cmendoza@mail.com", telefono: "987654321", fechaIngreso: "2019-03-15" },
  { id: "S002", nombre: "María Elena Gutiérrez", dni: "32145698", categoria: "Pagador", estado: "Al día", email: "megutierrez@mail.com", telefono: "976543210", fechaIngreso: "2020-07-22" },
  { id: "S003", nombre: "Jorge Luis Paredes", dni: "78912345", categoria: "Esporádico", estado: "Moroso", email: "jlparedes@mail.com", telefono: "965432109", fechaIngreso: "2018-11-08" },
  { id: "S004", nombre: "Ana Patricia Vega", dni: "65432178", categoria: "Pagador", estado: "Al día", email: "apvega@mail.com", telefono: "954321098", fechaIngreso: "2021-01-30" },
  { id: "S005", nombre: "Roberto Sánchez Luna", dni: "12345678", categoria: "Renuente", estado: "Moroso", email: "rsanchez@mail.com", telefono: "943210987", fechaIngreso: "2017-05-12" },
  { id: "S006", nombre: "Lucía Fernanda Torres", dni: "87654321", categoria: "Pagador", estado: "Al día", email: "lftorres@mail.com", telefono: "932109876", fechaIngreso: "2022-09-04" },
  { id: "S007", nombre: "Fernando Díaz Castillo", dni: "23456789", categoria: "Esporádico", estado: "Moroso", email: "fdiaz@mail.com", telefono: "921098765", fechaIngreso: "2016-02-18" },
  { id: "S008", nombre: "Claudia Rojas Medina", dni: "34567891", categoria: "Pagador", estado: "Al día", email: "crojas@mail.com", telefono: "910987654", fechaIngreso: "2023-04-11" },
];

export const embarcaciones: Embarcacion[] = [
  { id: "E001", nombre: "Neptuno I", propietario: "Carlos Mendoza Rivera", socioId: "S001", validacion: "Validado", tripulacion: ["Juan Pérez", "Luis Gómez"], tipo: "Velero", eslora: "12m" },
  { id: "E002", nombre: "Mar Azul", propietario: "María Elena Gutiérrez", socioId: "S002", validacion: "Validado", tripulacion: ["Pedro Ruiz"], tipo: "Lancha", eslora: "8m" },
  { id: "E003", nombre: "Brisa Marina", propietario: "Jorge Luis Paredes", socioId: "S003", validacion: "Pendiente", tripulacion: ["Carlos Vera", "Miguel Ríos"], tipo: "Yate", eslora: "15m" },
  { id: "E004", nombre: "Delfín Dorado", propietario: "Ana Patricia Vega", socioId: "S004", validacion: "Validado", tripulacion: ["Andrés López"], tipo: "Velero", eslora: "10m" },
  { id: "E005", nombre: "Ola Libre", propietario: "Roberto Sánchez Luna", socioId: "S005", validacion: "Pendiente", tripulacion: ["David Morales", "Sergio Campos"], tipo: "Lancha", eslora: "7m" },
  { id: "E006", nombre: "Coral Sur", propietario: "Lucía Fernanda Torres", socioId: "S006", validacion: "Validado", tripulacion: ["Felipe Herrera"], tipo: "Catamarán", eslora: "14m" },
];

export const radas: Rada[] = [
  { id: "R01", codigo: "A-01", estado: "Ocupado", embarcacion: "Neptuno I" },
  { id: "R02", codigo: "A-02", estado: "Ocupado", embarcacion: "Mar Azul" },
  { id: "R03", codigo: "A-03", estado: "Disponible" },
  { id: "R04", codigo: "A-04", estado: "Ocupado", embarcacion: "Brisa Marina" },
  { id: "R05", codigo: "B-01", estado: "Disponible" },
  { id: "R06", codigo: "B-02", estado: "Mantenimiento" },
  { id: "R07", codigo: "B-03", estado: "Ocupado", embarcacion: "Delfín Dorado" },
  { id: "R08", codigo: "B-04", estado: "Disponible" },
  { id: "R09", codigo: "C-01", estado: "Ocupado", embarcacion: "Coral Sur" },
  { id: "R10", codigo: "C-02", estado: "Disponible" },
  { id: "R11", codigo: "C-03", estado: "Mantenimiento" },
  { id: "R12", codigo: "C-04", estado: "Ocupado", embarcacion: "Ola Libre" },
];

export const solicitudes: Solicitud[] = [
  { id: "SOL001", nombre: "Diego Armando Flores", dni: "45612378", fecha: "2024-12-01", estado: "Pendiente" },
  { id: "SOL002", nombre: "Patricia Morales Vega", dni: "78945612", fecha: "2024-11-28", estado: "Aprobado" },
  { id: "SOL003", nombre: "Enrique Castro Díaz", dni: "32178945", fecha: "2024-11-25", estado: "Rechazado" },
  { id: "SOL004", nombre: "Sofía Ramos Huerta", dni: "65478932", fecha: "2024-12-03", estado: "Pendiente" },
  { id: "SOL005", nombre: "Manuel Quispe Tacuri", dni: "91234567", fecha: "2024-12-05", estado: "Aprobado" },
];

export const zarpes: Zarpe[] = [
  { id: "Z001", embarcacion: "Neptuno I", socio: "Carlos Mendoza Rivera", socioId: "S001", fechaSalida: "2024-12-08", horaSalida: "07:00", horaRetorno: "18:00", destino: "Islas Palomino", estado: "Aprobado" },
  { id: "Z002", embarcacion: "Mar Azul", socio: "María Elena Gutiérrez", socioId: "S002", fechaSalida: "2024-12-08", horaSalida: "08:30", horaRetorno: "14:00", destino: "Pucusana", estado: "Aprobado" },
  { id: "Z003", embarcacion: "Delfín Dorado", socio: "Ana Patricia Vega", socioId: "S004", fechaSalida: "2024-12-08", horaSalida: "09:00", horaRetorno: "17:00", destino: "Ancón", estado: "Pendiente" },
];

export const cuentas: CuentaSocio[] = [
  { socioId: "S001", nombre: "Carlos Mendoza Rivera", membresia: 500, cafeteria: 120, limpieza: 80, cabotaje: 200, intereses: 0, total: 900, estado: "Al día" },
  { socioId: "S002", nombre: "María Elena Gutiérrez", membresia: 500, cafeteria: 45, limpieza: 80, cabotaje: 0, intereses: 0, total: 625, estado: "Al día" },
  { socioId: "S003", nombre: "Jorge Luis Paredes", membresia: 500, cafeteria: 230, limpieza: 120, cabotaje: 350, intereses: 180, total: 1380, estado: "Moroso" },
  { socioId: "S004", nombre: "Ana Patricia Vega", membresia: 500, cafeteria: 60, limpieza: 80, cabotaje: 150, intereses: 0, total: 790, estado: "Al día" },
  { socioId: "S005", nombre: "Roberto Sánchez Luna", membresia: 500, cafeteria: 310, limpieza: 160, cabotaje: 420, intereses: 350, total: 1740, estado: "Moroso" },
  { socioId: "S006", nombre: "Lucía Fernanda Torres", membresia: 500, cafeteria: 90, limpieza: 80, cabotaje: 100, intereses: 0, total: 770, estado: "Al día" },
  { socioId: "S007", nombre: "Fernando Díaz Castillo", membresia: 500, cafeteria: 175, limpieza: 120, cabotaje: 280, intereses: 220, total: 1295, estado: "Moroso" },
  { socioId: "S008", nombre: "Claudia Rojas Medina", membresia: 500, cafeteria: 30, limpieza: 80, cabotaje: 0, intereses: 0, total: 610, estado: "Al día" },
];
