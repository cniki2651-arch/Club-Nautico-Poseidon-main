import { useState, useEffect } from "react";
import { AlertTriangle, Ban, ShieldAlert, TrendingUp, CreditCard, Calculator, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {Label} from "@radix-ui/react-label";

// ===================================================================
// Panel de Cobranzas conectado a la base de datos real (PostgreSQL).
// Consume:
// - GET /api/facturacion/morosos (Cálculo SBS dinámico de intereses)
// - POST /api/facturacion/pagar (Registrar pago con intereses SBS)
// ===================================================================

function fmt(n: number) {
  return `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface FacturaMorosa {
  id_factura: number;
  id_socio: number;
  concepto: string;
  monto_base: number;
  monto_total: number;
  fecha_emision: string;
  fecha_vencimiento: string;
  estado_pago: string;
  dni: string;
  nombres: string;
  apellidos: string;
  tipo_doc_siglas: string;
  interes_sbs: number;
  dias_mora: number;
}

export default function DashboardCobranza() {
  const { toast } = useToast();
  const [morososList, setMorososList] = useState<FacturaMorosa[]>([]);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sbsRate, setSbsRate] = useState("1.0");

  // ── Registrar Pago ───────────────────────────────────────────────────────
  const [pFacturaId, setPFacturaId] = useState("");

  const totalAdeudado = morososList.reduce((acc, f) => acc + Number(f.monto_total), 0);
  const uniqueSociosInMora = new Set(morososList.map((f) => f.id_socio)).size;

  const fetchMorosos = async (rate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = import.meta.env.VITE_API_URL || "https://api-poseidon.onrender.com";
      const targetRate = typeof rate === "string" ? rate : sbsRate;
      const res = await fetch(`${apiUrl}/api/facturacion/morosos?tasa_mensual=${targetRate}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        throw new Error(`Error ${res.status}: no se pudo cargar los socios morosos.`);
      }
      const data = await res.json();
      setMorososList(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error al cargar morosos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMorosos();
  }, []);

  const handlePago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pFacturaId) return;

    setPaying(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = import.meta.env.VITE_API_URL || "https://api-poseidon.onrender.com";
      const res = await fetch(`${apiUrl}/api/facturacion/pagar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ 
          id_factura: Number(pFacturaId),
          tasa_mensual: Number(sbsRate)
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensaje || "Error al registrar el pago.");
      }

      const result = await res.json();
      toast({
        title: "Pago registrado exitosamente",
        description: `Monto Base: S/ ${result.monto_base.toFixed(2)} | Interés SBS (${result.dias_mora} días): S/ ${result.interes_sbs.toFixed(2)} | Total Cobrado: S/ ${result.total_pagado.toFixed(2)}.`,
      });

      setPFacturaId("");
      fetchMorosos(sbsRate); // Refrescar los morosos con la tasa actual
    } catch (err) {
      toast({
        title: "Error al registrar pago",
        description: err instanceof Error ? err.message : "Error al registrar pago.",
        variant: "destructive",
      });
    } finally {
      setPaying(false);
    }
  };

  const selectedInvoice = morososList.find((f) => String(f.id_factura) === pFacturaId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel de Cobranzas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión de morosidad, cálculo automático de intereses SBS y recaudación de pagos en base de datos.
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchMorosos()} disabled={loading} className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Actualizar Datos
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Moroso (Con Intereses)</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? "Calculando..." : fmt(totalAdeudado)}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-destructive/10">
                <TrendingUp className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Socios con Deuda</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? "..." : uniqueSociosInMora}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tasa SBS Aplicada</p>
                <p className="text-2xl font-bold text-foreground">{sbsRate}% mensual</p>
              </div>
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Tabla de socios morosos */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              Facturas Vencidas con Cálculo de Intereses SBS
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Socio</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Base</TableHead>
                    <TableHead className="text-right">Intereses SBS</TableHead>
                    <TableHead className="text-right">Total Acumulado</TableHead>
                    <TableHead className="text-right">Mora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {morososList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                        No se encontraron deudas vencidas en la base de datos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    morososList.map((f) => (
                      <TableRow key={f.id_factura}>
                        <TableCell className="font-medium">
                          <span className="block text-sm font-semibold">{f.nombres} {f.apellidos}</span>
                          <span className="block text-[10px] text-muted-foreground">{f.tipo_doc_siglas}: {f.dni}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {f.concepto}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{fmt(f.monto_base)}</TableCell>
                        <TableCell className="text-right text-red-600 font-semibold">{fmt(f.interes_sbs)}</TableCell>
                        <TableCell className="text-right font-bold">{fmt(f.monto_total)}</TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-red-600 text-white select-none whitespace-nowrap">
                            <Ban className="h-3 w-3 mr-1" /> {f.dias_mora} días
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
            <p className="text-[11px] text-muted-foreground mt-3 italic">
              * Nota: El bloqueo de zarpes de naves a socios morosos se realiza en tiempo real a nivel del Backend API al intentar solicitar o autorizar salidas.
            </p>
          </CardContent>
        </Card>

        {/* Columna derecha */}
        <div className="space-y-6">
          {/* Configuración de Tasa SBS */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                Configurar Tasa SBS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="tasa-sbs" className="text-xs font-semibold text-slate-700">Tasa Mensual (%)</Label>
                <div className="flex gap-2">
                  <input
                    id="tasa-sbs"
                    type="number"
                    step="0.01"
                    min="0"
                    value={sbsRate}
                    onChange={(e) => setSbsRate(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button 
                    type="button"
                    onClick={() => fetchMorosos(sbsRate)} 
                    disabled={loading}
                    size="sm"
                    className="bg-primary text-primary-foreground select-none"
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Configure la tasa de interés mensual utilizada para calcular la morosidad y al procesar los cobros.
              </p>
            </CardContent>
          </Card>

          {/* Registrar Pago */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Cobrar Factura Vencida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePago} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Socio y Recibo</Label>
                  <Select value={pFacturaId} onValueChange={setPFacturaId}>
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "Cargando morosos..." : "Seleccionar recibo"} />
                    </SelectTrigger>
                    <SelectContent>
                      {morososList.map((f) => (
                        <SelectItem key={f.id_factura} value={String(f.id_factura)}>
                          {f.nombres} {f.apellidos} - Factura #{f.id_factura} (S/ {f.monto_total.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {pFacturaId && selectedInvoice && (
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                    <p className="text-muted-foreground">Deuda Principal: <span className="font-semibold text-slate-800">{fmt(selectedInvoice.monto_base)}</span></p>
                    <p className="text-red-600 font-semibold">Interés SBS Mora: {fmt(selectedInvoice.interes_sbs)} ({selectedInvoice.dias_mora} días)</p>
                    <div className="pt-2 mt-1 border-t border-slate-200 font-bold text-sm text-slate-900 flex justify-between">
                      <span>Total a Recaudar:</span>
                      <span>{fmt(selectedInvoice.monto_total)}</span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-colors" disabled={!pFacturaId || paying}>
                  {paying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Procesando Cobro...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" /> Registrar Recaudación
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
