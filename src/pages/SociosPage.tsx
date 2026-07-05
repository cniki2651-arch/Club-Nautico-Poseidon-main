import { useState, useEffect } from "react";
import { Search, LogOut, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ModalSolicitarRetiro from "@/components/ModalSolicitarRetiro";

// ---------------------------------------------------------------------------
// Tipo que devuelve el backend
// ---------------------------------------------------------------------------
interface SocioAPI {
  id_socio:         number;
  dni:              string;
  tipo_doc_siglas?: string;
  nombres:          string;
  apellidos:        string;
  clasificacion:    string;
  estado_membresia: string;
  fecha_ingreso:    string;
  en_proceso_retiro?: boolean;
}

// ---------------------------------------------------------------------------
// Helper: formatea ISO → DD/MM/YYYY
// ---------------------------------------------------------------------------
function formatFecha(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Helpers de badges de Clasificación
// ---------------------------------------------------------------------------
function categoriaBadge(cat: string) {
  switch (cat) {
    case "Pagador":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-none font-medium rounded-md">
          Pagador
        </Badge>
      );
    case "Renuente":
      return (
        <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-none font-medium rounded-md">
          Renuente
        </Badge>
      );
    default:
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-none font-medium rounded-md">
          {cat || "Esporádico"}
        </Badge>
      );
  }
}

// ---------------------------------------------------------------------------
// Helpers de badges de Estado
// ---------------------------------------------------------------------------
function estadoBadge(estado: string) {
  return estado === "Al día" ? (
    <Badge className="bg-emerald-600 text-white font-semibold px-2.5 py-0.5 rounded-md shadow-sm hover:bg-emerald-700 transition-colors">
      Al día
    </Badge>
  ) : (
    <Badge className="bg-red-600 text-white font-semibold px-2.5 py-0.5 rounded-md shadow-sm hover:bg-red-700 transition-colors">
      Moroso
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function SociosPage() {
  const [socios, setSocios]               = useState<SocioAPI[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorLista, setErrorLista]       = useState<string | null>(null);
  
  // Controles
  const [search, setSearch]               = useState("");
  const [porPagina, setPorPagina]         = useState(10);
  const [paginaActual, setPaginaActual]   = useState(1);

  // ── Cargar socios desde el backend ────────────────────────────────────────
  const fetchSocios = async () => {
    setCargandoLista(true);
    setErrorLista(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("https://api-poseidon.onrender.com/api/socios", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}: no se pudo cargar la lista.`);
      const data: SocioAPI[] = await res.json();
      setSocios(data);
    } catch (err) {
      setErrorLista(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setCargandoLista(false);
    }
  };

  useEffect(() => {
    fetchSocios();
  }, []);

  // Reiniciar a la página 1 cuando cambie la búsqueda o el tamaño de página
  useEffect(() => {
    setPaginaActual(1);
  }, [search, porPagina]);

  // Filtrado
  const filtered = socios.filter(
    (s) =>
      `${s.nombres} ${s.apellidos}`.toLowerCase().includes(search.toLowerCase()) ||
      s.dni.includes(search)
  );

  // Lógica Matemática de Paginación
  const totalRegistros = filtered.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / porPagina));
  const indiceInicio = (paginaActual - 1) * porPagina;
  const indiceFin = Math.min(indiceInicio + porPagina, totalRegistros);
  const sociosPaginados = filtered.slice(indiceInicio, indiceFin);

  const irAPagina = (pagina: number) => {
    if (pagina < 1 || pagina > totalPaginas) return;
    setPaginaActual(pagina);
  };

  const obtenerNumerosPagina = () => {
    const inicio = Math.max(1, paginaActual - 2);
    const fin = Math.min(totalPaginas, inicio + 4);
    const paginas = [];
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Socios</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Directorio de socios del club</p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Buscar Socios
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Selector "Mostrar X registros" */}
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Mostrar</span>
                <Select
                  value={String(porPagina)}
                  onValueChange={(val) => setPorPagina(Number(val))}
                >
                  <SelectTrigger className="w-16 h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 25].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>registros</span>
              </div>

              {/* Buscador */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre o Documento..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-rose-500"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/20 dark:bg-slate-950/20">
              <TableRow className="border-b border-slate-200 dark:border-slate-800">
                <TableHead className="font-bold text-xs pl-6 py-3">Documento</TableHead>
                <TableHead className="font-bold text-xs">Nombre Completo</TableHead>
                <TableHead className="font-bold text-xs">Categoría</TableHead>
                <TableHead className="font-bold text-xs">Estado</TableHead>
                <TableHead className="font-bold text-xs">Ingreso</TableHead>
                <TableHead className="font-bold text-xs text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargandoLista ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400 py-10 text-sm">
                    Cargando socios...
                  </TableCell>
                </TableRow>
              ) : errorLista ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-500 font-medium py-10 text-sm">
                    {errorLista}
                  </TableCell>
                </TableRow>
              ) : sociosPaginados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400 py-10 text-sm">
                    No se encontraron socios.
                  </TableCell>
                </TableRow>
              ) : (
                sociosPaginados.map((s) => (
                  <TableRow
                    key={s.id_socio}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <TableCell className="font-mono text-xs pl-6 py-4">
                      <span className="text-slate-400 mr-1.5 font-normal">
                        {s.tipo_doc_siglas || "DNI"}
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">
                        {s.dni}
                      </span>
                    </TableCell>
                    
                    <TableCell className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {s.nombres} {s.apellidos}
                    </TableCell>
                    
                    <TableCell>
                      {categoriaBadge(s.clasificacion)}
                    </TableCell>
                    
                    <TableCell>
                      {estadoBadge(s.estado_membresia)}
                    </TableCell>
                    
                    <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                      {formatFecha(s.fecha_ingreso)}
                    </TableCell>
                    
                    <TableCell className="text-right pr-6">
                      {s.en_proceso_retiro ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          className="gap-1.5 h-8 text-xs bg-slate-100 text-slate-400 border-none dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                        >
                          <Clock className="h-3.5 w-3.5 animate-pulse text-slate-400 dark:text-slate-500" />
                          En Proceso
                        </Button>
                      ) : (
                        <ModalSolicitarRetiro
                          idSocio={s.id_socio}
                          nombreSocio={`${s.nombres} ${s.apellidos}`}
                          onSuccess={fetchSocios}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 h-8 text-xs border-destructive text-destructive hover:bg-rose-600 hover:text-white dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                            >
                              <LogOut className="h-3.5 w-3.5" />
                              Baja
                            </Button>
                          }
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Barra de Paginación */}
          {!cargandoLista && !errorLista && totalRegistros > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mostrando registros del <span className="font-semibold">{indiceInicio + 1}</span> al{" "}
                <span className="font-semibold">{indiceFin}</span> de un total de{" "}
                <span className="font-semibold">{totalRegistros}</span> registros
              </p>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 h-8 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  onClick={() => irAPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Anterior
                </Button>

                {obtenerNumerosPagina().map((num) => (
                  <Button
                    key={num}
                    variant={num === paginaActual ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => irAPagina(num)}
                  >
                    {num}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 h-8 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  onClick={() => irAPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
