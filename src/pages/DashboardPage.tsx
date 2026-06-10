import { useRole } from "@/contexts/RoleContext";
import DashboardSecretaria from "@/components/dashboard/DashboardSecretaria";
import DashboardJefe       from "@/components/dashboard/DashboardJefe";
import DashboardNaviero    from "@/components/dashboard/DashboardNaviero";
import DashboardFinanzas   from "@/components/dashboard/DashboardFinanzas";

export default function DashboardPage() {
  const { currentRole } = useRole();

  // Mientras el contexto no haya resuelto el rol (null), no renderizamos nada.
  // Esto evita el flash de <DashboardSecretaria /> al hacer F5.
  if (currentRole === null) return null;

  // Comparación estricta por nombre de rol — sin default que enmascare errores
  if (currentRole === "Jefe")       return <DashboardJefe />;
  if (currentRole === "Naviero")    return <DashboardNaviero />;
  if (currentRole === "Finanzas")   return <DashboardFinanzas />;
  if (currentRole === "Secretaria") return <DashboardSecretaria />;

  // Rol desconocido — no debería ocurrir, pero lo manejamos limpiamente
  return null;
}
