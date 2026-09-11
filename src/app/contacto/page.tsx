import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle, Shield, FileText } from "lucide-react";
import { ogImageActual } from "@/features/tienda/utils/seo";

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await ogImageActual();
  return {
    title: "Contacto",
    description: "Contacta a Punk Medallo: WhatsApp, correo info@punkmedallo.com, Medellín. Dudas sobre tienda, boletería, descargas y demos de bandas.",
    alternates: { canonical: "/contacto" },
    openGraph: {
      title: "Contacto - Punk Medallo",
      description: "WhatsApp, correo y redes de Punk Medallo. Escríbenos para demos, pedidos y toques.",
      url: "/contacto",
      type: "website",
      locale: "es_CO",
      siteName: "Punk Medallo",
      images: [{ url: ogImage, width: 1200, height: 630, type: "image/jpeg" }],
    },
  };
}

export default function Contacto() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-white/[0.06] bg-background">
        <div className="mx-auto max-w-6xl px-4 pt-24 pb-10 md:pt-28 md:pb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Punk Medallo — Escríbenos</p>
          <h1 className="mt-3 text-5xl font-black uppercase leading-none tracking-tight text-white md:text-7xl">
            Contacto
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            ¿Tienes una banda, dudas de un pedido o quieres proponer un toque? La vía más rápida es WhatsApp, también por correo.
          </p>
        </div>
      </section>

      <section className="w-screen ml-[calc(-50vw+50%)] bg-background">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:py-16 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6">
              <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white">
                <MessageCircle size={14} className="text-primary" /> Contacto directo
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Respuesta más rápida por WhatsApp. Para demos adjunta links (Drive, SoundCloud, Bandcamp). No recibimos archivos pesados por correo.
              </p>
              <div className="mt-5 grid gap-3">
                <a
                  href="https://wa.me/573014453392?text=Hola%20Punk%20Medallo%2C%20te%20escribo%20desde%20la%20web"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-black text-white hover:bg-[#1ebe5a]"
                >
                  <MessageCircle size={16} /> Abrir WhatsApp
                </a>
                <a href="mailto:info@punkmedallo.com" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white hover:border-primary hover:text-primary">
                  <Mail size={16} className="text-primary" /> info@punkmedallo.com
                </a>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Phone size={12} className="text-primary" /> +57 301 445 3392</span>
                <span className="inline-flex items-center gap-1.5"><MapPin size={12} className="text-primary" /> Medellín, Colombia</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <a href="https://www.facebook.com/xPUNKMEDALLOx" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-bold text-white hover:border-primary hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg> Facebook
              </a>
              <a href="https://www.instagram.com/punk.medallo" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-bold text-white hover:border-primary hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg> Instagram
              </a>
              <a href="https://www.youtube.com/punkmedallo" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-bold text-white hover:border-primary hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" /></svg> YouTube
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">¿Qué necesitas?</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li>• <span className="font-semibold text-white">Demos de bandas:</span> envía link y breve bio.</li>
                <li>• <span className="font-semibold text-white">Pedidos y envíos:</span> indica número de pedido.</li>
                <li>• <span className="font-semibold text-white">Boletería:</span> titular y código PM-TKT.</li>
                <li>• <span className="font-semibold text-white">Prensa y toques:</span> fecha, lugar y propuesta.</li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/politica-de-privacidad" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white hover:border-primary hover:text-primary">
                  <Shield size={12} /> Privacidad
                </Link>
                <Link href="/terminos" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white hover:border-primary hover:text-primary">
                  <FileText size={12} /> Términos
                </Link>
                <Link href="/politica-de-cookies" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white hover:border-primary hover:text-primary">
                  <Shield size={12} /> Cookies
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Horario</h3>
              <p className="mt-2 text-sm text-muted-foreground">Atendemos mensajes de lunes a sábado. Respuesta habitual en el día.</p>
              <p className="mt-2 text-xs text-muted-foreground/70">Para urgencias de pedidos en curso usa WhatsApp con tu número de pedido.</p>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contacto — Punk Medallo",
            url: "https://punkmedallo.com/contacto",
            mainEntity: {
              "@type": "Organization",
              name: "Punk Medallo",
              url: "https://punkmedallo.com",
              email: "info@punkmedallo.com",
              telephone: "+57-301-4453392",
              address: { "@type": "PostalAddress", addressLocality: "Medellín", addressCountry: "CO" },
              sameAs: ["https://www.facebook.com/xPUNKMEDALLOx", "https://www.instagram.com/punk.medallo", "https://www.youtube.com/punkmedallo"],
            },
          }),
        }}
      />
    </div>
  );
}
