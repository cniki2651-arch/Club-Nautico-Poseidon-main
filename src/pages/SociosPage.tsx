import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
// Helpers de badges
// ---------------------------------------------------------------------------
function categoriaBadge(cat: string) {
  switch (cat) {
    case "Pagador":
      return <Badge className="bg-success text-success-foreground hover:bg-success/90">Pagador</Badge>;
    case "Renuente":
      return <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Renuente</Badge>;
    default:
      return <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">Esporádico</Badge>;
  }
}

function estadoBadge(estado: string) {
  return estado === "Al día"
    ? <Badge className="bg-success text-success-foreground hover:bg-success/90">Al día</Badge>
    : <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Moroso</Badge>;
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function SociosPage() {
  const [socios, setSocios]               = useState<SocioAPI[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorLista, setErrorLista]       = useState<string | null>(null);
  const [search, setSearch]               = useState("");

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

  useEffect(() => { fetchSocios(); }, []);

  const filtered = socios.filter((s) =>
    `${s.nombres} ${s.apellidos}`.toLowerCase().includes(search.toLowerCase()) ||
    s.dni.includes(search)
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Socios</h1>
        <p className="text-muted-foreground text-sm">Directorio de socios del club</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o Documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ingreso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargandoLista ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    Cargando socios...
                  </TableCell>
                </TableRow>
              ) : errorLista ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-destructive py-10">
                    {errorLista}
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    No se encontraron socios.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.id_socio}>
                    <TableCell className="font-medium">{s.nombres} {s.apellidos}</TableCell>
                    <TableCell className="font-medium text-xs"><span className="text-muted-foreground mr-1">{s.tipo_doc_siglas || 'DNI'}</span>{s.dni}</TableCell>
                    <TableCell>{categoriaBadge(s.clasificacion)}</TableCell>
                    <TableCell>{estadoBadge(s.estado_membresia)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatFecha(s.fecha_ingreso)}</TableCell>
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
