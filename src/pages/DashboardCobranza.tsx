import { useState } from "react";
import { AlertTriangle, Ban, ShieldAlert, TrendingUp, CreditCard, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppData } from "@/contexts/AppDataContext";
import { useToast } from "@/hooks/use-toast";

// ===================================================================
// Este panel cubre la ÚNICA responsabilidad de Cobranzas según el
// caso de uso oficial: "Gestionar Morosidad (Cálculo SBS)".
// Incluye también "Registrar Pago", ya que recaudar y marcar facturas
// como pagadas es quien hace seguimiento a la morosidad (Cobranzas),
// no quien factura (Finanzas).
//
// El bloqueo de zarpes a socios morosos YA es automático a nivel de
// negocio (ver zarpeEsPermitido en businessRules.ts, que revisa
// socio.estado === "Moroso"). El botón "Zarpes Bloqueados" aquí es
// informativo: confirma visualmente que la penalidad ya está vigente,
// no dispara una acción adicional.
// ===================================================================

function fmt(n: number) {
  return `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DashboardCobranza() {
  const { state, dispatch } = useAppData();
  const { toast } = useToast();

  // ── Tasa SBS ──────────────────────────────────────────────────────────────
  const [tasaInput, setTasaInput] = useState(String(state.tasaSBS));

  // ── Registrar Pago ───────────────────────────────────────────────────────
  const [pSocio, setPSocio] = useState("");
  const [pMonto, setPMonto] = useState("");

  const morosos = state.cuentas.filter((c) => c.estado === "Moroso");
  const totalAdeudado = morosos.reduce((acc, c) => acc + c.total, 0);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleTasaUpdate() {
    const tasa = parseFloat(tasaInput);
    if (isNaN(tasa) || tasa <= 0) {
      toast({ title: "Tasa inválida", description: "Ingresa un valor mayor a 0.", variant: "destructive" });
      return;
    }
    dispatch({ type: "ACTUALIZAR_TASA_SBS", payload: { tasa } });
    toast({ title: "Tasa SBS actualizada", description: `Nueva tasa: ${tasa}% mensual.` });
  }

  function handleCalcularIntereses() {
    if (morosos.length === 0) {
      toast({ title: "Sin morosos", description: "No hay socios morosos para calcular intereses." });
      return;
    }
    dispatch({ type: "CALCULAR_INTERESES" });
    toast({ title: "Intereses calculados", description: `Se aplicó ${state.tasaSBS}% a ${morosos.length} socio(s) moroso(s).` });
  }

  function handlePago(e: React.FormEvent) {
    e.preventDefault();
    const monto = parseFloat(pMonto);
    if (!pSocio || isNaN(monto) || monto <= 0) return;
    dispatch({ type: "REGISTRAR_PAGO", payload: { socioId: pSocio, monto } });
    const socio = state.socios.find((s) => s.id === pSocio);
    toast({ title: "Pago registrado", description: `${fmt(monto)} abonado a la cuenta de ${socio?.nombre}.` });
    setPSocio(""); setPMonto("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Cobranzas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestión de morosidad, cálculo de intereses SBS y recaudación de pagos.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Adeudado</p>
                <p className="text-2xl font-bold text-foreground">{fmt(totalAdeudado)}</p>
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
                <p className="text-sm text-muted-foreground">Socios en Mora</p>
                <p className="text-2xl font-bold text-foreground">{morosos.length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tasa SBS Vigente</p>
                <p className="text-2xl font-bold text-foreground">{state.tasaSBS}%</p>
              </div>
              <div className="p-2.5 rounded-lg bg-accent">
                <Calculator className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuración de Tasa SBS + Calcular Intereses */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-1.5 flex-1">
              <Label className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                Tasa SBS Mensual (%)
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tasaInput}
                  onChange={(e) => setTasaInput(e.target.value)}
                  className="max-w-[140px]"
                />
                <Button variant="outline" onClick={handleTasaUpdate}>Actualizar</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Verificar tasa vigente en{" "}
                <a
                  href="https://www.sbs.gob.pe/estadisticas/tasa-de-interes/tasa-de-interes-de-indole-legal"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  sbs.gob.pe
                </a>{" "}
                antes de actualizar.
              </p>
            </div>
            <Button
              onClick={handleCalcularIntereses}
              className="gap-2 bg-red-600 hover:bg-red-700 text-white"
              disabled={morosos.length === 0}
            >
              <Calculator className="h-4 w-4" />
              Calcular Intereses del Mes
              {morosos.length > 0 && (
                <Badge className="ml-1 bg-red-800 text-white">{morosos.length}</Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tabla de socios morosos */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              Socios con Pagos Vencidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Membresía</TableHead>
                  <TableHead className="text-right">Intereses</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {morosos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      No hay socios morosos.
                    </TableCell>
                  </TableRow>
                ) : (
                  morosos.map((c) => (
                    <TableRow key={c.socioId}>
                      <TableCell className="font-medium">{c.nombre}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{fmt(c.membresia)}</TableCell>
                      <TableCell className="text-right text-red-600 font-medium">{fmt(c.intereses)}</TableCell>
                      <TableCell className="text-right font-bold">{fmt(c.total)}</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          <Ban className="h-3 w-3 mr-1" /> Zarpes Bloqueados
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-3">
              El bloqueo de zarpes para socios morosos se aplica automáticamente al validar
              cada solicitud de zarpe; esta etiqueta refleja ese estado, no requiere acción manual.
            </p>
          </CardContent>
        </Card>

        {/* Registrar Pago */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Registrar Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePago} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Socio</Label>
                <Select value={pSocio} onValueChange={setPSocio}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar socio" /></SelectTrigger>
                  <SelectContent>
                    {state.socios.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {pSocio && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Deuda actual</p>
                  <p className="font-bold text-slate-900">
                    {fmt(state.cuentas.find((c) => c.socioId === pSocio)?.total ?? 0)}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Monto a Pagar (S/)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={pMonto}
                  onChange={(e) => setPMonto(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={!pSocio || !pMonto}>
                <CreditCard className="h-4 w-4" /> Registrar Pago
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
