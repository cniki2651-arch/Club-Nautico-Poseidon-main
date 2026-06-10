import { useState, useEffect } from "react";
import { UserPlus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
interface TripulanteAPI {
  id_tripulante: number;
  nombres: string;
  apellidos: string;
  dni: string;
  tipo_doc_siglas?: string;
  rol: string;
  licencia: string | null;
  estado: string;
}

const ROLES = ["Capitán", "Patrón de Yate", "Marinero", "Motorista", "Personal de Servicio"] as const;

const formVacio = {
  nombres: "",
  apellidos: "",
  dni: "",
  rol: "",
  licencia: "",
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function FormularioTripulante() {
  const { toast } = useToast();

  // Estados
  const [tripulantes, setTripulantes] = useState<TripulanteAPI[]>([]);
  const [cargando, setCargando]       = useState(true);
  const [enviando, setEnviando]       = useState(false);
  const [form, setForm]               = useState(formVacio);
  const [idTipoDoc, setIdTipoDoc]     = useState(1);

  // ── Fetch Tripulantes ─────────────────────────────────────────────────────
  const fetchTripulantes = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("https://api-poseidon.onrender.com/api/tripulantes", {
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        const data = await res.json();
        setTripulantes(data);
      }
    } catch (error) {
      console.error("Error al cargar tripulantes", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchTripulantes();
  }, []);

  // ── Registrar Tripulante ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombres.trim() || !form.apellidos.trim() || !form.dni.trim() || !form.rol.trim()) {
      toast({ title: "Error", description: "Completa los campos obligatorios.", variant: "destructive" });
      return;
    }

    setEnviando(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("https://api-poseidon.onrender.com/api/tripulantes/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          id_tipo_doc: idTipoDoc,
          nombres: form.nombres,
          apellidos: form.apellidos,
          dni: form.dni.trim().toUpperCase(),
          rol: form.rol,
          licencia: form.licencia || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok || res.status === 201) {
        toast({ title: "Tripulante registrado", description: `${form.nombres} ha sido autorizado por el club.` });
        setForm(formVacio);
        setIdTipoDoc(1);
        fetchTripulantes();
      } else {
        toast({ title: "Error", description: data.mensaje || "Error al registrar.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error de red", description: "Revisa tu conexión.", variant: "destructive" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Formulario ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            Registrar Personal de Navegación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
            <div className="space-y-1.5 lg:col-span-2">
              <Label>Nombres *</Label>
              <Input placeholder="Ej: Carlos" value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <Label>Apellidos *</Label>
              <Input placeholder="Ej: Mendoza" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
            </div>

            {/* Tipo de documento */}
            <div className="space-y-1.5">
              <Label>Tipo de Doc.</Label>
              <Select value={String(idTipoDoc)} onValueChange={(v) => setIdTipoDoc(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">DNI</SelectItem>
                  <SelectItem value="2">CE</SelectItem>
                  <SelectItem value="3">PAS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Número de documento */}
            <div className="space-y-1.5">
              <Label>Número de Documento *</Label>
              <Input
                type="text"
                placeholder={idTipoDoc === 1 ? "Ej: 12345678" : idTipoDoc === 2 ? "Ej: 000123456" : "Ej: AB123456"}
                value={form.dni}
                onChange={(e) => setForm({ ...form, dni: e.target.value.toUpperCase() })}
                autoComplete="off"
                spellCheck={false}
                required
              />
            </div>

            {/* Rol */}
            <div className="space-y-1.5">
              <Label>Rol *</Label>
              <Select value={form.rol} onValueChange={(v) => setForm({ ...form, rol: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 lg:col-span-2">
              <Label>Licencia (Opcional)</Label>
              <Input placeholder="N° Carnet (Si aplica)" value={form.licencia} onChange={(e) => setForm({ ...form, licencia: e.target.value })} />
            </div>
            <div className="lg:col-span-4 flex justify-end">
              <Button type="submit" disabled={enviando || !form.rol} className="gap-2 bg-blue-900 text-white w-full sm:w-auto">
                <ShieldCheck className="h-4 w-4" />
                {enviando ? "Guardando..." : "Registrar y Autorizar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Tabla de tripulantes ────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tripulación Autorizada</CardTitle>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <p className="text-sm text-muted-foreground text-center py-6">Cargando registros...</p>
          ) : tripulantes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No hay tripulantes registrados aún.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Apellidos y Nombres</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Licencia</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tripulantes.map((t) => (
                  <TableRow key={t.id_tripulante}>
                    <TableCell className="font-medium">{t.apellidos}, {t.nombres}</TableCell>
                    <TableCell className="font-medium text-xs"><span className="text-muted-foreground mr-1">{t.tipo_doc_siglas || 'DNI'}</span>{t.dni}</TableCell>
                    <TableCell>{t.rol}</TableCell>
                    <TableCell className="text-muted-foreground">{t.licencia || "—"}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {t.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}