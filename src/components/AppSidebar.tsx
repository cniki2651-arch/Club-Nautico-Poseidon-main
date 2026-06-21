import { useState, useEffect } from "react";  
import {
  Search, ClipboardCheck, BarChart3,
  Navigation, Ship, DollarSign, UserPlus,
  LogOut, UserCog, LayoutDashboard,
  Sun, Moon, ShieldAlert
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
  
  Cobranza: [
    itemInicio,
    { title: "Gestión de Morosidad", url: "/dashboard/morosidad", icon: ShieldAlert },
  ],
};
  

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { currentRole } = useRole();

  // 🚀 NUEVO: Estado e Inicialización del Modo Oscuro
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") || 
             localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const items = currentRole ? menuByRole[currentRole] : [];

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

      <SidebarFooter className="p-4 border-t border-sidebar-border/50 gap-3">
        <SidebarMenu>
          
          {/*  NUEVO: Selector de Modo Claro / Oscuro Adaptable */}
          <SidebarMenuItem>
            {collapsed ? (
              // Vista cuando el Sidebar está Minimizado (Botón de alternancia rápida)
              <SidebarMenuButton
                onClick={() => setDarkMode(!darkMode)}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors justify-center"
                tooltip={darkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              >
                {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
              </SidebarMenuButton>
            ) : (
              // Vista Premium Completa cuando el Sidebar está Expandido
              <div className="flex items-center justify-between p-1 bg-sidebar-accent/40 rounded-xl border border-sidebar-border/40 w-full">
                <span className="text-xs font-medium text-sidebar-foreground/60 pl-2">Tema</span>
                <div className="flex bg-sidebar-background p-0.5 rounded-lg border border-sidebar-border/60 shadow-sm">
                  <button
                    onClick={() => setDarkMode(false)}
                    className={`p-1.5 rounded-md transition-all ${!darkMode ? "bg-sidebar-accent text-sidebar-primary shadow-sm" : "text-sidebar-foreground/40 hover:text-sidebar-foreground"}`}
                    title="Modo Claro"
                  >
                    <Sun className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDarkMode(true)}
                    className={`p-1.5 rounded-md transition-all ${darkMode ? "bg-sidebar-accent text-sidebar-primary shadow-sm" : "text-sidebar-foreground/40 hover:text-sidebar-foreground"}`}
                    title="Modo Oscuro"
                  >
                    <Moon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </SidebarMenuItem>

          {/* Botón de Logout Tradicional */}
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
          <p className="mt-2 text-[10px] text-sidebar-foreground/30 text-center uppercase tracking-widest font-medium">
            © 2026 Club Poseidón
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
