"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    formData.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_KEY!);

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      });

      const result = await res.json();

      if (result.success) {
        toast.success("¡Éxito!", {
          description:
            "Tu mensaje ha sido enviado correctamente. ¡Gracias por contactarnos!",
        });
        (event.target as HTMLFormElement).reset();
      } else {
        toast.error("Error", {
          description:
            "Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.",
        });
      }
    } catch {
      toast.error("Error", {
        description: "Hubo un problema al conectar con el servidor.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <form
        onSubmit={onSubmit}
        className="max-w-[600px] w-full bg-[rgba(7,7,7,0.56)] p-5 pb-[25px] rounded-lg shadow-[0px_0px_6px_6px_rgba(0,0,0,0.75)] text-white mx-[25px]"
      >
        <h2 className="text-center text-white">Contacto</h2>

        <div className="mt-2.5 text-[#ff0000]">
          <label>Nombre</label>
          <input
            type="text"
            placeholder="Escribe tu Nombre"
            name="name"
            required
            className="w-full h-[50px] bg-transparent border border-dashed border-white/75 outline-none rounded-md px-[15px] py-3.5 text-base text-white mt-2 placeholder:text-white placeholder:opacity-100"
          />
        </div>

        <div className="mt-2.5 text-[#ff0000]">
          <label>Correo</label>
          <input
            type="email"
            placeholder="Escribe tu correo"
            name="email"
            required
            className="w-full h-[50px] bg-transparent border border-dashed border-white/75 outline-none rounded-md px-[15px] py-3.5 text-base text-white mt-2 placeholder:text-white placeholder:opacity-100"
          />
        </div>

        <div className="mt-2.5 text-[#ff0000]">
          <label>Mensaje</label>
          <textarea
            name="message"
            placeholder="Escribe tu mensaje"
            required
            className="w-full h-[100px] bg-transparent border border-dashed border-white/75 outline-none rounded-md px-[15px] py-3.5 text-base text-white mt-2 placeholder:text-white placeholder:opacity-100 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-[55px] bg-transparent border-2 border-[#d70808] rounded-md shadow-[0_0_10px_rgba(0,0,0,0.1)] text-base text-white font-medium mt-[25px] transition-colors duration-500 enabled:hover:bg-[#d70808] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
