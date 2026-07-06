import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Anchor,
  Award,
  Ship,
  GraduationCap,
  Waves,
  Phone,
  Mail,
  MapPin,
  Instagram,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";


import anclas from "@/assets/anclas.jpeg";
import aboutUs from "@/assets/about-us.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

const navLinks = ["Inicio", "Nosotros", "Servicios", "Galería", "Contacto"];

const services = [
  { 
    icon: Award, 
    title: "Membresía Exclusiva", 
    desc: "Acceso a instalaciones premium y beneficios únicos para socios y sus familias.",
    image: gallery4 
  },
  { 
    icon: Ship, 
    title: "Radas y Amarres de Seguridad", 
    desc: "Espacios de fondeo seguros y amarres modernos para todo tipo de embarcaciones.",
    image: gallery1 
  },
  { 
    icon: GraduationCap, 
    title: "Escuela de Navegación y Buceo", 
    desc: "Cursos certificados para principiantes y avanzados con instructores profesionales.",
    image: gallery6 
  },
  { 
    icon: Waves, 
    title: "Zonas de Recreación", 
    desc: "Piscinas, cafetería gourmet y áreas sociales con vista al mar.",
    image: gallery5 
  },
];

const galleryImages = [
  { src: gallery1, alt: "Velero en el océano", label: "Embarcaciones" },
  { src: gallery2, alt: "Muelle del club", label: "Muelles" },
  { src: gallery3, alt: "Restaurante del club", label: "Restaurante" },
  { src: gallery4, alt: "Evento social", label: "Eventos" },
  { src: gallery5, alt: "Piscina del club", label: "Recreación" },
  { src: gallery6, alt: "Escuela de buceo", label: "Buceo" },
];

// Solo letras (con tildes y ñ) y espacios
const NOMBRE_REGEX = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]*$/;

const LandingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [form, setForm] = useState({ nombre: "", correo: "", mensaje: "" });
  const [nombreError, setNombreError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFiltrado = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, "");
    setForm({ ...form, nombre: valorFiltrado });
    setNombreError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nombreLimpio = form.nombre.trim();
    const esNombreValido = NOMBRE_REGEX.test(nombreLimpio) && nombreLimpio.length > 0;

    if (!esNombreValido) {
      setNombreError("El nombre solo puede contener letras y espacios.");
      toast({
        title: "Nombre inválido",
        description: "Por favor ingresa un nombre válido (solo letras).",
        variant: "destructive",
      });
      return;
    }

    setNombreError("");
    setEnviando(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo enviar el mensaje.");
      }

      toast({ title: "Mensaje enviado", description: "Nos pondremos en contacto contigo pronto." });
      setForm({ nombre: "", correo: "", mensaje: "" });
    } catch (error) {
      toast({
        title: "Error al enviar",
        description: error instanceof Error ? error.message : "Intenta más tarde.",
        variant: "destructive",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen scroll-smooth">
      {/* HEADER — Azul Marino profundo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-950/95 backdrop-blur-md border-b border-blue-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
          <button onClick={() => scrollTo("inicio")} className="flex items-center gap-2">
           <img src="/logo.png" alt="Logo Poseidón" className="h-16 w-16 object-contain" />
            <span className="font-bold text-lg text-white hidden sm:inline">Club Náutico Poseidón</span>
          </button>

    <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <button
                key={l}
                onClick={() => scrollTo(l.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))}
                className="text-xs font-semibold text-sky-100 bg-sky-500/15 hover:bg-sky-500/30 px-4 py-2 rounded-full border border-sky-400/20 hover:text-white transition-all duration-300 shadow-sm"
              >
                {l}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="hidden sm:inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            >
              Iniciar Sesión
            </button>
            <button className="md:hidden text-white" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t border-blue-900 bg-blue-950 px-4 pb-4 space-y-2">
            {navLinks.map((l) => (
              <button
                key={l}
                onClick={() => scrollTo(l.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))}
                className="block w-full text-left py-2 text-sm font-medium text-blue-200 hover:text-sky-300"
              >
                {l}
              </button>
            ))}
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full mt-2 h-9 rounded-md text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        )}
      </header>

      {/* HERO — Video animado con Overlay azul oscuro */}
      <section id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden">
        
        {/* VIDEO DE FONDO */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
        >
          {/* Video en la carpeta "public" con este nombre */}
          <source src="/veleros.mp4" type="video/mp4" />
        </video>

        {/* Gradiente original */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-900/50 to-blue-950/80" />
        
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-4 drop-shadow-lg">
            Exclusividad y Pasión por el Mar
          </h1>
          <p className="text-lg sm:text-xl text-blue-100/90 mb-8">
            Únete al Club Náutico Poseidón del Perú
          </p>
          <button
            onClick={() => scrollTo("servicios")}
            className="inline-flex items-center gap-2 h-11 px-8 rounded-md text-sm font-medium border-2 border-white text-white bg-transparent hover:bg-white hover:text-blue-900 transition-colors"
          >
            Conoce más <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

     
      {/* NOSOTROS — Fondo con textura de anclas */}
      <section id="nosotros" className="relative py-20 px-4 bg-blue-950 overflow-hidden">
        
        {/* Capa de textura — Aumentamos opacidad a 10 para que sea visible */}
        <div 
          className="absolute inset-0 opacity-10 bg-repeat bg-center rotate-6 pointer-events-none" 
          style={{ backgroundImage: `url(${anclas})`, backgroundSize: '250px' }}
        />
        
        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-10 bg-amber-400 rounded-full" />
              <h2 className="text-3xl font-bold text-white">Sobre Nosotros</h2>
            </div>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Fundado en 1965, el Club Náutico Poseidón del Perú es una institución de prestigio ubicada en el puerto del Callao, 
              dedicada a la promoción del deporte náutico y la vida social de sus asociados.
            </p>
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-900/60 border border-blue-700 p-5 shadow-lg shadow-black/10">
                <h3 className="font-semibold text-amber-400 mb-1.5">Misión</h3>
                <p className="text-sm text-blue-100 leading-relaxed">Promover el deporte náutico y la exclusividad entre nuestros socios, garantizando servicios de primer nivel.</p>
              </div>
              <div className="rounded-lg bg-blue-900/60 border border-blue-700 p-5 shadow-lg shadow-black/10">
                <h3 className="font-semibold text-amber-400 mb-1.5">Visión</h3>
                <p className="text-sm text-blue-100 leading-relaxed">Ser el club náutico líder del Pacífico, reconocido por su tradición, calidad y excelencia.</p>
              </div>
            </div>
          </div>
          
          <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-2xl ring-4 ring-amber-400/20">
         <video autoPlay loop muted playsInline className="w-full h-full object-cover">
    <source src="/nosotros.mp4" type="video/mp4" />
    Tu navegador no soporta video.
      </video>
        </div>
        </div> 
      </section>

     {/* SERVICIOS  */}
<section id="servicios" className="py-20 px-4 bg-sky-50">
  <div className="max-w-6xl mx-auto text-center mb-12">
    <div className="flex items-center justify-center gap-3 mb-3">
      <div className="h-1 w-10 bg-[#cc9a1b] rounded-full" />
      <h2 className="text-3xl font-bold text-blue-900">Nuestros Servicios</h2>
      <div className="h-1 w-10 bg-[#cc9a1b] rounded-full" />
    </div>
    <p className="text-blue-700/70 max-w-xl mx-auto">Todo lo que necesitas para disfrutar del mar con seguridad y confort.</p>
  </div>

  <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {services.map((s) => (
      <Card 
        key={s.title} 
        className="group relative text-center border-0 shadow-xl overflow-hidden rounded-xl h-[320px] transition-all duration-500 ease-out transform hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-blue-900/30"
      >
        {/* IMAGEN DE FONDO: */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
          style={{ backgroundImage: `url(${s.image})` }}
        />

        {/* CAPA (OVERLAY): Filtro translúcido que cambia de color al hacer hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/95 to-white/90 group-hover:from-blue-950/90 group-hover:via-blue-950/85 group-hover:to-blue-900/90 transition-all duration-500" />

        {/* CONTENIDO DE LA TARJETA: Todo el texto cambia a blanco dinámicamente */}
        <CardContent className="relative z-10 h-full pt-8 pb-6 px-5 flex flex-col items-center justify-between gap-2">
          
          {/* Contenedor del ícono */}
          <div className="h-14 w-14 rounded-full bg-blue-50/80 flex items-center justify-center transition-all duration-300 group-hover:bg-[#cc9a1b] group-hover:scale-110 shadow-md">
            <s.icon className="h-7 w-7 text-[#cc9a1b] transition-colors duration-300 group-hover:text-white" />
          </div>
          
          {/* Bloque de Texto */}
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-blue-900 text-lg transition-colors duration-300 group-hover:text-amber-400">
              {s.title}
            </h3>
            <p className="text-sm text-blue-700/70 font-medium transition-colors duration-300 group-hover:text-white/90 leading-relaxed">
              {s.desc}
            </p>
          </div>

        </CardContent>
      </Card>
    ))}
  </div>
</section>

      {/* GALERÍA — Fondo blanco con toque azul */}
      <section id="galeria" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-1 w-10 bg-amber-400 rounded-full" />
            <h2 className="text-3xl font-bold text-blue-900">Galería</h2>
            <div className="h-1 w-10 bg-amber-400 rounded-full" />
          </div>
          <p className="text-blue-700/70">Conoce nuestras instalaciones y actividades.</p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((img) => (
            <div key={img.label} className="group relative overflow-hidden rounded-xl">
              <img src={img.src} alt={img.alt} className="w-full h-48 sm:h-56 object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" width={640} height={512} />
              <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/50 transition-colors flex items-end">
                <span className="text-white font-medium text-sm px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    {/* CONTACTO — Fondo Azul Marino */}
      <section id="contacto" className="py-20 px-4 bg-blue-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Columna Izquierda: Formulario dentro de un contenedor azulito clarito */}
          <div className="bg-sky-500/10 border border-sky-400/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-10 bg-amber-400 rounded-full" />
              <h2 className="text-3xl font-bold text-white">Contáctanos</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <Input 
                  placeholder="Nombre completo" 
                  value={form.nombre} 
                  onChange={handleNombreChange} 
                  required 
                  maxLength={60}
                  aria-invalid={!!nombreError}
                  className={`bg-white text-blue-900 border-0 placeholder:text-blue-400 h-11 ${
                    nombreError ? "ring-2 ring-red-500" : ""
                  }`}
                />
                {nombreError && (
                  <p className="mt-1.5 text-xs font-medium text-red-300">{nombreError}</p>
                )}
              </div>
              <Input 
                type="email" 
                placeholder="Correo electrónico" 
                value={form.correo} 
                onChange={(e) => setForm({ ...form, correo: e.target.value })} 
                required 
                className="bg-white text-blue-900 border-0 placeholder:text-blue-400 h-11" 
              />

              <Textarea
  placeholder="Mensaje"
  value={form.mensaje}
  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
  required
  className="bg-white text-blue-900 border-0 placeholder:text-blue-400 min-h-[100px]"
/>
              <button
                type="submit"
                disabled={enviando}
                className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-8 rounded-md text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-all duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {enviando ? "Enviando..." : "Enviar mensaje"}
              </button>
            </form>
          </div>

          {/* Columna Derecha: Información y Mapa */}
          <div className="space-y-6">
            <h3 className="font-semibold text-white text-lg">Información de contacto</h3>
            <div className="space-y-4 text-blue-200 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <span>Avenida Jorge Chávez Cdra 1, S/N°, Callao, Lima, Perú</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-amber-400 shrink-0" />
                <span>(01) 429-7800</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-amber-400 shrink-0" />
                <span>contacto@cnposeidon.pe</span>
              </div>
            </div>

            {/* Mapa de Google Integrado */}
            <div className="rounded-xl overflow-hidden bg-blue-800 h-64 border border-blue-700 shadow-lg relative">
              <iframe
              title="Ubicación Centro Naval del Perú - Sede Callao"
               src="https://maps.google.com/maps?q=Centro%20Naval%20del%20Per%C3%BA%20-%20Sede%20Callao&t=&z=16&ie=UTF8&iwloc=&output=embed"
               width="100%"
               height="100%"
               style={{ border: 0 }}
               allowFullScreen
               loading="lazy"
               referrerPolicy="no-referrer-when-downgrade"
               className="grayscale-[15%] hover:grayscale-0 transition-all duration-500"
             ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER — Azul más oscuro */}
      <footer className="bg-blue-950 py-12 px-4">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="Logo Poseidón" className="h-10 w-10 object-contain" />
              <span className="font-bold text-white">Club Náutico Poseidón</span>
            </div>
            <p className="text-sm text-blue-300">Exclusividad y tradición náutica desde 1965.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Enlaces rápidos</h4>
            <ul className="space-y-1">
              {navLinks.map((l) => (
                <li key={l}>
                  <button
                    onClick={() => scrollTo(l.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))}
                    className="text-sm text-blue-400 hover:text-sky-300 transition-colors"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 font-londrina tracking-wide">Síguenos</h4>
            <div className="flex gap-3">
              <a 
                href="https://www.instagram.com/poseidonclub2026?utm_source=qr&igsh=OHZ5aGI0dXh0aGUy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center hover:bg-[#cc9a1b] hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-blue-900 text-center text-xs text-blue-500">
          <p>© 2026 Club Náutico Poseidón del Perú. Todos los derechos reservados.</p>
          <p className="mt-1">Desarrollado para el Proyecto Integrador</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
