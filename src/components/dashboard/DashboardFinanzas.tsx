import { DollarSign, AlertTriangle, CreditCard, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { socios, cuentas } from "@/data/mockData";

export default function DashboardFinanzas() {
  const morosos    = cuentas.filter((c) => c.estado === "Moroso");
  const alDia      = cuentas.filter((c) => c.estado === "Al día");
  const deudaTotal = morosos.reduce((acc, c) => acc + c.total, 0);
  const cobrado    = alDia.reduce((acc, c) => acc + c.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Finanzas</h1>
        <p className="text-muted-foreground text-sm">Estado financiero del Club Náutico Poseidón</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Deuda por Cobrar</p>
                <p className="text-2xl font-bold text-foreground">S/ {deudaTotal.toLocaleString()}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-destructive/10">
                <DollarSign className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Socios Morosos</p>
                <p className="text-2xl font-bold text-foreground">
                  {socios.filter((s) => s.estado === "Moroso").length}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pagos Recibidos</p>
                <p className="text-2xl font-bold text-foreground">S/ {cobrado.toLocaleString()}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-success/10">
                <CreditCard className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de socios morosos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
            Socios Morosos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Membresía</TableHead>
                <TableHead className="text-right">Cafetería</TableHead>
                <TableHead className="text-right">Intereses</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {morosos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No hay socios morosos.
                  </TableCell>
                </TableRow>
              ) : (
                morosos.map((c) => (
                  <TableRow key={c.socioId}>
                    <TableCell className="font-medium">{c.nombre}</TableCell>
                    <TableCell className="text-right text-muted-foreground">S/ {c.membresia}</TableCell>
                    <TableCell className="text-right text-muted-foreground">S/ {c.cafeteria}</TableCell>
                    <TableCell className="text-right text-muted-foreground">S/ {c.intereses}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">S/ {c.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Moroso
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
