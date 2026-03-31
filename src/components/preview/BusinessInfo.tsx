import { type CSSProperties } from "react";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import { SmartLink } from "@/types/smart-link";
import { HtmlTitle } from "@/components/preview/HtmlTitle";

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
          const isDark = link.textColor?.includes('white') ?? false;
          const glassStyle: CSSProperties = {
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            background: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.35)',
            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: '12px',
            padding: '8px 18px',
            display: 'inline-block',
            maxWidth: `${link.businessNameWidth ?? 100}%`,
          };
          const noGlassStyle: CSSProperties = {
            maxWidth: `${link.businessNameWidth ?? 100}%`,
            display: 'inline-block',
          };
          const inner = link.businessNameHtml ? (
            <HtmlTitle
              html={link.businessName || "<p>Nome do Negócio</p>"}
              scale={(link.businessNameFontSize ?? 100) / 100}
              align={link.businessNameAlign ?? "center"}
              textColor={link.titleColor || (dark ? "#ffffff" : "#111111")}
            />
          ) : (
            <h1
              className="font-bold leading-tight break-words"
              style={{ color: link.titleColor || accent, fontSize: `${link.businessNameFontSize ?? 24}px`, fontFamily }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(link.businessName || "Nome do Negócio", {
                  ALLOWED_TAGS: ["b", "i", "em", "strong", "span", "br", "sup", "sub", "u", "s", "mark"],
                  ALLOWED_ATTR: ["style", "class"],
                }),
              }}
            />
          );
          return link.businessNameGlass ? (
            <div style={glassStyle}>{inner}</div>
          ) : (
            <div style={noGlassStyle}>{inner}</div>
          );
        })()}

        {link.tagline && !link.hideTagline && (() => {
          const isDark = link.textColor?.includes('white') ?? false;
          const glassStyle: CSSProperties = {
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            background: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.35)',
            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: '12px',
            padding: '8px 18px',
            display: 'inline-block',
            maxWidth: `${link.taglineWidth ?? 100}%`,
          };
          const tagline = (
            <p
              className={`mt-1 italic${link.taglineColor ? '' : ` ${subtextClass}`}`}
              style={{
                color: link.taglineColor || undefined,
                fontSize: `${link.taglineFontSize ?? 13}px`,
                fontFamily,
              }}
            >
              {link.tagline}
            </p>
          );
          return link.taglineGlass ? (
            <div style={glassStyle}>{tagline}</div>
          ) : (
            <div style={{ maxWidth: `${link.taglineWidth ?? 100}%`, display: 'inline-block' }}>{tagline}</div>
          );
        })()}
      </motion.div>
    </>
  );
}
