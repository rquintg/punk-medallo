"use client";

import dynamic from "next/dynamic";

const FloatingWhatsApp = dynamic(
  () =>
    import("react-floating-whatsapp").then((mod) => mod.FloatingWhatsApp),
  { ssr: false }
);

export default function FloatingWhatsAppWrapper() {
  return (
    <FloatingWhatsApp
      phoneNumber="573014453392"
      accountName="Punk Medallo"
      statusMessage="Generalmente responde rapido"
      chatMessage="Hola, ¿en qué puedo ayudarte?"
      placeholder="Escribe un mensaje..."
      avatar="/logo_punk_medallo.jpg"
      darkMode
      allowEsc
      allowClickAway
      notification
      notificationDelay={10}
      buttonStyle={{
        width: "50px",
        height: "50px",
        backgroundColor: "#25d3664a",
        bottom: "4.5rem",
        right: "0.8rem",
      }}
    />
  );
}
