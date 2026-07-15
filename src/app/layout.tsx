import type { Metadata } from "next";
import Script from "next/script";
import { Krub } from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import WebPlayer from "@/components/WebPlayer";
import FloatingWhatsAppWrapper from "@/components/FloatingWhatsAppWrapper";
import QueryProvider from "@/components/QueryProvider";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const krub = Krub({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-krub",
});

const siteUrl = "https://punkmedallo.com";
const siteName = "Punk Medallo";
const description =
  "Lo más grotesco, viejo, perdido en el tiempo y nuevo del punk local en un solo lugar, Radio 24/7";
const ogImage = `${siteUrl}/logo_punk_medallo.jpg`;

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description,
  keywords: ["punk", "medellín", "música", "radio", "streaming"],
  authors: [{ name: "Ricardo Q" }],
  creator: "Ricardo Q",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName,
    title: siteName,
    description,
    url: siteUrl,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo_punk_medallo.jpg",
  },
  manifest: "/manifest.json",
  other: {
    "google-adsense-account": "ca-pub-1745023730981943",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: ogImage,
  description,
  sameAs: [
    "https://www.facebook.com/xPUNKMEDALLOx",
    "https://www.instagram.com/punk.medallo",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+57-301-4453392",
    contactType: "customer support",
    availableLanguage: "es",
  },
};

const radioStationSchema = {
  "@context": "https://schema.org",
  "@type": "RadioStation",
  name: siteName,
  url: siteUrl,
  description,
  image: ogImage,
  sameAs: [
    "https://www.facebook.com/xPUNKMEDALLOx",
    "https://www.instagram.com/punk.medallo",
  ],
};

const navigationSchema = {
  "@context": "https://schema.org",
  "@type": "SiteNavigationElement",
  name: "Navegación Principal",
  url: siteUrl,
  hasPart: [
    { "@type": "WebPage", name: "Inicio", url: `${siteUrl}/` },
    { "@type": "WebPage", name: "Acerca de", url: `${siteUrl}/about` },
    { "@type": "WebPage", name: "Toques", url: `${siteUrl}/eventos` },
    { "@type": "WebPage", name: "Descargas", url: `${siteUrl}/descargas` },
    { "@type": "WebPage", name: "Registro Fotográfico", url: `${siteUrl}/fotos` },
    { "@type": "WebPage", name: "Paginas amigas", url: `${siteUrl}/amigos` },
    { "@type": "WebPage", name: "Contacto", url: `${siteUrl}/contacto` },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${krub.variable} h-full antialiased`}
    >
      <head>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://a3.asurahosting.com" />
      </head>
      <body className="min-h-full flex flex-col bg-[#181818] text-white">
        <NavBar />
        <main className="flex-1">
          <QueryProvider>{children}</QueryProvider>
        </main>
        <Footer />
        <WebPlayer />

        <Toaster
          position="top-right"
          offset={{ top: 75 } as any}
          toastOptions={{
            style: { background: "#171717", color: "#fff" },
          }}
        />

        <FloatingWhatsAppWrapper />

        <SpeedInsights />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(radioStationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(navigationSchema),
          }}
        />

        <noscript>You need to enable JavaScript to run this app.</noscript>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2JKFY9YR1H"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2JKFY9YR1H');
          `}
        </Script>
      </body>
    </html>
  );
}
