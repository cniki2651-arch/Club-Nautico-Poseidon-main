import {
  Search, ClipboardCheck, BarChart3,
  Navigation, Ship, DollarSign, UserPlus,
  LogOut, UserCog, LayoutDashboard,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useRole, type Role } from "@/contexts/RoleContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const itemInicio = { title: "Inicio", url: "/dashboard", icon: LayoutDashboard };

const menuByRole: Record<Role, { title: string; url: string; icon: React.ElementType }[]> = {
  Jefe: [
    itemInicio,
    { title: "Aprobaciones y Retiros", url: "/dashboard/aprobaciones", icon: ClipboardCheck },
    { title: "Gestión de Usuarios", url: "/dashboard/usuarios", icon: UserCog },
  ],
  Secretaria: [
    itemInicio,
    { title: "Buscar Socios", url: "/dashboard/socios/buscar", icon: Search },
  ],
  Naviero: [
    itemInicio,
    { title: "Gestión de Flota", url: "/dashboard/embarcaciones", icon: Ship },
    { title: "Control de Zarpes", url: "/dashboard/zarpes", icon: Navigation },
  ],
  Finanzas: [
    itemInicio,
    { title: "Panel Financiero", url: "/dashboard/facturacion", icon: DollarSign },
  ],
};

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { currentRole } = useRole();

  const items = menuByRole[currentRole];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("id_rol");
    window.location.href = "/login";
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <button
          onClick={toggleSidebar}
          aria-label="Abrir o cerrar menú lateral"
          className={`flex items-center gap-3 w-full rounded-md hover:bg-sidebar-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${collapsed ? "justify-center" : ""}`}
        >
          <div className="h-12 w-12 shrink-0">
            <img
              src="/logo.png"
              alt="Logo Club Poseidón"
              className="h-full w-full object-contain"
            />
          </div>

          {!collapsed && (
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-sidebar-foreground uppercase tracking-tight">Club Náutico</span>
              <span className="text-[10px] text-sidebar-foreground/60 leading-none">Poseidón del Perú</span>
            </div>
          )}
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
              tooltip="Cerrar Sesión"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="font-medium">Cerrar Sesión</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {!collapsed && (
          <p className="mt-4 text-[10px] text-sidebar-foreground/30 text-center uppercase tracking-widest font-medium">
            © 2026 Club Poseidón
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}