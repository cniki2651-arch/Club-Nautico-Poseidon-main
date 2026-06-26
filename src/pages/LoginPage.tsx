import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"; 
import { useRole } from "@/contexts/RoleContext";
import { useToast } from "@/hooks/use-toast";


const API_URL = `${import.meta.env.VITE_API_URL}/api/auth/login`;

export default function LoginPage() {
  const { setCurrentRole } = useRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          correo: email,       
          contrasena: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
      
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("id_rol", String(data.usuario.id_rol));
        
        
        const rolesMap: Record<number, "Jefe" | "Secretaria" | "Naviero" | "Finanzas" | "Cobranza"> = {
          1: "Jefe",
          2: "Secretaria",
          3: "Naviero",
          4: "Finanzas",
          5: "Cobranza"
        };

        
        const roleName = rolesMap[data.usuario.id_rol];

        if (roleName) {
          setCurrentRole(roleName); 
        }
        toast({
          title: "¡Bienvenido a bordo!",
          description: `Has ingresado como ${data.usuario.nombres}`,
        });

        
        navigate("/dashboard");
      } else {
        
        toast({
          title: "Error de acceso",
          description: data.mensaje || "Credenciales incorrectas.",
          variant: "destructive",
        });
        setPassword(""); 
      }
    } catch (error) {
      
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor de Poseidón.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      
      {/* 1. VIDEO DE FONDO */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/veleros.mp4" type="video/mp4" />
      </video>

      {/* 2. OVERLAY */}
      <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-[2px]" />

     {/* BOTÓN VOLVER REDISEÑADO */}
      <motion.button
        onClick={() => navigate("/")}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 text-xs font-semibold text-sky-100 bg-sky-500/15 hover:bg-sky-500/30 border border-sky-400/20 hover:text-white rounded-full backdrop-blur-md transition-all duration-300 group shadow-lg shadow-black/10"
      >
        <ArrowLeft className="h-3.5 w-3.5 transform group-hover:-translate-x-1 transition-transform duration-300 text-sky-400 group-hover:text-sky-300" />
        <span>Volver al Inicio</span>
      </motion.button>

      {/* 3. CUADRO DE LOGIN */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          
          <div className="bg-blue-950 py-8 flex flex-col items-center text-center">
            <img src="/logo.png" alt="Logo" className="h-24 w-24 object-contain mb-4" />
            <h1 className="text-white text-2xl font-bold font-londrina tracking-wide">
              Club Náutico Poseidón
            </h1>
            <p className="text-blue-300 text-[10px] uppercase tracking-[0.3em] mt-1">
              Sistema Interno de Gestión
            </p>
          </div>

          <div className="p-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-800">Bienvenido</h2>
              <p className="text-slate-500 text-sm">Ingresa tus credenciales oficiales</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase ml-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm"
                    placeholder="ejemplo@cnposeidon.pe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase ml-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-950 text-white py-3 rounded-xl font-bold hover:bg-blue-900 active:scale-[0.97] transition-all duration-300 ease-in-out shadow-lg shadow-blue-950/20 hover:shadow-xl mt-2 disabled:bg-blue-950/40 disabled:cursor-not-allowed uppercase tracking-wider text-sm flex items-center justify-center"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 animate-pulse">Conectando...</span>
                ) : (
                  "Ingresar al Panel"
                )}
              </button>
             </form>
            
            <p className="text-center text-[10px] text-slate-400 mt-8 leading-tight">
              Acceso restringido a personal autorizado.
              <br />
              © 2026 Club Poseidón
            </p>
          </div>
        </div>
      </motion.div>

      {/* EFECTO DE OLAS ANIMADAS EN EL FONDO */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] z-0 opacity-20 pointer-events-none">
        <motion.svg 
          animate={{ x: [-100, 0, -100] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-[200%] h-[60px] text-sky-400"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C26.9,4.75,55.05,8.12,83,11.23,158,19.62,233.17,23.3,321.39,56.44Z" fill="currentColor"></path>
        </motion.svg>
      </div>

    </div>
  );
}