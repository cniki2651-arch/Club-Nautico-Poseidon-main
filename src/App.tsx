import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/contexts/RoleContext";
import { useRole, type Role } from "@/contexts/RoleContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { AppLayout } from "@/components/AppLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SecretariaView from "./pages/SecretariaView";
import JefeView from "./pages/JefeView";
import SociosPage from "./pages/SociosPage";
import EmbarcacionesPage from "./pages/EmbarcacionesPage";
import ZarpesPage from "./pages/ZarpesPage";
import FacturacionPage from "./pages/FacturacionPage";
import DashboardCobranza from "./pages/DashboardCobranza";
import NotFound from "./pages/NotFound";

import UsuariosPage from "./pages/UsuariosPage";

/** Redirige al dashboard si el rol actual no está en la lista de roles permitidos */
function RoleGuard({ allowed, children }: { allowed: Role[]; children: React.ReactNode }) {
  const { currentRole } = useRole();
  return allowed.includes(currentRole) ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RoleProvider>
          <AppDataProvider>
          <Routes>
            {/* Landing pública */}
            <Route path="/" element={<LandingPage />} />

            {/* Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Dashboard administrativo */}
            <Route
              path="/dashboard/*"
              element={
                <AppLayout>
                  <Routes>
                    <Route index element={<DashboardPage />} />
                    <Route path="socios" element={<SecretariaView />} />
                    <Route path="socios/buscar" element={<SociosPage />} />
                    <Route path="embarcaciones" element={<EmbarcacionesPage />} />
                    <Route path="zarpes" element={<ZarpesPage />} />
                    <Route path="facturacion" element={
                      <RoleGuard allowed={["Finanzas"]}>
                        <FacturacionPage />
                      </RoleGuard>
                    } />
                    <Route path="morosidad" element={
                      <RoleGuard allowed={["Cobranza"]}>
                        <DashboardCobranza />
                      </RoleGuard>
                    } />
                    <Route path="aprobaciones" element={<JefeView />} />
                    <Route path="usuarios" element={
                      <RoleGuard allowed={["Jefe"]}>
                        <UsuariosPage />
                      </RoleGuard>
                    } />
                  </Routes>
                </AppLayout>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppDataProvider>
        </RoleProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
