import { useState, useEffect } from "react";
import {
  CheckCircle, XCircle, FileText, Lock, UserMinus, ClipboardCheck, LogOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
interface SolicitudAPI {
  id_solicitud: number;
  nombres: string;
  apellidos: string;
  dni: string;
  tipo_doc_siglas?: string;
  clasificacion: string;
  estado: string;
  fecha_creacion: string;
}

interface SolicitudRetiro {
  id: number;
  nombre: string;
  fechaSolicitud: string;
  deudaPendiente: number;
  estado: "Pendiente" | "Procesado";
}

// ---------------------------------------------------------------------------
// Datos estáticos de retiros (hasta que el backend esté listo)
// ---------------------------------------------------------------------------
const retirosIniciales: SolicitudRetiro[] = [
  { id: 1, nombre: "Roberto Sánchez Vargas", fechaSolicitud: "28-02-2026", deudaPendiente: 0, estado: "Pendiente" },
  { id: 2, nombre: "Ana Lucía Romero Díaz", fechaSolicitud: "01-03-2026", deudaPendiente: 450, estado: "Pendiente" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function clasificacionBadge(clasificacion: string) {
  switch (clasificacion) {
    case "Pagador":
      return <Badge className="bg-success text-success-foreground hover:bg-success/90">Pagador</Badge>;
    case "Renuente":
      return <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Renuente</Badge>;
    default:
      return <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">{clasificacion || "Esporádico"}</Badge>;
  }
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function JefeView() {
  const [pendientes, setPendientes] = useState<SolicitudAPI[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorLista, setErrorLista] = useState<string | null>(null);

  const [retiros, setRetiros] = useState<SolicitudRetiro[]>(retirosIniciales);

  // ── Modal de rechazo ──────────────────────────────────────────────────────
  const [rechazoDialog, setRechazoDialog] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<number | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [enviando, setEnviando] = useState(false);

  // ── Fetch solicitudes pendientes ──────────────────────────────────────────
  const fetchPendientes = async () => {
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
      if (!res.ok) throw new Error(`Error ${res.status}: no se pudo cargar las solicitudes.`);
      const data: SolicitudAPI[] = await res.json();
      setPendientes(data.filter((s) => s.estado === "Pendiente"));
    } catch (err) {
      setErrorLista(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setCargandoLista(false);
    }
  };

  useEffect(() => { fetchPendientes(); }, []);

  // ── Aprobar ───────────────────────────────────────────────────────────────
  const handleAprobar = async (id: number) => {
    setEnviando(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`https://api-poseidon.onrender.com/api/solicitudes/${id}/evaluar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ estado_nuevo: "Aprobado", observacion: null }),
      });
      if (res.status === 200) {
        setPendientes((prev) => prev.filter((s) => s.id_solicitud !== id));
        toast.success("Solicitud aprobada exitosamente.");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.mensaje ?? `Error ${res.status}: no se pudo aprobar.`);
      }
    } catch {
      toast.error("Error de red al intentar aprobar la solicitud.");
    } finally {
      setEnviando(false);
    }
  };

  // ── Abrir modal de rechazo ────────────────────────────────────────────────
  const abrirRechazo = (id: number) => {
    setSolicitudSeleccionada(id);
    setMotivoRechazo("");
    setRechazoDialog(true);
  };

  // ── Confirmar rechazo ─────────────────────────────────────────────────────
  const confirmarRechazo = async () => {
    if (!motivoRechazo.trim() || solicitudSeleccionada === null) return;
    setEnviando(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://api-poseidon.onrender.com/api/solicitudes/${solicitudSeleccionada}/evaluar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ estado_nuevo: "Rechazado", observacion: motivoRechazo.trim() }),
        }
      );
      if (res.status === 200) {
        setPendientes((prev) => prev.filter((s) => s.id_solicitud !== solicitudSeleccionada));
        setRechazoDialog(false);
        toast.error("Solicitud rechazada.");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.mensaje ?? `Error ${res.status}: no se pudo rechazar.`);
      }
    } catch {
      toast.error("Error de red al intentar rechazar la solicitud.");
    } finally {
      setEnviando(false);
    }
  };

  // ── Dar de baja (retiros — mock por ahora) ────────────────────────────────
  const handleDarDeBaja = (id: number) => {
    setRetiros((prev) => prev.map((r) => r.id === id ? { ...r, estado: "Procesado" as const } : r));
    toast.success("Socio dado de baja exitosamente.");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Aprobaciones y Retiros</h1>
      </div>

      {/* Bandeja de Aprobaciones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            Bandeja de Aprobaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Clasificación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargandoLista ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    Cargando solicitudes...
                  </TableCell>
                </TableRow>
              ) : errorLista ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-destructive py-10">
                    {errorLista}
                  </TableCell>
                </TableRow>
              ) : pendientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    No hay solicitudes pendientes.
                  </TableCell>
                </TableRow>
              ) : (
                pendientes.map((s) => (
                  <TableRow key={s.id_solicitud}>
                    <TableCell className="font-medium">{s.nombres} {s.apellidos}</TableCell>
                    <TableCell className="font-medium text-xs"><span className="text-muted-foreground mr-1">{s.tipo_doc_siglas || 'DNI'}</span>{s.dni}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.fecha_creacion ? new Date(s.fecha_creacion).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>{clasificacionBadge(s.clasificacion)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90 text-success-foreground gap-1.5"
                          onClick={() => handleAprobar(s.id_solicitud)}
                          disabled={enviando}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1.5"
                          onClick={() => abrirRechazo(s.id_solicitud)}
                          disabled={enviando}
                        >
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Liquidaciones y Retiros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LogOut className="h-4 w-4 text-muted-foreground" />
            Solicitudes de Retiro Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Socio</TableHead>
                <TableHead>Fecha de Solicitud</TableHead>
                <TableHead>Deuda Pendiente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retiros.map((r) => {
                const tieneDeuda = r.deudaPendiente > 0;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.nombre}</TableCell>
                    <TableCell>{r.fechaSolicitud}</TableCell>
                    <TableCell>
                      <span className={tieneDeuda ? "text-destructive font-semibold" : "text-success font-semibold"}>
                        S/ {r.deudaPendiente.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {tieneDeuda
                        ? <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Con Deuda</Badge>
                        : <Badge className="bg-success text-success-foreground hover:bg-success/90">Sin Deuda</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      {r.estado === "Procesado" ? (
                        <span className="text-xs text-muted-foreground italic">Procesado</span>
                      ) : tieneDeuda ? (
                        <Button size="sm" variant="outline" disabled className="gap-1.5">
                          <Lock className="h-3.5 w-3.5" />
                          Dar de Baja
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleDarDeBaja(r.id)}
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                          Dar de Baja
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Rechazo */}
      <Dialog open={rechazoDialog} onOpenChange={(v) => { if (!v) setRechazoDialog(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-destructive" />
              Motivo de Rechazo
            </DialogTitle>
            <DialogDescription>
              Ingrese el motivo de rechazo. Este documento es obligatorio según el reglamento del club.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describa el motivo de rechazo de la solicitud..."
            value={motivoRechazo}
            onChange={(e) => setMotivoRechazo(e.target.value)}
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRechazoDialog(false)} disabled={enviando}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarRechazo}
              disabled={!motivoRechazo.trim() || enviando}
            >
              {enviando ? "Enviando..." : "Confirmar Rechazo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
