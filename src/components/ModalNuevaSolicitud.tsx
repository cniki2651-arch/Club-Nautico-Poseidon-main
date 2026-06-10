import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ModalNuevaSolicitudProps {
  /** Se llama cuando el POST fue exitoso, para que el padre recargue su tabla */
  onSuccess?: () => void;
  /** Variante del botón disparador (por defecto "default") */
  triggerVariant?: "default" | "outline" | "ghost";
  /** Tamaño del botón disparador (por defecto "default") */
  triggerSize?: "default" | "sm" | "lg" | "icon";
  /** Clases extra para el botón disparador */
  triggerClassName?: string;
}

// ---------------------------------------------------------------------------
// Formulario vacío
// ---------------------------------------------------------------------------
const formVacio = {
  dni:           "",
  nombres:       "",
  apellidos:     "",
  clasificacion: "",
  telefono:      "",
  correo:        "",
};

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function ModalNuevaSolicitud({
  onSuccess,
  triggerVariant   = "default",
  triggerSize      = "default",
  triggerClassName = "gap-2",
}: ModalNuevaSolicitudProps) {
  const [open, setOpen]         = useState(false);
  const [form, setForm]         = useState(formVacio);
  const [idTipoDoc, setIdTipoDoc] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();

  const handleChange = (campo: keyof typeof formVacio, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setForm(formVacio);
      setIdTipoDoc(1);
      setErrorMsg(null);
    }
  };

  // ── Validación dinámica por tipo de documento ─────────────────────────────
  const validarDocumento = (numero: string, tipo: number): string | null => {
    const limpio = numero.trim();
    if (!limpio) return "El número de documento no puede estar vacío.";
    if (tipo === 1) {
      // DNI: exactamente 8 dígitos numéricos
      if (!/^\d{8}$/.test(limpio)) return "El DNI debe tener exactamente 8 dígitos numéricos.";
    } else if (tipo === 2) {
      // CE: 9 a 12 caracteres alfanuméricos
      if (!/^[a-zA-Z0-9]{9,12}$/.test(limpio)) return "El Carné de Extranjería debe tener entre 9 y 12 caracteres alfanuméricos.";
    } else if (tipo === 3) {
      // PAS: alfanumérico (sin restricción de longitud fija)
      if (!/^[a-zA-Z0-9]{6,20}$/.test(limpio)) return "El Pasaporte debe ser alfanumérico (6–20 caracteres).";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar documento antes de llamar al backend
    const errorDoc = validarDocumento(form.dni, idTipoDoc);
    if (errorDoc) {
      setErrorMsg(errorDoc);
      return;
    }

    setCargando(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("https://api-poseidon.onrender.com/api/solicitudes/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id_tipo_doc:   idTipoDoc,
          dni:           form.dni.trim().toUpperCase(),
          nombres:       form.nombres,
          apellidos:     form.apellidos,
          clasificacion: form.clasificacion,
          telefono:      form.telefono,
          correo:        form.correo,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setForm(formVacio);
        setOpen(false);
        toast({
          title: "Solicitud enviada",
          description: "La solicitud de inscripción ha sido registrada correctamente.",
        });
        onSuccess?.();
      } else if (res.status === 400) {
        setErrorMsg(data.mensaje ?? "El documento ya se encuentra registrado.");
      } else {
        setErrorMsg(data.mensaje ?? `Error ${res.status}: no se pudo registrar la solicitud.`);
      }
    } catch {
      setErrorMsg("Error de red. Verifica tu conexión e intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} className={triggerClassName}>
          <Plus className="h-4 w-4" /> Nueva Solicitud
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud de Socio</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sol-nombres">Nombres</Label>
              <Input
                id="sol-nombres"
                placeholder="Ej. Juan Carlos"
                value={form.nombres}
                onChange={(e) => handleChange("nombres", e.target.value)}
                required
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sol-apellidos">Apellidos</Label>
              <Input
                id="sol-apellidos"
                placeholder="Ej. Pérez García"
                value={form.apellidos}
                onChange={(e) => handleChange("apellidos", e.target.value)}
                required
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Tipo de Documento + Número de Documento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sol-tipo-doc">Tipo de Documento</Label>
              <Select
                value={String(idTipoDoc)}
                onValueChange={(val) => setIdTipoDoc(Number(val))}
              >
                <SelectTrigger id="sol-tipo-doc">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">DNI (Documento Nacional de Identidad)</SelectItem>
                  <SelectItem value="2">CE (Carné de Extranjería)</SelectItem>
                  <SelectItem value="3">PAS (Pasaporte)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sol-dni">Número de Documento</Label>
              <Input
                id="sol-dni"
                placeholder={
                  idTipoDoc === 1 ? "Ej. 12345678" :
                  idTipoDoc === 2 ? "Ej. 000123456" :
                  "Ej. AB123456"
                }
                value={form.dni}
                onChange={(e) => handleChange("dni", e.target.value.toUpperCase())}
                required
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Teléfono y Correo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sol-telefono">Teléfono</Label>
              <Input
                id="sol-telefono"
                placeholder="987654321"
                value={form.telefono}
                onChange={(e) => handleChange("telefono", e.target.value.replace(/\D/g, ""))}
                autoComplete="tel"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sol-correo">Correo electrónico</Label>
              <Input
                id="sol-correo"
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.correo}
                onChange={(e) => handleChange("correo", e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Clasificación de Antecedentes */}
          <div className="space-y-1.5">
            <Label htmlFor="sol-clasificacion">Clasificación de Antecedentes</Label>
            <Select
              value={form.clasificacion}
              onValueChange={(val) => handleChange("clasificacion", val)}
            >
              <SelectTrigger id="sol-clasificacion">
                <SelectValue placeholder="Seleccionar clasificación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pagador">Pagador</SelectItem>
                <SelectItem value="Esporádico">Esporádico</SelectItem>
                <SelectItem value="Renuente">Renuente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3">
              <p className="text-sm text-destructive font-medium" role="alert">{errorMsg}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={cargando}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={cargando || !form.clasificacion}>
              {cargando ? "Enviando" : "Enviar Solicitud"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
