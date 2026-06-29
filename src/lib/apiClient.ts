const BASE_URL = "https://api-poseidon.onrender.com";

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {

  // ── INTERCEPTOR DE ENTRADA (Request) ──────────────────────────────────────
  // 1. Completa la URL automáticamente
  const url = `${BASE_URL}${endpoint}`;

  // 2. Obtiene el token del localStorage
  const token = localStorage.getItem("accessToken");

  // 3. Arma las cabeceras automáticamente
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  // ── PETICIÓN ──────────────────────────────────────────────────────────────
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // ── INTERCEPTOR DE SALIDA (Response) ──────────────────────────────────────
  // Si el token expiró o la sesión no es válida → captura el 401 globalmente
  if (response.status === 401) {
    console.warn("Sesión expirada o token inválido. Redirigiendo al login...");
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  }

  return response;
}
