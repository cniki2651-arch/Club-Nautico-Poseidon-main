import { useState, useEffect } from "react";
import { CreditCard, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ConsumoDetalle {
  id_consumo: number;
  servicio: string;
  monto: number;
  descripcion: string;
  fecha_consumo: string;
}

interface SocioConsumosAPI {
  id_socio: number;
  dni: string;
  tipo_doc_siglas: string;
  nombres: string;
  apellidos: string;
  total_consumos: number;
  consumos: ConsumoDetalle[];
}

interface ConsumoPlano {
  id_consumo: number;
  dni: string;
  tipo_doc_siglas: string;
  nombre_completo: string;
  fecha: string;
  servicio: string;
  monto: number;
}

export default function HistorialConsumosPage() {
  const [consumosList, setConsumosList] = useState<ConsumoPlano[]>([]);
  const [cargandoConsumos, setCargandoConsumos] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const fetchConsumos = async () => {
    setCargandoConsumos(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = import.meta.env.VITE_API_URL || "https://api-poseidon.onrender.com";
      const res = await fetch(`${apiUrl}/api/facturacion/consumos-pendientes`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) return;
      const data: SocioConsumosAPI[] = await res.json();
      
      const flatList: ConsumoPlano[] = [];
      data.forEach((socio) => {
        socio.consumos.forEach((c) => {
          flatList.push({
            id_consumo: c.id_consumo,
            dni: socio.dni,
            tipo_doc_siglas: socio.tipo_doc_siglas || "DNI",
            nombre_completo: `${socio.nombres} ${socio.apellidos}`,
            fecha: c.fecha_consumo,
            servicio: c.servicio,
            monto: c.monto,
          });
        });
      });
      setConsumosList(flatList);
    } catch (err: unknown) {
      console.error("Error al obtener historial de consumos:", err);
    } finally {
      setCargandoConsumos(false);
    }
  };

  useEffect(() => {
    fetchConsumos();
  }, []);

  const consumosFiltrados = consumosList.filter((c) => {
    return `${c.nombre_completo} ${c.dni}`.toLowerCase().includes(busqueda.toLowerCase());
  });

  const totalConsumosMonto = consumosFiltrados.reduce((acc, curr) => acc + curr.monto, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historial de Consumo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualización y seguimiento de todos los consumos y servicios adicionales de socios pendientes de facturación.
          </p>
        </div>
        <Button variant="outline" onClick={fetchConsumos} disabled={cargandoConsumos} className="gap-2">
          {cargandoConsumos && <Loader2 className="h-4 w-4 animate-spin" />}
          Actualizar Datos
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Pendiente de Facturar (Consumos)</p>
                <p className="text-2xl font-bold text-foreground">
                  {cargandoConsumos ? "Calculando..." : `S/ ${totalConsumosMonto.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10">
                <CreditCard className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Servicios Pendientes</p>
                <p className="text-2xl font-bold text-foreground">
                  {cargandoConsumos ? "..." : consumosFiltrados.length}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10">
                <Search className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            type="text" 
            placeholder="Buscar por socio o DNI..." 
            className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-sm"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/20 dark:bg-slate-950/20">
              <TableRow className="border-b border-slate-200 dark:border-slate-800">
                <TableHead className="font-bold text-xs pl-6 py-3">Documento de Titular</TableHead>
                <TableHead className="font-bold text-xs">Nombre y Apellido</TableHead>
                <TableHead className="font-bold text-xs">Fecha</TableHead>
                <TableHead className="font-bold text-xs">Servicio</TableHead>
                <TableHead className="font-bold text-xs text-right pr-6">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargandoConsumos ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400 dark:text-slate-500 py-10 text-sm">
                    Cargando historial de consumos...
                  </TableCell>
                </TableRow>
              ) : consumosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400 py-10 text-sm">
                    No se han registrado consumos pendientes en este periodo.
                  </TableCell>
                </TableRow>
              ) : (
                consumosFiltrados.map((c) => (
                  <TableRow key={c.id_consumo} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <TableCell className="font-mono text-xs pl-6 py-4">
                      <span className="text-slate-400 mr-1.5 font-bold">{c.tipo_doc_siglas}</span>
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">{c.dni}</span>
                    </TableCell>
                    <TableCell className="font-semibold text-sm text-slate-900 dark:text-slate-100">{c.nombre_completo}</TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(c.fecha).toLocaleDateString("es-PE")}
                    </TableCell>
                    <TableCell className="text-sm text-slate-750 dark:text-slate-300 font-medium">
                      {c.servicio}
                    </TableCell>
                    <TableCell className="text-right pr-6 font-bold text-slate-900 dark:text-slate-100">
                      {`S/ ${Number(c.monto).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
