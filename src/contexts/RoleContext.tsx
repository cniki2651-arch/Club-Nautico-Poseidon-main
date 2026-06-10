import React, { createContext, useContext, useState } from "react";

export type Role = "Secretaria" | "Jefe" | "Naviero" | "Finanzas";

const rolesMap: Record<number, Role> = {
  1: "Jefe",
  2: "Secretaria",
  3: "Naviero",
  4: "Finanzas",
};

function roleFromStorage(): Role | null {
  const id = Number(localStorage.getItem("id_rol"));
  return rolesMap[id] ?? null;
}

interface RoleContextType {
  currentRole: Role | null;   // null = todavía no sabemos el rol (cargando)
  setCurrentRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  // Inicializa leyendo localStorage para sobrevivir al F5
  const [currentRole, setCurrentRoleState] = useState<Role | null>(roleFromStorage);

  const setCurrentRole = (role: Role) => {
    setCurrentRoleState(role);
  };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
