import React, { createContext, useContext, useReducer } from "react";
import {
  socios as initSocios,
  embarcaciones as initEmbarcaciones,
  radas as initRadas,
  zarpes as initZarpes,
  solicitudes as initSolicitudes,
  cuentas as initCuentas,
  type Socio,
  type Embarcacion,
  type Rada,
  type Zarpe,
  type Solicitud,
  type CuentaSocio,
} from "@/data/mockData";

// ── Tipos extendidos ────────────────────────────────────────────────────────

export interface Tripulante {
  id: string;
  nombre: string;
  especialidad: string;
  embarcacionId: string;
  estado: "Pendiente" | "Autorizado";
}

export type TipoServicio = "Cafetería" | "Limpieza" | "Cabotaje" | "Instrucción";

// ── Estado global ───────────────────────────────────────────────────────────

export interface AppState {
  socios: Socio[];
  embarcaciones: Embarcacion[];
  radas: Rada[];
  zarpes: Zarpe[];
  solicitudes: Solicitud[];
  cuentas: CuentaSocio[];
  tripulantes: Tripulante[];
  tasaSBS: number; // porcentaje mensual, ej: 1.5
}

const initialState: AppState = {
  socios: initSocios,
  embarcaciones: initEmbarcaciones,
  radas: initRadas,
  zarpes: initZarpes,
  solicitudes: initSolicitudes,
  cuentas: initCuentas,
  tripulantes: [],
  tasaSBS: 1.5,
};

// ── Acciones ────────────────────────────────────────────────────────────────

export type AppAction =
  | { type: "REGISTRAR_EMBARCACION"; payload: Omit<Embarcacion, "id" | "validacion" | "tripulacion"> }
  | { type: "VALIDAR_CAPITANIA"; payload: { embarcacionId: string } }
  | { type: "ASIGNAR_RADA"; payload: { radaId: string; embarcacionId: string } }
  | { type: "DESASIGNAR_RADA"; payload: { radaId: string } }
  | { type: "REGISTRAR_TRIPULANTE"; payload: { nombre: string; especialidad: string; embarcacionId: string } }
  | { type: "AUTORIZAR_TRIPULANTE"; payload: { tripulanteId: string } }
  | { type: "CREAR_ZARPE"; payload: Omit<Zarpe, "id" | "estado"> }
  | { type: "APROBAR_SOLICITUD"; payload: { solicitudId: string } }
  | { type: "RECHAZAR_SOLICITUD"; payload: { solicitudId: string } }
  | { type: "REGISTRAR_CONSUMO"; payload: { socioId: string; tipo: string; monto: number } }
  | { type: "REGISTRAR_PAGO"; payload: { socioId: string; monto: number } }
  | { type: "FRACCIONAR_DEUDA"; payload: { socioId: string; cuotas: number } }
  | { type: "ACTUALIZAR_TASA_SBS"; payload: { tasa: number } }
  | { type: "CALCULAR_INTERESES" };

