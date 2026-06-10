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
  { icon: Award, title: "Membresía Exclusiva", desc: "Acceso a instalaciones premium y beneficios únicos para socios y sus familias." },
  { icon: Ship, title: "Radas y Amarres de Seguridad", desc: "Espacios de fondeo seguros y amarres modernos para todo tipo de embarcaciones." },
  { icon: GraduationCap, title: "Escuela de Navegación y Buceo", desc: "Cursos certificados para principiantes y avanzados con instructores profesionales." },
  { icon: Waves, title: "Zonas de Recreación", desc: "Piscinas, cafetería gourmet y áreas sociales con vista al mar." },
];

const galleryImages = [
  { src: gallery1, alt: "Velero en el océano", label: "Embarcaciones" },
  { src: gallery2, alt: "Muelle del club", label: "Muelles" },
  { src: gallery3, alt: "Restaurante del club", label: "Restaurante" },
  { src: gallery4, alt: "Evento social", label: "Eventos" },
  { src: gallery5, alt: "Piscina del club", label: "Recreación" },
  { src: gallery6, alt: "Escuela de buceo", label: "Buceo" },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [form, setForm] = useState({ nombre: "", correo: "", mensaje: "" });

  const scrollTo = (id: string) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Mensaje enviado", description: "Nos pondremos en contacto contigo pronto." });
    setForm({ nombre: "", correo: "", mensaje: "" });
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

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <button
                key={l}
                onClick={() => scrollTo(l.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))}
                className="text-sm font-medium text-blue-200 hover:text-sky-300 transition-colors"
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

     {/* SERVICIOS — Fondo celeste brisa marina */}
      <section id="servicios" className="py-20 px-4 bg-sky-50">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            {/* Cambiado bg-amber-400 por tu color personalizado #cc9a1b */}
            <div className="h-1 w-10 bg-[#cc9a1b] rounded-full" />
            <h2 className="text-3xl font-bold text-blue-900">Nuestros Servicios</h2>
            <div className="h-1 w-10 bg-[#cc9a1b] rounded-full" />
          </div>
          <p className="text-blue-700/70 max-w-xl mx-auto">Todo lo que necesitas para disfrutar del mar con seguridad y confort.</p>
        </div>

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <Card key={s.title} className="text-center bg-white border-0 shadow-lg shadow-blue-900/10 hover:shadow-xl hover:shadow-blue-900/15 transition-shadow">
              <CardContent className="pt-8 pb-6 px-6 flex flex-col items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
                  {/* Cambié también el color del icono para que combine con el nuevo dorado si lo prefieres */}
                  <s.icon className="h-7 w-7 text-[#cc9a1b]" />
                </div>
                <h3 className="font-semibold text-blue-900">{s.title}</h3>
                <p className="text-sm text-blue-700/60">{s.desc}</p>
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
          {/* Columna Izquierda: Formulario */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-10 bg-amber-400 rounded-full" />
              <h2 className="text-3xl font-bold text-white">Contáctanos</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                placeholder="Nombre completo" 
                value={form.nombre} 
                onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
                required 
                className="bg-white text-blue-900 border-0 placeholder:text-blue-400" 
              />
              <Input 
                type="email" 
                placeholder="Correo electrónico" 
                value={form.correo} 
                onChange={(e) => setForm({ ...form, correo: e.target.value })} 
                required 
                className="bg-white text-blue-900 border-0 placeholder:text-blue-400" 
              />
              <button type="submit" className="inline-flex items-center justify-center h-10 px-6 rounded-md text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                Enviar mensaje
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
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.554374189035!2d-77.1491754!3d-12.0535212!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105cb4321689531%3A0xc340b8f60b4a4c5a!2sCentro%20Naval%20del%20Per%C3%BA%20-%20Sede%20Callao!5e0!3m2!1ses-419!2spe!4v1709245000000!5m2!1ses-419!2spe"
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
