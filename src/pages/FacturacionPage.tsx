import { useState } from "react";
import { DollarSign, Receipt, Calculator, CreditCard, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppData } from "@/contexts/AppDataContext";
import { calcularMontoCuota } from "@/lib/businessRules";
import { useToast } from "@/hooks/use-toast";

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

export default function FacturacionPage() {
  const { state, dispatch } = useAppData();
  const { toast } = useToast();

  // ── Tasa SBS ──────────────────────────────────────────────────────────────
  const [tasaInput, setTasaInput] = useState(String(state.tasaSBS));

  // ── Consumos ──────────────────────────────────────────────────────────────
  const [cSocio, setCSocio] = useState("");
  const [cTipo, setCTipo] = useState<string>("");
  const [cSubtipo, setCSubtipo] = useState("");
  const [cMonto, setCMonto] = useState("");

  // ── Pagos ─────────────────────────────────────────────────────────────────
  const [pSocio, setPSocio] = useState("");
  const [pMonto, setPMonto] = useState("");

  // ── Fraccionamiento ───────────────────────────────────────────────────────
  const [fSocio, setFSocio] = useState("");
  const [fCuotas, setFCuotas] = useState("3");

  const socioEnRetiro = (id: string) =>
    state.socios.find((s) => s.id === id)?.categoria === "Renuente";

  const cuentaFraccion = state.cuentas.find((c) => c.socioId === fSocio);
  const montoCuota = cuentaFraccion
    ? calcularMontoCuota(cuentaFraccion.total, Number(fCuotas))
    : 0;

  const sociosMorosos = state.cuentas.filter((c) => c.estado === "Moroso");

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
    if (sociosMorosos.length === 0) {
      toast({ title: "Sin morosos", description: "No hay socios morosos para calcular intereses." });
      return;
    }
    dispatch({ type: "CALCULAR_INTERESES" });
    toast({ title: "Intereses calculados", description: `Se aplicó ${state.tasaSBS}% a ${sociosMorosos.length} socio(s) moroso(s).` });
  }

  function handleConsumo(e: React.FormEvent) {
    e.preventDefault();
    if (!cSocio || !cTipo || !cMonto) return;
    const monto = parseFloat(cMonto);
    if (isNaN(monto) || monto <= 0) return;
    const tipoFinal = cTipo === "Instrucción" && cSubtipo ? `Instrucción (${cSubtipo})` : cTipo;
    dispatch({ type: "REGISTRAR_CONSUMO", payload: { socioId: cSocio, tipo: tipoFinal, monto } });
    toast({ title: "Consumo registrado", description: `${tipoFinal}: ${fmt(monto)} agregado a la cuenta.` });
    setCSocio(""); setCTipo(""); setCSubtipo(""); setCMonto("");
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

  function handleFraccion(e: React.FormEvent) {
    e.preventDefault();
    if (!fSocio || !cuentaFraccion) return;
    dispatch({ type: "FRACCIONAR_DEUDA", payload: { socioId: fSocio, cuotas: Number(fCuotas) } });
    toast({ title: "Deuda fraccionada", description: `${fCuotas} cuotas de ${fmt(montoCuota)} para ${cuentaFraccion.nombre}.` });
    setFSocio(""); setFCuotas("3");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Facturación y Finanzas</h1>
        <p className="text-muted-foreground text-sm">Cuentas, consumos, pagos e intereses</p>
      </div>

      <Tabs defaultValue="cuentas" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="cuentas" className="gap-2">
            <Receipt className="h-4 w-4" /> Estados de Cuenta
          </TabsTrigger>
          <TabsTrigger value="consumos" className="gap-2">
            <DollarSign className="h-4 w-4" /> Consumos
          </TabsTrigger>
          <TabsTrigger value="pagos" className="gap-2">
            <CreditCard className="h-4 w-4" /> Pagos
          </TabsTrigger>
        </TabsList>

        {/* ── PESTAÑA 1: ESTADOS DE CUENTA ─────────────────────────────── */}
        <TabsContent value="cuentas" className="space-y-4">
          {/* Panel de configuración */}
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
                  <p className="text-xs text-muted-foreground">Tasa actual: {state.tasaSBS}% mensual</p>
                </div>
                <Button
                  onClick={handleCalcularIntereses}
                  className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                  disabled={sociosMorosos.length === 0}
                >
                  <Calculator className="h-4 w-4" />
                  Calcular Intereses del Mes
                  {sociosMorosos.length > 0 && (
                    <Badge className="ml-1 bg-red-800 text-white">{sociosMorosos.length}</Badge>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de cuentas */}
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
                      <TableHead className="text-right">Instrucción</TableHead>
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
                          <TableCell className="text-right text-muted-foreground">{fmt(0)}</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PESTAÑA 2: CONSUMOS ───────────────────────────────────────── */}
        <TabsContent value="consumos">
          <Card className="max-w-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Registrar Consumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConsumo} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Socio</Label>
                  <Select value={cSocio} onValueChange={setCSocio}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar socio" /></SelectTrigger>
                    <SelectContent>
                      {state.socios.map((s) => (
                        <SelectItem key={s.id} value={s.id} disabled={s.categoria === "Renuente"}>
                          {s.nombre} {s.categoria === "Renuente" ? "— En retiro" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {cSocio && socioEnRetiro(cSocio) && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Socio en proceso de retiro</AlertTitle>
                    <AlertDescription>No se pueden registrar consumos para este socio.</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1.5">
                  <Label>Tipo de Servicio</Label>
                  <Select value={cTipo} onValueChange={(v) => { setCTipo(v); setCSubtipo(""); }}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar servicio" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cafetería">Cafetería</SelectItem>
                      <SelectItem value="Limpieza">Limpieza</SelectItem>
                      <SelectItem value="Cabotaje">Cabotaje</SelectItem>
                      <SelectItem value="Instrucción">Instrucción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {cTipo === "Instrucción" && (
                  <div className="space-y-1.5">
                    <Label>Modalidad de Instrucción</Label>
                    <Select value={cSubtipo} onValueChange={setCSubtipo}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar modalidad" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Natación">Natación</SelectItem>
                        <SelectItem value="Buceo">Buceo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Monto (S/)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    value={cMonto}
                    onChange={(e) => setCMonto(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!cSocio || !cTipo || !cMonto || socioEnRetiro(cSocio) || (cTipo === "Instrucción" && !cSubtipo)}
                >
                  Registrar Consumo
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PESTAÑA 3: PAGOS Y FRACCIONAMIENTOS ──────────────────────── */}
        <TabsContent value="pagos">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Tarjeta A: Registrar Pago */}
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

            {/* Tarjeta B: Fraccionar Deuda */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  Fraccionar Deuda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFraccion} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Socio Moroso</Label>
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
                    <Label>Número de Cuotas</Label>
                    <Select value={fCuotas} onValueChange={setFCuotas}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 5, 6].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n} cuotas</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