// ── Reducer ─────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "REGISTRAR_EMBARCACION": {
      const nueva: Embarcacion = {
        id: `E${String(state.embarcaciones.length + 1).padStart(3, "0")}`,
        validacion: "Pendiente",
        tripulacion: [],
        ...action.payload,
      };
      return { ...state, embarcaciones: [...state.embarcaciones, nueva] };
    }

    case "VALIDAR_CAPITANIA":
      return {
        ...state,
        embarcaciones: state.embarcaciones.map((e) =>
          e.id === action.payload.embarcacionId ? { ...e, validacion: "Validado" } : e
        ),
      };

    case "ASIGNAR_RADA": {
      const emb = state.embarcaciones.find((e) => e.id === action.payload.embarcacionId);
      if (!emb) return state;
      return {
        ...state,
        radas: state.radas.map((r) =>
          r.id === action.payload.radaId
            ? { ...r, estado: "Ocupado" as const, embarcacion: emb.nombre }
            : r
        ),
      };
    }

    case "DESASIGNAR_RADA":
      return {
        ...state,
        radas: state.radas.map((r) =>
          r.id === action.payload.radaId
            ? { ...r, estado: "Disponible" as const, embarcacion: undefined }
            : r
        ),
      };

    case "REGISTRAR_TRIPULANTE": {
      const nuevo: Tripulante = {
        id: `T${String(state.tripulantes.length + 1).padStart(3, "0")}`,
        estado: "Pendiente",
        ...action.payload,
      };
      return { ...state, tripulantes: [...state.tripulantes, nuevo] };
    }

    case "AUTORIZAR_TRIPULANTE":
      return {
        ...state,
        tripulantes: state.tripulantes.map((t) =>
          t.id === action.payload.tripulanteId ? { ...t, estado: "Autorizado" as const } : t
        ),
      };

    case "CREAR_ZARPE": {
      const nuevo: Zarpe = {
        id: `Z${String(state.zarpes.length + 1).padStart(3, "0")}`,
        estado: "Pendiente",
        ...action.payload,
      };
      return { ...state, zarpes: [...state.zarpes, nuevo] };
    }

    case "APROBAR_SOLICITUD":
      return {
        ...state,
        solicitudes: state.solicitudes.map((s) =>
          s.id === action.payload.solicitudId ? { ...s, estado: "Aprobado" as const } : s
        ),
      };

    case "RECHAZAR_SOLICITUD":
      return {
        ...state,
        solicitudes: state.solicitudes.map((s) =>
          s.id === action.payload.solicitudId ? { ...s, estado: "Rechazado" as const } : s
        ),
      };

    case "REGISTRAR_CONSUMO": {
      const { socioId, tipo, monto } = action.payload;
      return {
        ...state,
        cuentas: state.cuentas.map((c) => {
          if (c.socioId !== socioId) return c;
          const campo = tipo === "Cafetería" ? "cafeteria"
            : tipo === "Limpieza" ? "limpieza"
            : tipo === "Cabotaje" ? "cabotaje"
            : "cabotaje"; // Instrucción se suma a cabotaje como consumo extra
          const nuevo = { ...c, [campo]: c[campo as keyof typeof c] as number + monto };
          const total = nuevo.membresia + nuevo.cafeteria + nuevo.limpieza + nuevo.cabotaje + nuevo.intereses;
          return { ...nuevo, total, estado: total > 0 && nuevo.intereses > 0 ? "Moroso" as const : c.estado };
        }),
      };
    }

    case "REGISTRAR_PAGO": {
      const { socioId, monto } = action.payload;
      return {
        ...state,
        cuentas: state.cuentas.map((c) => {
          if (c.socioId !== socioId) return c;
          const nuevoTotal = Math.max(0, c.total - monto);
          const nuevoIntereses = Math.max(0, c.intereses - monto);
          const estado: "Al día" | "Moroso" = nuevoTotal <= c.membresia ? "Al día" : "Moroso";
          return { ...c, total: nuevoTotal, intereses: nuevoIntereses, estado };
        }),
        socios: state.socios.map((s) => {
          if (s.id !== socioId) return s;
          const cuenta = state.cuentas.find((c) => c.socioId === socioId);
          if (!cuenta) return s;
          const nuevoTotal = Math.max(0, cuenta.total - monto);
          return { ...s, estado: nuevoTotal <= cuenta.membresia ? "Al día" as const : "Moroso" as const };
        }),
      };
    }

    case "FRACCIONAR_DEUDA":
      // El fraccionamiento registra la deuda como "en cuotas" — en este mock simplemente
      // marcamos el estado como Al día si hay plan activo (simplificación demo)
      return {
        ...state,
        cuentas: state.cuentas.map((c) =>
          c.socioId === action.payload.socioId
            ? { ...c, estado: "Al día" as const }
            : c
        ),
      };

    case "ACTUALIZAR_TASA_SBS":
      return { ...state, tasaSBS: action.payload.tasa };

    case "CALCULAR_INTERESES":
      return {
        ...state,
        cuentas: state.cuentas.map((c) => {
          if (c.estado !== "Moroso") return c;
          const interes = parseFloat(((c.total * state.tasaSBS) / 100).toFixed(2));
          const nuevosIntereses = parseFloat((c.intereses + interes).toFixed(2));
          const nuevoTotal = parseFloat((c.total + interes).toFixed(2));
          return { ...c, intereses: nuevosIntereses, total: nuevoTotal };
        }),
      };

    default:
      return state;
  }
}

// ── Contexto ────────────────────────────────────────────────────────────────

interface AppDataContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppDataContext.Provider value={{ state, dispatch }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
