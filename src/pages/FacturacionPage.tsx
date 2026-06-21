import { useState, useEffect } from "react";
import { Receipt, Calculator, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppData } from "@/contexts/AppDataContext";
import { calcularMontoCuota } from "@/lib/businessRules";
import { useToast } from "@/hooks/use-toast";

// ── Tipos para los consumos reales del backend ──────────────────────────────
interface ConsumoDetalle {
  id_consumo: number;
  servicio: string;
  monto: number;
  descripcion: string;
  fecha_consumo: string;
}

interface SocioConConsumos {
  id_socio: number;
  dni: string;
  tipo_doc_siglas?: string;
  nombres: string;
  apellidos: string;
  total_consumos: number;
  consumos: ConsumoDetalle[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: string }) {
  return estado === "Al día"
    ? <Badge className="bg-green-100 text-green-800 border-green-200">Al día</Badge>
    : <Badge className="bg-red-100 text-red-800 border-red-200">Moroso</Badge>;
}

function fmt(n: number) {
  return `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Componente principal ─────────────────────────────────────────────────────
//
// NOTA SOBRE EL ALCANCE DE ESTE PANEL (Finanzas):
// Este panel se enfoca SOLO en las 2 responsabilidades de Finanzas:
//   1. Generar Facturación Mensual → vista de Estados de Cuenta
//   2. Aprobar Fraccionamiento de Deuda
// Lo que se quitó de aquí y por qué:
//   - "Registrar Consumo": es responsabilidad de Secretaría (panel SecretariaView).
//   - "Tasa SBS" + "Calcular Intereses": es responsabilidad de Cobranzas
//     (Gestionar Morosidad - Cálculo SBS), ahora vive en DashboardCobranza.
//   - "Registrar Pago": es responsabilidad de Cobranzas (quien recauda),
//     ahora vive en DashboardCobranza.
//
export default function FacturacionPage() {
  const { state, dispatch } = useAppData();
  const { toast } = useToast();

  // ── Consumos Pendientes (datos REALES del backend, registrados por Secretaría) ──
  const [consumosPendientes, setConsumosPendientes] = useState<SocioConConsumos[]>([]);
  const [cargandoConsumos, setCargandoConsumos] = useState(true);
  const [errorConsumos, setErrorConsumos] = useState<string | null>(null);
  const [generandoFacturacion, setGenerandoFacturacion] = useState(false);

  const fetchConsumosPendientes = async () => {
    setCargandoConsumos(true);
    setErrorConsumos(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("https://api-poseidon.onrender.com/api/facturacion/consumos-pendientes", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}: no se pudo cargar los consumos pendientes.`);
      const data: SocioConConsumos[] = await res.json();
      setConsumosPendientes(data);
    } catch (err) {
      setErrorConsumos(err instanceof Error ? err.message : "Error inesperado al cargar consumos.");
    } finally {
      setCargandoConsumos(false);
    }
  };

  useEffect(() => {
    fetchConsumosPendientes();
  }, []);

  const totalGeneralPendiente = consumosPendientes.reduce((acc, s) => acc + s.total_consumos, 0);

  // ── Fraccionamiento ───────────────────────────────────────────────────────
  const [fSocio, setFSocio] = useState("");
  const [fCuotas, setFCuotas] = useState("3");

  const cuentaFraccion = state.cuentas.find((c) => c.socioId === fSocio);
  const montoCuota = cuentaFraccion
    ? calcularMontoCuota(cuentaFraccion.total, Number(fCuotas))
    : 0;

  const sociosMorosos = state.cuentas.filter((c) => c.estado === "Moroso");

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleFraccion(e: React.FormEvent) {
    e.preventDefault();
    if (!fSocio || !cuentaFraccion) return;
    dispatch({ type: "FRACCIONAR_DEUDA", payload: { socioId: fSocio, cuotas: Number(fCuotas) } });
    toast({ title: "Deuda fraccionada", description: `${fCuotas} cuotas de ${fmt(montoCuota)} para ${cuentaFraccion.nombre}.` });
    setFSocio(""); setFCuotas("3");
  }

  async function handleGenerarFacturacion() {
    setGenerandoFacturacion(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("https://api-poseidon.onrender.com/api/facturacion/generar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "No se pudo generar la facturación.");

      toast({
        title: "Facturación generada",
        description: data.mensaje || `Se generaron ${data.facturas_generadas} factura(s).`,
      });

      // Refresca la lista: los consumos recién facturados ya no deberían aparecer
      await fetchConsumosPendientes();
    } catch (err) {
      toast({
        title: "Error al generar facturación",
        description: err instanceof Error ? err.message : "Error inesperado.",
        variant: "destructive",
      });
    } finally {
      setGenerandoFacturacion(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Facturación y Finanzas</h1>
        <p className="text-muted-foreground text-sm">Estados de cuenta y fraccionamiento de deuda</p>
      </div>

      <Tabs defaultValue="cuentas" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="cuentas" className="gap-2">
            <Receipt className="h-4 w-4" /> Estados de Cuenta
          </TabsTrigger>
          <TabsTrigger value="consumos-pendientes" className="gap-2">
            <DollarSign className="h-4 w-4" /> Consumos Pendientes
          </TabsTrigger>
          <TabsTrigger value="fraccionamiento" className="gap-2">
            <Calculator className="h-4 w-4" /> Fraccionamiento
          </TabsTrigger>
        </TabsList>

        {/* ── PESTAÑA 1: ESTADOS DE CUENTA (Generar Facturación Mensual) ── */}
        <TabsContent value="cuentas" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                Cuentas de Socios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Socio</TableHead>
                      <TableHead className="text-right">Membresía</TableHead>
                      <TableHead className="text-right">Consumos</TableHead>
                      <TableHead className="text-right">Intereses</TableHead>
                      <TableHead className="text-right">Total Deuda</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.cuentas.map((c) => {
                      const consumos = c.cafeteria + c.limpieza + c.cabotaje;
                      return (
                        <TableRow key={c.socioId}>
                          <TableCell className="font-medium">{c.nombre}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{fmt(c.membresia)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{fmt(consumos)}</TableCell>
                          <TableCell className="text-right">
                            {c.intereses > 0
                              ? <span className="text-red-600 font-medium">{fmt(c.intereses)}</span>
                              : <span className="text-muted-foreground">{fmt(0)}</span>}
                          </TableCell>
                          <TableCell className="text-right font-bold">{fmt(c.total)}</TableCell>
                          <TableCell><EstadoBadge estado={c.estado} /></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Esta vista consolida membresía + consumos registrados por Secretaría + intereses
                aplicados por Cobranza, para fines de facturación mensual.
              </p>
              <p className="text-xs text-amber-600 mt-3">
                ⚠ Esta vista usa datos de ejemplo (membresía y rada simuladas). Los consumos
                reales registrados por Secretaría están en la pestaña "Consumos Pendientes".
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PESTAÑA 2: CONSUMOS PENDIENTES (datos reales del backend) ── */}
        <TabsContent value="consumos-pendientes" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Consumos Pendientes de Facturación
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Datos reales registrados por Secretaría, agrupados por socio, aún no incluidos en una factura.
                </p>
              </div>
              <Button
                onClick={handleGenerarFacturacion}
                disabled={generandoFacturacion || consumosPendientes.length === 0}
                className="gap-2 shrink-0"
              >
                <Receipt className="h-4 w-4" />
                {generandoFacturacion ? "Generando..." : "Generar Facturación Mensual"}
              </Button>
            </CardHeader>
            <CardContent>
              {cargandoConsumos ? (
                <p className="text-center text-muted-foreground py-10 text-sm">Cargando consumos pendientes...</p>
              ) : errorConsumos ? (
                <p className="text-center text-destructive py-10 text-sm">{errorConsumos}</p>
              ) : consumosPendientes.length === 0 ? (
                <p className="text-center text-muted-foreground py-10 text-sm">
                  No hay consumos pendientes de facturación.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm">
                    <span className="text-blue-600 font-medium">Total pendiente de todos los socios: </span>
                    <span className="font-bold text-blue-950">{fmt(totalGeneralPendiente)}</span>
                  </div>
                  {consumosPendientes.map((socio) => (
                    <div key={socio.id_socio} className="rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                        <div>
                          <p className="font-semibold text-sm">{socio.nombres} {socio.apellidos}</p>
                          <p className="text-xs text-muted-foreground">
                            {socio.tipo_doc_siglas || "DNI"} {socio.dni}
                          </p>
                        </div>
                        <p className="font-bold text-foreground">{fmt(socio.total_consumos)}</p>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Servicio</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {socio.consumos.map((c) => (
                            <TableRow key={c.id_consumo}>
                              <TableCell className="text-sm">{c.servicio}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{c.descripcion}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(c.fecha_consumo).toLocaleDateString("es-PE")}
                              </TableCell>
                              <TableCell className="text-right text-sm font-medium">{fmt(c.monto)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PESTAÑA 3: FRACCIONAMIENTO DE DEUDA ──────────────────────── */}
        <TabsContent value="fraccionamiento">
          <Card className="max-w-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                Aprobar Fraccionamiento de Deuda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFraccion} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Socio Moroso</label>
                  <Select value={fSocio} onValueChange={setFSocio}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar socio moroso" /></SelectTrigger>
                    <SelectContent>
                      {sociosMorosos.map((c) => (
                        <SelectItem key={c.socioId} value={c.socioId}>
                          {c.nombre} — {fmt(c.total)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {sociosMorosos.length === 0 && (
                    <p className="text-xs text-muted-foreground">No hay socios morosos actualmente.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Número de Cuotas</label>
                  <Select value={fCuotas} onValueChange={setFCuotas}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} cuotas</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Máximo permitido: 6 cuotas mensuales.</p>
                </div>

                {/* Vista previa del fraccionamiento */}
                {fSocio && cuentaFraccion && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-1">
                    <p className="text-xs text-blue-600 font-medium">Vista previa</p>
                    <p className="text-sm text-blue-800">
                      Deuda total: <span className="font-bold">{fmt(cuentaFraccion.total)}</span>
                    </p>
                    <p className="text-lg font-bold text-blue-950">
                      {fCuotas} cuotas de {fmt(montoCuota)}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={!fSocio || sociosMorosos.length === 0}
                >
                  <Calculator className="h-4 w-4" /> Confirmar Fraccionamiento
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
