import { useState, useEffect } from "react";
import { DollarSign, Receipt, FileCheck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// ===================================================================
// "Inicio" para el rol Finanzas: resumen ejecutivo simple.
// El detalle completo (Estados de Cuenta, Consumos Pendientes,
// Fraccionamiento de Deuda) vive en FacturacionPage.tsx ("Panel
// Financiero" en el menú lateral) — aquí solo se muestran KPIs.
//
// La morosidad NO vive aquí: es responsabilidad de Cobranzas
// (ver DashboardCobranza.tsx / "Gestión de Morosidad").
// ===================================================================

interface SocioConConsumos {
  id_socio: number;
  total_consumos: number;
  consumos: unknown[];
}

function fmt(n: number) {
  return `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DashboardFinanzas() {
  const [consumosPendientes, setConsumosPendientes] = useState<SocioConConsumos[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchResumen = async () => {
      setCargando(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("https://api-poseidon.onrender.com/api/facturacion/consumos-pendientes", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) return;
        const data: SocioConConsumos[] = await res.json();
        setConsumosPendientes(data);
      } catch {
        /* Silencioso: si falla, los KPIs quedan en 0 */
      } finally {
        setCargando(false);
      }
    };
    fetchResumen();
  }, []);

  const totalPendiente = consumosPendientes.reduce((acc, s) => acc + s.total_consumos, 0);
  const sociosConPendientes = consumosPendientes.length;
  const totalConsumosRegistrados = consumosPendientes.reduce((acc, s) => acc + s.consumos.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Finanzas</h1>
        <p className="text-muted-foreground text-sm">Resumen general del estado financiero del Club</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pendiente de Facturar</p>
                <p className="text-2xl font-bold text-foreground">{cargando ? "…" : fmt(totalPendiente)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Socios con Consumos Pendientes</p>
                <p className="text-2xl font-bold text-foreground">{cargando ? "…" : sociosConPendientes}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-accent">
                <Users className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Consumos Registrados</p>
                <p className="text-2xl font-bold text-foreground">{cargando ? "…" : totalConsumosRegistrados}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-success/10">
                <Receipt className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 shrink-0">
            <FileCheck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">¿Listo para facturar el mes?</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ve a <span className="font-medium">Panel Financiero</span> para revisar el detalle de consumos
              pendientes por socio y generar la facturación mensual.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
