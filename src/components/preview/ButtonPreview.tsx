import { memo, useState } from "react";
import { motion } from "framer-motion";
import { SmartLinkButton } from "@/types/smart-link";
import { recordClick } from "@/hooks/use-links";
import type { EntryVariants } from "@/components/preview/preview-utils";

interface ButtonPreviewProps {
  btn: SmartLinkButton;
  accent: string;
  linkId: string;
  entryVariants: EntryVariants;
  onOpenPage?: (pageId: string) => void;
}

/** Resolve the primary color for non-gradient styles from gradientColor or accent */
function resolvePrimaryColor(btn: SmartLinkButton, accent: string): string {
  if (!btn.gradientColor) return accent;
  if (btn.gradientColor.startsWith("custom:")) {
    const p = btn.gradientColor.split(":");
    return p[1] || accent;
  }
  // Map Tailwind gradient preset to an approximate hex
  const presetMap: Record<string, string> = {
    "from-blue-600 to-blue-800": "#2563eb",
    "from-green-600 to-green-800": "#16a34a",
    "from-red-600 to-red-800": "#dc2626",
    "from-orange-500 to-orange-700": "#f97316",
    "from-purple-600 to-purple-800": "#9333ea",
    "from-pink-500 to-pink-700": "#ec4899",
    "from-yellow-500 to-amber-600": "#eab308",
    "from-cyan-500 to-teal-700": "#06b6d4",
    "from-indigo-500 to-indigo-800": "#6366f1",
    "from-emerald-500 to-emerald-800": "#10b981",
  };
  return presetMap[btn.gradientColor] || accent;
}

