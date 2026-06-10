import { useState, useEffect } from "react";
import { ClipboardList, Users, AlertTriangle, Eye, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import ModalNuevaSolicitud from "@/components/ModalNuevaSolicitud";

// ---------------------------------------------------------------------------
// Tipo que devuelve el backend
// ---------------------------------------------------------------------------
interface SolicitudAPI {
  id_solicitud: number;
  dni: string;
  tipo_doc_siglas?: string;
  nombres: string;
  apellidos: string;
  clasificacion: string;
  estado: string;
  fecha_creacion: string;
  observacion: string | null;
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function SecretariaView() {
  const [solicitudes, setSolicitudes] = useState<SolicitudAPI[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorLista, setErrorLista] = useState<string | null>(null);
  const [metricas, setMetricas] = useState({
    solicitudesEnEspera: 0,
    sociosActivos: 0,
    alertas: 0,
  });
  const [motivoDialog, setMotivoDialog] = useState(false);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string>("");

  // ── Cargar métricas ───────────────────────────────────────────────────────
  const fetchMetricas = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("https://api-poseidon.onrender.com/api/dashboard/secretaria", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      setMetricas({
        solicitudesEnEspera: data.solicitudesEnEspera ?? 0,
        sociosActivos: data.sociosActivos ?? 0,
        alertas: data.alertas ?? 0,
      });
    } catch { /* silencioso */ }
  };

  // ── Cargar solicitudes ────────────────────────────────────────────────────
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
      if (!res.ok) throw new Error(`Error ${res.status}: no se pudo cargar las solicitudes.`);
      const data: SolicitudAPI[] = await res.json();
      setSolicitudes(data);
    } catch (err) {
      setErrorLista(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setCargandoLista(false);
    }
  };

  useEffect(() => {
    fetchMetricas();
    fetchSolicitudes();
  }, []);

  // ── Generar PDF de notificación de rechazo ────────────────────────────────
  const generarPDF = (s: SolicitudAPI) => {
    const fecha = new Date().toLocaleDateString("es-PE", {
      day: "2-digit", month: "long", year: "numeric",
    });
    const logoUrl = `${window.location.origin}/logo.png`;
    const motivo = s.observacion ?? "Sin observación registrada.";

    const html = [
      "<!DOCTYPE html>",
      '<html lang="es">',
      "<head>",
      '  <meta charset="UTF-8" />',
      `  <title>Notificacion_Rechazo_${s.tipo_doc_siglas || 'DNI'}_${s.dni}</title>`,
      "  <style>",
      "    @media print {",
      "      @page { size: A4; margin: 0; }",
      "      body  { padding: 2cm !important; box-sizing: border-box; }",
      "    }",
      "    body {",
      "      font-family: Arial, sans-serif; font-size: 11pt;",
      "      color: #1a1a1a; line-height: 1.4; padding: 2cm; box-sizing: border-box;",
      "    }",
      "    .header { text-align: center; border-bottom: 2px solid #1a3a5c;",
      "              padding-bottom: 12px; margin-bottom: 20px; }",
      "    .header img { max-width: 120px; margin: 0 auto 10px; display: block; }",
      "    .header h2  { margin: 4px 0 0; font-size: 13pt; color: #1a3a5c; letter-spacing: 1px; }",
      "    .header p   { margin: 2px 0; font-size: 10pt; color: #555; }",
      "    .fecha      { text-align: right; font-size: 10pt; color: #555; margin-bottom: 20px; }",
      "    h1 { font-size: 12pt; text-align: center; text-transform: uppercase;",
      "         letter-spacing: 1.5px; color: #1a3a5c; margin-bottom: 20px; }",
      "    .cuerpo { margin-bottom: 16px; }",
      "    .motivo { border: 1.5px solid #c0392b; border-radius: 6px;",
      "              padding: 12px 16px; background: #fff5f5; margin: 16px 0; }",
      "    .motivo p { margin: 0; font-weight: bold; color: #c0392b; font-size: 10.5pt; text-align: justify; }",
      "    .cierre   { margin-top: 20px; }",
      "    .firma-manuscrita {",
      "      font-family: 'Brush Script MT', 'Lucida Handwriting', cursive;",
      "      font-size: 26px; color: #1a365d; margin: 30px 0 8px 0;",
      "    }",
      "    .firma-cargo {",
      "      border-top: 1px solid #aaa; padding-top: 6px;",
      "      width: 220px; font-size: 9pt; color: #555;",
      "    }",
      "  </style>",
      "</head>",
      "<body>",
      "  <div class=\"header\">",
      `    <img src="${logoUrl}" alt="Logo Club Náutico Poseidón" />`,
      "    <h2>CLUB NÁUTICO POSEIDÓN DEL PERÚ</h2>",
      "    <p>Secretaría de Admisiones</p>",
      "  </div>",
      "",
      `  <div class="fecha">Lima, ${fecha}</div>`,
      "",
      "  <h1>Notificación de Observación de Solicitud</h1>",
      "",
      "  <div class=\"cuerpo\">",
      `    <p>Estimado(a) <strong>${s.nombres} ${s.apellidos}</strong>,</p>`,
      "    <p>",
      "      Le informamos que su solicitud de inscripción al Club Náutico Poseidón del Perú,",
      `      presentada con ${s.tipo_doc_siglas || 'DNI'} <strong>${s.dni}</strong>, ha sido evaluada por la Jefatura de`,
      "      Atención al Cliente. Lamentablemente, la solicitud no ha podido ser aprobada en",
      "      esta instancia por el siguiente motivo:",
      "    </p>",
      "  </div>",
      "",
      "  <div class=\"motivo\">",
      `    <p>${motivo}</p>`,
      "  </div>",
      "",
      "  <div class=\"cierre\">",
      "    <p>",
      "      Le invitamos a subsanar el motivo indicado y presentar nuevamente su solicitud",
      "      para continuar con su proceso de inscripción. Nuestro equipo de Secretaría",
      "      estará disponible para orientarle en los pasos a seguir.",
      "    </p>",
      "    <p>Atentamente,</p>",
      "  </div>",
      "",
      "  <div class=\"firma-manuscrita\">La Jefatura</div>",
      "  <div class=\"firma-cargo\">",
      "    Secretaría de Admisiones<br/>",
      "    Club Náutico Poseidón del Perú",
      "  </div>",
      "</body>",
      "</html>",
    ].join("\n");

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    iframe.contentDocument?.open();
    iframe.contentDocument?.write(html);
    iframe.contentDocument?.close();

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    };
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Secretaría</h1>
        <p className="text-muted-foreground text-sm">Gestión de inscripciones y solicitudes de nuevos socios</p>
      </div>

      <ModalNuevaSolicitud
        onSuccess={() => { fetchMetricas(); fetchSolicitudes(); }}
        triggerSize="lg"
        triggerClassName="gap-2 text-base px-6 py-5"
      />

      {/* ── Métricas ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Solicitudes en Espera</p>
                <p className="text-2xl font-bold text-foreground">{metricas.solicitudesEnEspera}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-warning/10">
                <ClipboardList className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Socios Activos</p>
                <p className="text-2xl font-bold text-foreground">{metricas.sociosActivos}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold text-foreground">{metricas.alertas}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabla de solicitudes ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Últimas Solicitudes Ingresadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Clasificación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargandoLista ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    Cargando solicitudes
                  </TableCell>
                </TableRow>
              ) : errorLista ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-destructive py-10">
                    {errorLista}
                  </TableCell>
                </TableRow>
              ) : solicitudes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No hay solicitudes registradas.
                  </TableCell>
                </TableRow>
              ) : (
                solicitudes.map((s) => (
                  <TableRow key={s.id_solicitud}>
                    <TableCell className="font-medium text-xs"><span className="text-muted-foreground mr-1">{s.tipo_doc_siglas || 'DNI'}</span>{s.dni}</TableCell>
                    <TableCell className="font-medium">{s.nombres} {s.apellidos}</TableCell>
                    <TableCell>
                      {s.clasificacion === "Pagador" ? (
                        <Badge className="bg-success text-success-foreground hover:bg-success/90">Pagador</Badge>
                      ) : s.clasificacion === "Renuente" ? (
                        <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Renuente</Badge>
                      ) : (
                        <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">
                          {s.clasificacion || "Esporádico"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {s.estado === "Rechazado" ? (
                        <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Rechazado</Badge>
                      ) : s.estado === "Aprobado" ? (
                        <Badge className="bg-success text-success-foreground hover:bg-success/90">Aprobado</Badge>
                      ) : (
                        <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">{s.estado}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.fecha_creacion ? new Date(s.fecha_creacion).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {s.estado === "Rechazado" && s.observacion && (
                        <div className="flex items-center justify-end gap-1">
                          {/* Ver motivo */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            aria-label="Ver motivo de rechazo"
                            onClick={() => { setMotivoSeleccionado(s.observacion!); setMotivoDialog(true); }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* Generar PDF */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label="Generar notificación PDF"
                            onClick={() => generarPDF(s)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de motivo de rechazo */}
      <Dialog open={motivoDialog} onOpenChange={setMotivoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-destructive" />
              Motivo de rechazo
            </DialogTitle>
            <DialogDescription>
              Copia este texto para notificar al postulante sobre el motivo de su rechazo.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm text-foreground leading-relaxed">
            {motivoSeleccionado}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
