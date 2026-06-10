import { useState, useEffect } from "react";
import { ClipboardCheck, Users, BarChart3, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SolicitudAPI {
  id_solicitud:   number;
  dni:            string;
  tipo_doc_siglas?: string;
  nombres:        string;
  apellidos:      string;
  estado:         string;
  fecha_creacion: string;
}

function estadoBadge(estado: string) {
  switch (estado) {
    case "Aprobado":
      return <Badge className="bg-success text-success-foreground hover:bg-success/90">Aprobado</Badge>;
    case "Rechazado":
      return <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Rechazado</Badge>;
    default:
      return <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">Pendiente</Badge>;
  }
}

export default function DashboardJefe() {
  const [solicitudes, setSolicitudes]     = useState<SolicitudAPI[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorLista, setErrorLista]       = useState<string | null>(null);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      setCargandoLista(true);
      setErrorLista(null);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("https://api-poseidon.onrender.com/api/solicitudes", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data: SolicitudAPI[] = await res.json();
        setSolicitudes(data);
      } catch (err) {
        setErrorLista(err instanceof Error ? err.message : "Error inesperado.");
      } finally {
        setCargandoLista(false);
      }
    };
    fetchSolicitudes();
  }, []);

  const pendientes = solicitudes.filter((s) => s.estado === "Pendiente").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel del Jefe</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Aprobaciones Pendientes</p>
                <p className="text-2xl font-bold text-foreground">{cargandoLista ? "…" : pendientes}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-warning/10">
                <ClipboardCheck className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Solicitudes</p>
                <p className="text-2xl font-bold text-foreground">{cargandoLista ? "…" : solicitudes.length}</p>
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
                <p className="text-sm text-muted-foreground">Crecimiento</p>
                <p className="text-2xl font-bold text-foreground">+12%</p>
              </div>
              <div className="p-2.5 rounded-lg bg-success/10">
                <BarChart3 className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de solicitudes para aprobación */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Solicitudes Pendientes de Aprobación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargandoLista ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">Cargando...</TableCell>
                </TableRow>
              ) : errorLista ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-destructive py-10">{errorLista}</TableCell>
                </TableRow>
              ) : solicitudes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">No hay solicitudes.</TableCell>
                </TableRow>
              ) : (
                solicitudes.map((s) => (
                  <TableRow key={s.id_solicitud}>
                    <TableCell className="font-medium">{s.nombres} {s.apellidos}</TableCell>
                    <TableCell className="font-medium text-xs text-muted-foreground"><span className="mr-1">{s.tipo_doc_siglas || 'DNI'}</span><span className="text-foreground">{s.dni}</span></TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.fecha_creacion ? new Date(s.fecha_creacion).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>{estadoBadge(s.estado)}</TableCell>
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