export const ButtonPreview = memo(function ButtonPreview({ btn, accent, linkId, entryVariants: ev, onOpenPage }: ButtonPreviewProps) {
  const [btnImgError, setBtnImgError] = useState(false);
  const style = btn.buttonStyle || "card";

  const customGrad = btn.gradientColor?.startsWith("custom:") ? (() => {
    const p = btn.gradientColor!.split(":");
    return `linear-gradient(135deg, ${p[1]}, ${p[2]})`;
  })() : null;

  const imgPos = btn.imagePosition || "right";
  const imgOpacity = (btn.imageOpacity ?? 85) / 100;
  const imgSizeW = `${btn.imageSize ?? 50}%`;
  const align = btn.textAlign || (btn.imageUrl ? (imgPos === "left" ? "right" : "left") : "center");
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  const isPageLink = btn.linkType === "page" && btn.pageId;
  const isNewLink = linkId.startsWith("new-");

  const handleClick = (e: React.MouseEvent) => {
    if (isPageLink) {
      e.preventDefault();
      onOpenPage?.(btn.pageId!);
    }
    if (!isNewLink) recordClick(linkId, btn.id);
  };

  const primaryColor = resolvePrimaryColor(btn, accent);

  // ── PILL style ──────────────────────────────────────────────────────────────
  if (style === "pill") {
    return (
      <div className="px-4 pb-3">
        <motion.a
          href={isPageLink ? "#" : (btn.url || "#")}
          target={isPageLink ? undefined : "_blank"}
          rel={isPageLink ? undefined : "noopener noreferrer"}
          onClick={handleClick}
          initial={ev.initial}
          animate={ev.animate}
          transition={ev.transition}
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          className={`flex items-center justify-center w-full rounded-full cursor-pointer ${customGrad ? "" : `bg-gradient-to-r ${btn.gradientColor || "from-blue-600 to-blue-800"}`}`}
          style={{
            height: "80px",
            boxShadow: `0 4px 16px ${primaryColor}45, 0 2px 6px rgba(0,0,0,0.15)`,
            ...(customGrad ? { background: customGrad } : {}),
          }}
        >
          {btn.iconEmoji && (
            <span className="mr-2 text-xl">{btn.iconEmoji}</span>
          )}
          <span
            className="font-bold text-white drop-shadow-sm"
            style={{ fontSize: `${btn.titleSize ?? 15}px` }}
          >
            {btn.label || "Botão"}
          </span>
          {btn.badgeLabel && (
            <span
              className="ml-2 px-1.5 py-0.5 rounded-full text-white text-[9px] font-black shadow-md leading-none"
              style={{ background: btn.badgeColor || "#ef4444" }}
            >
              {btn.badgeLabel}
            </span>
          )}
        </motion.a>
      </div>
    );
  }

  // ── OUTLINE style ────────────────────────────────────────────────────────────
  if (style === "outline") {
    return (
      <div className="px-4 pb-3">
        <motion.a
          href={isPageLink ? "#" : (btn.url || "#")}
          target={isPageLink ? undefined : "_blank"}
          rel={isPageLink ? undefined : "noopener noreferrer"}
          onClick={handleClick}
          initial={ev.initial}
          animate={ev.animate}
          transition={ev.transition}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          className="flex items-center justify-center w-full rounded-2xl border-2 cursor-pointer transition-colors duration-200 relative overflow-hidden group"
          style={{
            height: "80px",
            borderColor: primaryColor,
            color: primaryColor,
          }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: `${primaryColor}18` }}
          />
          {btn.iconEmoji && (
            <span className="mr-2 text-xl relative z-10">{btn.iconEmoji}</span>
          )}
          <span
            className="font-bold relative z-10"
            style={{ fontSize: `${btn.titleSize ?? 15}px` }}
          >
            {btn.label || "Botão"}
          </span>
          {btn.badgeLabel && (
            <span
              className="ml-2 px-1.5 py-0.5 rounded-full text-white text-[9px] font-black shadow-md leading-none relative z-10"
              style={{ background: btn.badgeColor || "#ef4444" }}
            >
              {btn.badgeLabel}
            </span>
          )}
        </motion.a>
      </div>
    );
  }

  // ── GLASS style ──────────────────────────────────────────────────────────────
  if (style === "glass") {
    return (
      <div className="px-4 pb-3">
        <motion.a
          href={isPageLink ? "#" : (btn.url || "#")}
          target={isPageLink ? undefined : "_blank"}
          rel={isPageLink ? undefined : "noopener noreferrer"}
          onClick={handleClick}
          initial={ev.initial}
          animate={ev.animate}
          transition={ev.transition}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          className="flex items-center justify-center w-full rounded-2xl cursor-pointer relative overflow-hidden group"
          style={{
            height: "80px",
            background: "rgba(255,255,255,0.10)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.20)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)",
          }}
        >
          {/* shimmer on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
            }}
          />
          {btn.iconEmoji && (
            <span className="mr-2 text-xl relative z-10">{btn.iconEmoji}</span>
          )}
          <span
            className="font-bold text-white drop-shadow relative z-10"
            style={{ fontSize: `${btn.titleSize ?? 15}px` }}
          >
            {btn.label || "Botão"}
          </span>
          {btn.subtitle && (
            <span className="ml-2 text-[11px] text-white/70 relative z-10">· {btn.subtitle}</span>
          )}
          {btn.badgeLabel && (
            <span
              className="ml-2 px-1.5 py-0.5 rounded-full text-white text-[9px] font-black shadow-md leading-none relative z-10"
              style={{ background: btn.badgeColor || "#ef4444" }}
            >
              {btn.badgeLabel}
            </span>
          )}
        </motion.a>
      </div>
    );
  }

  // ── MINIMAL style ────────────────────────────────────────────────────────────
  if (style === "minimal") {
    return (
      <div className="px-4 pb-3">
        <motion.a
          href={isPageLink ? "#" : (btn.url || "#")}
          target={isPageLink ? undefined : "_blank"}
          rel={isPageLink ? undefined : "noopener noreferrer"}
          onClick={handleClick}
          initial={ev.initial}
          animate={ev.animate}
          transition={ev.transition}
          whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
          className="flex items-center justify-center w-full cursor-pointer group"
          style={{ height: "64px" }}
        >
          {btn.iconEmoji && (
            <span className="mr-2 text-xl">{btn.iconEmoji}</span>
          )}
          <span
            className="font-bold group-hover:underline transition-all"
            style={{ color: primaryColor, fontSize: `${btn.titleSize ?? 15}px` }}
          >
            {btn.label || "Botão"}
          </span>
          <span className="ml-1.5 text-sm" style={{ color: primaryColor }}>→</span>
          {btn.badgeLabel && (
            <span
              className="ml-2 px-1.5 py-0.5 rounded-full text-white text-[9px] font-black shadow-md leading-none"
              style={{ background: btn.badgeColor || "#ef4444" }}
            >
              {btn.badgeLabel}
            </span>
          )}
        </motion.a>
      </div>
    );
  }

  // ── FLAT style ───────────────────────────────────────────────────────────────
  if (style === "flat") {
    return (
      <div className="px-4 pb-3">
        <motion.a
          href={isPageLink ? "#" : (btn.url || "#")}
          target={isPageLink ? undefined : "_blank"}
          rel={isPageLink ? undefined : "noopener noreferrer"}
          onClick={handleClick}
          initial={ev.initial}
          animate={ev.animate}
          transition={ev.transition}
          whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
          className="flex items-center justify-center w-full cursor-pointer transition-opacity duration-200"
          style={{
            height: "56px",
            borderRadius: `${btn.buttonBorderRadius ?? 10}px`,
            background: primaryColor,
            color: "#ffffff",
          }}
        >
          {btn.iconEmoji && (
            <span className="mr-2 text-lg">{btn.iconEmoji}</span>
          )}
          <span
            className="font-bold"
            style={{ fontSize: `${btn.titleSize ?? 14}px` }}
          >
            {btn.label || "Botão"}
          </span>
          {btn.badgeLabel && (
            <span
              className="ml-2 px-1.5 py-0.5 rounded-full text-white text-[9px] font-black shadow-md leading-none"
              style={{ background: btn.badgeColor || "#ef4444" }}
            >
              {btn.badgeLabel}
            </span>
          )}
        </motion.a>
      </div>
    );
  }

  // ── NEUBRUTALISM style ──────────────────────────────────────────────────────
  if (style === "neubrutalism") {
    return (
      <div className="px-4 pb-3">
        <motion.a
          href={isPageLink ? "#" : (btn.url || "#")}
          target={isPageLink ? undefined : "_blank"}
          rel={isPageLink ? undefined : "noopener noreferrer"}
          onClick={handleClick}
          initial={ev.initial}
          animate={ev.animate}
          transition={ev.transition}
          whileHover={{ x: -2, y: -2, transition: { duration: 0.1 } }}
          className="flex items-center justify-center w-full cursor-pointer relative"
          style={{
            height: "60px",
            borderRadius: `${btn.buttonBorderRadius ?? 8}px`,
            background: primaryColor,
            color: "#ffffff",
            border: "2.5px solid #000000",
            boxShadow: "4px 4px 0px #000000",
          }}
        >
          {btn.iconEmoji && (
            <span className="mr-2 text-lg">{btn.iconEmoji}</span>
          )}
          <span
            className="font-black"
            style={{ fontSize: `${btn.titleSize ?? 14}px` }}
          >
            {btn.label || "Botão"}
          </span>
          {btn.subtitle && (
            <span className="ml-2 text-[11px] opacity-80">· {btn.subtitle}</span>
          )}
          {btn.badgeLabel && (
            <span
              className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-white text-[9px] font-black leading-none"
              style={{ background: btn.badgeColor || "#ef4444", border: "1.5px solid #000" }}
            >
              {btn.badgeLabel}
            </span>
          )}
        </motion.a>
      </div>
    );
  }

  // ── SOFT style ──────────────────────────────────────────────────────────────
  if (style === "soft") {
    return (
      <div className="px-4 pb-3">
        <motion.a
          href={isPageLink ? "#" : (btn.url || "#")}
          target={isPageLink ? undefined : "_blank"}
          rel={isPageLink ? undefined : "noopener noreferrer"}
          onClick={handleClick}
          initial={ev.initial}
          animate={ev.animate}
          transition={ev.transition}
          whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
          className="flex items-center justify-center w-full cursor-pointer transition-all duration-200"
          style={{
            height: "56px",
            borderRadius: `${btn.buttonBorderRadius ?? 16}px`,
            background: `${primaryColor}18`,
            color: primaryColor,
          }}
        >
          {btn.iconEmoji && (
            <span className="mr-2 text-lg">{btn.iconEmoji}</span>
          )}
          <span
            className="font-bold"
            style={{ fontSize: `${btn.titleSize ?? 14}px` }}
          >
            {btn.label || "Botão"}
          </span>
          {btn.badgeLabel && (
            <span
              className="ml-2 px-1.5 py-0.5 rounded-full text-white text-[9px] font-black shadow-md leading-none"
              style={{ background: btn.badgeColor || "#ef4444" }}
            >
              {btn.badgeLabel}
            </span>
          )}
        </motion.a>
      </div>
    );
  }

  // ── CARD style (default) ─────────────────────────────────────────────────────
  return (
    <div className="px-4 pb-3">
      <motion.a
        href={isPageLink ? "#" : (btn.url || "#")}
        target={isPageLink ? undefined : "_blank"}
        rel={isPageLink ? undefined : "noopener noreferrer"}
        onClick={handleClick}
        initial={ev.initial}
        animate={ev.animate}
        transition={ev.transition}
        whileHover={{ scale: 1.04, y: -3, transition: { duration: 0.2 } }}
        className="block w-full rounded-2xl transition-all relative overflow-visible group cursor-pointer"
      >
        <div
          className={`relative ${customGrad ? "" : `bg-gradient-to-r ${btn.gradientColor || "from-blue-600 to-blue-800"}`} px-5 py-6 flex items-center rounded-2xl overflow-hidden`}
          style={{
            ...(customGrad ? { background: customGrad } : {}),
            minHeight: `${btn.buttonHeight ?? 148}px`,
          }}
        >
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: `inset 0 0 30px rgba(255,255,255,0.1), 0 0 20px ${accent}30` }}
          />
          {btn.imageUrl && !btnImgError && (
            <img
              src={btn.imageUrl}
              alt=""
              loading="eager"
              decoding="async"
              onError={() => setBtnImgError(true)}
              className={`absolute ${imgPos === "left" ? "left-0" : "right-0"} top-0 h-full object-cover`}
              style={{
                width: imgSizeW,
                maskImage: imgPos === "left"
                  ? "linear-gradient(to left, transparent 0%, black 30%)"
                  : "linear-gradient(to right, transparent 0%, black 30%)",
                WebkitMaskImage: imgPos === "left"
                  ? "linear-gradient(to left, transparent 0%, black 30%)"
                  : "linear-gradient(to right, transparent 0%, black 30%)",
                opacity: imgOpacity,
              }}
            />
          )}
          <div
            className={`relative z-10 min-w-0 ${alignClass}`}
            style={{
              width: btn.imageUrl ? `${100 - (btn.imageSize ?? 50) + 10}%` : "100%",
              marginLeft: btn.imageUrl && align === "right" ? "auto" : undefined,
              marginRight: btn.imageUrl && align === "left" ? "auto" : undefined,
            }}
          >
            <p className="font-bold text-white leading-snug drop-shadow-md" style={{ fontSize: `${btn.titleSize ?? 16}px` }}>
              {btn.label || "Botão"}
            </p>
            {btn.subtitle && (
              <span className="inline-flex items-center mt-2 text-[11px] text-white/90 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 max-w-full truncate">
                {btn.subtitle}
              </span>
            )}
          </div>
          {btn.badgeLabel && (
            <span
              className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-white text-[9px] font-black shadow-md z-20 leading-none pointer-events-none"
              style={{ background: btn.badgeColor || "#ef4444" }}
            >
              {btn.badgeLabel}
            </span>
          )}
        </div>
        {btn.iconEmoji && (
          <span className="absolute -top-3 -left-2 text-3xl drop-shadow-xl z-30 pointer-events-none animate-float-emoji">
            {btn.iconEmoji}
          </span>
        )}
      </motion.a>
    </div>
  );
});
