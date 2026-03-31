import { type CSSProperties } from "react";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import { SmartLink, TextBgBox } from "@/types/smart-link";
import { HtmlTitle } from "@/components/preview/HtmlTitle";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const clean = (hex || "#000000").replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${(alpha / 100).toFixed(2)})`;
}

function getBgBoxStyle(box: TextBgBox): CSSProperties {
  return {
    display: "inline-block",
    background: hexToRgba(box.bgColor, box.bgOpacity),
    border: `${box.borderWidth}px solid ${hexToRgba(box.borderColor, box.borderOpacity)}`,
    borderRadius: `${box.borderRadius}px`,
    padding: `${box.padding}px`,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BusinessInfoProps {
  link: SmartLink;
  isBioMode: boolean;
  dark: boolean;
  accent: string;
  fontFamily: string;
  subtextClass: string;
}

export function BusinessInfo({ link, isBioMode, dark, accent, fontFamily, subtextClass }: BusinessInfoProps) {
  return (
    <>
      {/* Bio mode: avatar overlapping the banner bottom */}
      {isBioMode && link.logoUrl && (() => {
        const avatarSize = Math.max(80, link.logoSizePx ?? 80);
        const borderColor = link.logoBorderColor ?? '#ffffff';
        const borderPx = link.logoBorderWidth ?? 4;
        const shape = link.logoShape ?? 'circle';
        const radius = shape === 'circle' ? '50%' : shape === 'square' ? '0' : '16px';
        return (
          <motion.div
            className="flex justify-center"
            style={{ marginTop: -(avatarSize / 2 + borderPx + 2) }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
          >
            <div
              style={{
                padding: borderPx,
                backgroundColor: borderColor,
                borderRadius: radius,
                boxShadow: '0 2px 20px rgba(0,0,0,0.18)',
                display: 'inline-block',
              }}
            >
              <img
                src={link.logoUrl}
                alt="Avatar"
                style={{ width: avatarSize, height: avatarSize, objectFit: 'cover', borderRadius: radius, display: 'block' }}
              />
            </div>
          </motion.div>
        );
      })()}

      <motion.div
        className="px-5 py-4"
        style={{ textAlign: link.businessNameAlign ?? "center" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Classic logo — hidden in bio mode (avatar shown above) */}
        {!isBioMode && link.logoUrl && (
          <motion.div
            className="relative inline-block mb-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
          >
            <img
              src={link.logoUrl}
              alt="Logo"
              loading="eager"
              decoding="async"
              style={{
                width: link.logoSizePx ?? 80,
                height: "auto",
                objectFit: "contain",
                display: "block",
                borderRadius: link.logoShape === 'circle' ? '50%' : link.logoShape === 'square' ? '0' : '8px',
              }}
              className={link.logoShadow ?? true ? "drop-shadow-xl" : ""}
            />
          </motion.div>
        )}

        {!link.hideBusinessName && (() => {
          const bgBoxStyle = link.businessNameBgBox?.enabled
            ? getBgBoxStyle(link.businessNameBgBox)
            : { maxWidth: `${link.businessNameWidth ?? 100}%`, display: 'inline-block' };

          const wrapperStyle: CSSProperties = link.businessNameBgBox?.enabled
            ? bgBoxStyle
            : { maxWidth: `${link.businessNameWidth ?? 100}%`, display: 'inline-block' };

          const inner = link.businessNameHtml ? (
            <HtmlTitle
              html={link.businessName || "<p>Nome do Negócio</p>"}
              scale={(link.businessNameFontSize ?? 100) / 100}
              align={link.businessNameAlign ?? "center"}
              textColor={link.titleColor || (dark ? "#ffffff" : "#111111")}
            />
          ) : (
            <h1
              className={`font-bold leading-tight break-words${link.businessNameEffect ? ` ${link.businessNameEffect}` : ''}`}
              style={{
                color: link.businessNameEffect ? undefined : (link.titleColor || accent),
                fontSize: `${link.businessNameFontSize ?? 24}px`,
                fontFamily,
              }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(link.businessName || "Nome do Negócio", {
                  ALLOWED_TAGS: ["b", "i", "em", "strong", "span", "br", "sup", "sub", "u", "s", "mark"],
                  ALLOWED_ATTR: ["style", "class"],
                }),
              }}
            />
          );
          return <div style={wrapperStyle}>{inner}</div>;
        })()}

        {link.tagline && !link.hideTagline && (() => {
          const bgBoxStyle = link.taglineBgBox?.enabled
            ? getBgBoxStyle(link.taglineBgBox)
            : { maxWidth: `${link.taglineWidth ?? 100}%`, display: 'inline-block' };

          const tagline = (
            <p
              className={`mt-1 italic${link.taglineEffect ? ` ${link.taglineEffect}` : ''}${!link.taglineEffect && !link.taglineColor ? ` ${subtextClass}` : ''}`}
              style={{
                color: link.taglineEffect ? undefined : (link.taglineColor || undefined),
                fontSize: `${link.taglineFontSize ?? 13}px`,
                fontFamily,
              }}
            >
              {link.tagline}
            </p>
          );
          return <div style={bgBoxStyle}>{tagline}</div>;
        })()}
      </motion.div>
    </>
  );
}
