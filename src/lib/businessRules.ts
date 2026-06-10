import type { Socio, Embarcacion, Zarpe } from "@/data/mockData";

/** Verifica si un DNI ya existe en la lista de socios */
export function dniEsDuplicado(dni: string, socios: Socio[]): boolean {
  return socios.some((s) => s.dni === dni);
}

/** Un zarpe es permitido si el socio está al día, la embarcación está validada por capitanía */
export function zarpeEsPermitido(
  socioId: string,
  embarcacionId: string,
  socios: Socio[],
  embarcaciones: Embarcacion[]
): { permitido: boolean; razon?: string } {
  const socio = socios.find((s) => s.id === socioId);
  if (!socio) return { permitido: false, razon: "Socio no encontrado" };
  if (socio.estado === "Moroso")
    return { permitido: false, razon: `Zarpe Bloqueado: ${socio.nombre} mantiene deuda pendiente` };

  const emb = embarcaciones.find((e) => e.id === embarcacionId);
  if (!emb) return { permitido: false, razon: "Embarcación no encontrada" };
  if (emb.validacion === "Pendiente")
    return { permitido: false, razon: "La embarcación no tiene validación de Capitanía de Puerto" };

  return { permitido: true };
}

/** Determina el estado financiero de un socio según su deuda total */
export function determinarEstadoFinanciero(total: number, pagado: number): "Al día" | "Moroso" {
  return pagado >= total ? "Al día" : "Moroso";
}

/** Calcula el monto de cada cuota dado el total de la deuda y el número de cuotas */
export function calcularMontoCuota(totalDeuda: number, numeroCuotas: number): number {
  if (numeroCuotas <= 0) return 0;
  return parseFloat((totalDeuda / numeroCuotas).toFixed(2));
}

/** Calcula los intereses moratorios aplicando la tasa SBS mensual */
export function calcularInteresesMoratorios(deuda: number, tasaMensual: number): number {
  return parseFloat(((deuda * tasaMensual) / 100).toFixed(2));
}
