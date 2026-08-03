import { ExternalLink, Download } from "lucide-react";
import type { Album } from "@/features/descargas/types";
import { CopyLinkButton } from "./copy-link-button";

export function DownloadActions({ album }: { album: Album }) {
  const [primary, ...rest] = album.downloadLinks;

  return (
    <div className="flex flex-col gap-2.5">
      {primary ? (
        <a
          href={primary.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-md bg-[#dc2626] px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#b91c1c]"
        >
          <Download size={16} aria-hidden="true" />
          Descargar
        </a>
      ) : (
        <p className="rounded-md border border-dashed border-neutral-700 px-6 py-3.5 text-center font-mono text-xs uppercase tracking-widest text-neutral-500">
          Sin enlace disponible
        </p>
      )}

      {rest.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {rest.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-neutral-700 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-300 transition-colors hover:border-[#dc2626] hover:text-[#dc2626]"
            >
              <ExternalLink size={12} aria-hidden="true" />
              {link.host}
            </a>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-neutral-600">
          vía {primary?.host ?? "blog"}
        </span>
        <CopyLinkButton slug={album.slug} />
      </div>
    </div>
  );
}
