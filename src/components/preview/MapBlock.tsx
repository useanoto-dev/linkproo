import { motion } from "framer-motion";
import { LinkBlock } from "@/types/smart-link";
import { getMapEmbedUrl, isShortMapLink } from "@/components/preview/preview-utils";
import { recordClick } from "@/hooks/use-links";

interface MapBlockProps {
  block: LinkBlock;
  accent: string;
  dark: boolean;
  textClass: string;
  delay: number;
  linkId: string;
  isNewLink: boolean;
}

export function MapBlock({ block, accent, dark, textClass, delay, linkId, isNewLink }: MapBlockProps) {
  // Priority: address field generates embed directly
  const addressEmbed = block.mapAddress
    ? `https://maps.google.com/maps?q=${encodeURIComponent(block.mapAddress)}&output=embed&hl=pt-BR`
    : null;
  const urlEmbed = block.mapUrl ? getMapEmbedUrl(block.mapUrl) : null;
  const embedUrl = addressEmbed || urlEmbed;
  const openUrl = block.mapUrl || (block.mapAddress
    ? `https://maps.google.com/maps?q=${encodeURIComponent(block.mapAddress)}`
    : null);

  return (
    <motion.div className="px-4 py-2"
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
      {embedUrl ? (
        <div>
          <div className="rounded-2xl overflow-hidden shadow-md" style={{ height: block.mapHeight ?? 220 }}>
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              sandbox="allow-scripts allow-same-origin allow-popups"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          {openUrl && (
            <div className="mt-1.5 text-center">
              <a
                href={openUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { if (!isNewLink) recordClick(linkId, block.id); }}
                className={`text-[11px] font-medium underline underline-offset-2 ${textClass} opacity-70 hover:opacity-100 transition-opacity`}
              >
                Abrir no Google Maps →
              </a>
            </div>
          )}
        </div>
      ) : (
        /* Short links (goo.gl / maps.app.goo.gl) and other unresolvable URLs:
           show a tap-to-open card instead of an error message. */
        <a
          href={block.mapUrl!}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { if (!isNewLink) recordClick(linkId, block.id); }}
          className="block rounded-2xl overflow-hidden shadow-md no-underline"
          style={{ height: block.mapHeight ?? 220 }}
        >
          <div
            className={`w-full h-full flex flex-col items-center justify-center gap-3 px-5 text-center ${dark ? "bg-white/10 border border-white/10" : "bg-white border border-gray-100"}`}
            style={{ borderRadius: "inherit" }}
          >
            {/* Map pin icon (inline SVG — no extra dependency) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {block.mapUrl && isShortMapLink(block.mapUrl) ? (
              <p className={`text-xs leading-snug font-medium ${textClass}`} style={{ wordBreak: "break-all" }}>
                {block.mapUrl}
              </p>
            ) : null}
            <span
              className="mt-1 inline-block px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md"
              style={{ background: accent }}
            >
              Abrir no Google Maps
            </span>
          </div>
        </a>
      )}
    </motion.div>
  );
}
