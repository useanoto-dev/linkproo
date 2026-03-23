import React from "react";
import { motion } from "framer-motion";
import { SmartLink, SmartLinkButton, LinkBlock, BlockType } from "@/types/smart-link";
import { Zap } from "lucide-react";
import { useMemo, useEffect, useState, useRef, memo } from "react";
import { SnowEffect } from "@/components/SnowEffect";
import { BubblesEffect } from "@/components/BubblesEffect";
import { FirefliesEffect } from "@/components/FirefliesEffect";
import { MatrixEffect } from "@/components/MatrixEffect";
import { StarsEffect } from "@/components/StarsEffect";
import { BgHtmlEffect } from "@/components/BgHtmlEffect";
import { extractBgColor } from "@/lib/color-utils";
import { SubPageModal } from "@/components/SubPageModal";
import { FloatingEmoji } from "@/components/preview/FloatingEmoji";
import { ButtonPreview } from "@/components/preview/ButtonPreview";
import { BlockRenderer } from "@/components/preview/BlockRenderer";
import {
  isDarkBg, parseCustomBg, FONT_LINKS, loadGoogleFont, getEntryVariants,
} from "@/components/preview/preview-utils";

// ─── HtmlTitle — renderiza HTML completo do usuário dentro de um iframe isolado ──

function HtmlTitle({ html, scale, align = "center" }: { html: string; scale: number; align?: "left" | "center" | "right" }) {
  const [height, setHeight] = useState(80);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === "html-title-height" && typeof e.data.height === "number") {
        setHeight(Math.max(20, e.data.height));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Inject a tiny postMessage reporter so the parent knows the body height
  const srcDoc = useMemo(() => {
    const defaultStyle = `<style>html,body{margin:0;padding:0;text-align:${align};}</style>`;
    const reporter =
      `<scr` +
      `ipt>function r(){window.parent.postMessage({type:'html-title-height',height:document.body.scrollHeight},'*');}` +
      `window.addEventListener('load',r);setTimeout(r,120);setTimeout(r,600);</scr` +
      `ipt>`;
    let doc = html;
    if (doc.includes("</head>")) {
      doc = doc.replace("</head>", defaultStyle + "</head>");
    } else {
      doc = defaultStyle + doc;
    }
    return doc.includes("</body>")
      ? doc.replace("</body>", reporter + "</body>")
      : doc + reporter;
  }, [html, align]);

  return (
    // Outer div reserves the SCALED layout height so content below isn't overlapped
    <div style={{ height: height * scale, overflow: "hidden", width: "100%" }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top center", height, width: "100%" }}>
        <iframe
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          scrolling="no"
          style={{ width: "100%", height, border: "none", background: "transparent", display: "block", overflow: "hidden" }}
          title="business-name"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface SmartLinkPreviewProps {
  link: SmartLink;
  selectedId?: string;
  ghostBlockType?: BlockType;
  onSelectElement?: (id: string) => void;
}

const GHOST_BLOCK_LABELS: Partial<Record<BlockType, string>> = {
  text: "Escreva seu texto aqui...",
  title: "Escreva seu título...",
  richtext: "Escreva seu conteúdo...",
  cta: "Chamada para ação...",
  banner: "Banner de destaque",
  stats: "Bloco de estatísticas",
  badges: "Selos / Badges",
  testimonial: "Depoimento de cliente",
  image: "Imagem",
  video: "Vídeo",
  spacer: "Espaçador",
  "email-capture": "Captura de e-mail",
  countdown: "Contagem regressiva",
  spotify: "Player Spotify",
  map: "Mapa",
  carousel: "Carrossel de imagens",
  "animated-button": "Botão animado",
  product: "Card de produto",
  contacts: "Bloco de contatos",
  faq: "Perguntas frequentes",
  gallery: "Galeria de fotos",
  html: "Bloco HTML",
};

export const SmartLinkPreview = memo(function SmartLinkPreview({ link, selectedId, ghostBlockType, onSelectElement }: SmartLinkPreviewProps) {
  const hasContent = link.businessName || link.heroImage || link.buttons.length > 0;
  const dark = isDarkBg(link.backgroundColor);
  const customBg = parseCustomBg(link.backgroundColor);
  const heroBgColor = extractBgColor(link.backgroundColor);
  const accent = link.accentColor || "#f59e0b";
  const entryAnim = link.entryAnimation ?? "fade-up";
  const snow = link.snowEffect;
  const [openPageId, setOpenPageId] = useState<string | null>(null);
  const openPage = (link.pages || []).find((p) => p.id === openPageId) || null;

  // Key to force remount and replay animations when animation type changes
  const [animKey, setAnimKey] = useState(0);
  const prevAnimRef = useRef(entryAnim);
  useEffect(() => {
    if (prevAnimRef.current !== entryAnim) {
      prevAnimRef.current = entryAnim;
      setAnimKey((k) => k + 1);
    }
  }, [entryAnim]);

  const textClass = dark ? "text-white" : "text-gray-900";
  const subtextClass = dark ? "text-white/60" : "text-gray-500";
  const fontFamily = FONT_LINKS[link.fontFamily || "Inter"] || "'Inter', sans-serif";

  useEffect(() => {
    if (link.fontFamily) loadGoogleFont(link.fontFamily);
  }, [link.fontFamily]);

  // Build unified list sorted by order
  const items = useMemo(() => {
    type UnifiedPreviewItem =
      | { kind: "button"; data: SmartLinkButton; order: number }
      | { kind: "block"; data: LinkBlock; order: number };

    const list: UnifiedPreviewItem[] = [
      ...link.buttons.map((b, i) => ({ kind: "button" as const, data: b, order: b.order ?? i })),
      ...link.blocks.map((b, i) => ({ kind: "block" as const, data: b, order: b.order ?? (link.buttons.length + i) })),
    ].sort((a, b) => a.order - b.order);
    return list;
  }, [link.buttons, link.blocks]);

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center min-h-full h-full text-sm p-8 text-center" style={{ color: "#999", minHeight: "100%" }}>
        <div>
          <div className="text-4xl mb-3">📱</div>
          <p className="text-xs leading-relaxed">Preencha o nome do negócio ou adicione um botão para ver o preview aqui</p>
        </div>
      </div>
    );
  }

  // Use solid color for preset backgrounds so the entire content area below the
  // banner renders in a single uniform tone. Gradient presets have very similar
  // from/to values (e.g. slate-950 → slate-900) but, when painted over the full
  // page height, create a visible tonal shift between the business-name section
  // and the buttons section — making them look like separate containers.
  // Custom two-color backgrounds (custom:c1:c2) keep their gradient intentionally.
  const bgStyle = customBg
    ? { background: customBg, fontFamily }
    : { background: heroBgColor, fontFamily };

  return (
    <div className="min-h-full relative overflow-hidden" style={bgStyle}>
      {link.bgHtml?.enabled && link.bgHtml.html && (
        <BgHtmlEffect html={link.bgHtml.html} />
      )}
      {link.bgHtml?.enabled && (link.bgHtml.overlay ?? 0) > 0 && (
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ backgroundColor: `rgba(0,0,0,${(link.bgHtml.overlay ?? 0) / 100})` }}
        />
      )}

      {link.starsEffect?.enabled && (
        <StarsEffect
          count={link.starsEffect.count}
          color={link.starsEffect.color}
          shooting={link.starsEffect.shooting}
        />
      )}
      {link.matrixEffect?.enabled && (
        <MatrixEffect speed={link.matrixEffect.speed} color={link.matrixEffect.color} />
      )}

      {snow?.enabled && <SnowEffect intensity={snow.intensity} color={snow.color} />}
      {link.bubblesEffect?.enabled && (
        <BubblesEffect intensity={link.bubblesEffect.intensity} color={link.bubblesEffect.color} />
      )}
      {link.firefliesEffect?.enabled && (
        <FirefliesEffect count={link.firefliesEffect.count} color={link.firefliesEffect.color} />
      )}

      {/* Decorative particles removed — only animated templates (bgHtml) should have effects */}

      {/* Floating Emojis */}
      {link.floatingEmojis.map((emoji, i) => (
        <FloatingEmoji key={`${emoji}-${i}`} emoji={emoji} delay={i * 1.5} />
      ))}

      {/* Hero Image */}
      {link.heroImage && (() => {
        // Resolve height — new px value takes precedence over legacy enum
        const heightPx: number | undefined = link.heroImageHeightPx ?? 192;

        const objectFit  = link.heroObjectFit ?? 'cover';
        const objectPos  = link.heroFocalPoint
          ? `${link.heroFocalPoint.x}% ${link.heroFocalPoint.y}%`
          : 'center';

        return (
          <motion.div
            className="relative w-full z-[2]"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img
              src={link.heroImage}
              alt={link.businessName}
              className="w-full"
              style={{
                height:         heightPx ?? 'auto',
                maxHeight:      heightPx ? undefined : '24rem',
                objectFit,
                objectPosition: objectPos,
                display:        'block',
                opacity:        (link.heroImageOpacity ?? 100) / 100,
              }}
            />
            {(link.heroOverlayOpacity ?? 0) > 0 && (() => {
              const color = link.heroOverlayColor ?? 'dark';
              const bg = color === 'dark' ? '#000000' : color === 'light' ? '#ffffff' : color;
              return (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: bg,
                    opacity: (link.heroOverlayOpacity ?? 0) / 100,
                  }}
                />
              );
            })()}
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to bottom, ${heroBgColor}80 0%, transparent 40%)` }}
            />
          </motion.div>
        );
      })()}

      {/* ── Single unified content container ────────────────────────────────────
          Business info, items, and footer all live in ONE div so they share
          the exact same background layer with zero compositing seam.
          When a hero image is present the div overlaps the banner's bottom
          edge with rounded top corners and re-applies the background to cover
          the image. Without a hero image the outer container already provides
          the background and this div is transparent. */}
      <div
        className={`relative z-10 ${link.heroImage && !link.bgHtml?.enabled ? "-mt-3 rounded-t-2xl shadow-[0_-2px_16px_rgba(0,0,0,0.10)]" : ""}`}
        style={link.heroImage && !link.bgHtml?.enabled ? bgStyle : undefined}
      >
        {/* Business Info */}
        <motion.div
          className="px-5 py-4"
          style={{ textAlign: link.businessNameAlign ?? "center" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {link.logoUrl && (
            <motion.div
              className="relative inline-block mb-2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
            >
              <img
                src={link.logoUrl}
                alt="Logo"
                style={{
                  width: link.logoSizePx ?? 80,
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                  borderRadius: '6px',
                }}
                className={link.logoShadow ?? true ? "drop-shadow-xl" : ""}
              />
            </motion.div>
          )}
          {!link.hideBusinessName && (link.businessNameHtml ? (
            <HtmlTitle
              html={link.businessName || "<p>Nome do Negócio</p>"}
              scale={(link.businessNameFontSize ?? 100) / 100}
              align={link.businessNameAlign ?? "center"}
            />
          ) : (
            <h1
              className="font-bold leading-tight break-words"
              style={{ color: accent, fontSize: `${link.businessNameFontSize ?? 24}px` }}
            >
              {link.businessName || "Nome do Negócio"}
            </h1>
          ))}
          {link.tagline && !link.hideTagline && (
            <p className={`text-xs mt-1 italic ${subtextClass}`}>{link.tagline}</p>
          )}
        </motion.div>

        {/* Buttons + Blocks */}
        <div key={`items-${animKey}`}>
          {items.map((item, idx) => {
            const itemDelay = 0.3 + idx * 0.08;
            const ev = getEntryVariants(entryAnim, itemDelay);
            const itemId = item.data.id;
            const isSelected = selectedId === itemId;

            const selectionWrapper = (children: React.ReactNode) => (
              <div
                key={itemId}
                onClick={onSelectElement ? (e) => { e.stopPropagation(); onSelectElement(itemId); } : undefined}
                style={isSelected
                  ? { outline: '2px solid #6366f1', outlineOffset: '3px', borderRadius: '12px', cursor: 'pointer', transition: 'outline 0.15s ease' }
                  : onSelectElement ? { cursor: 'pointer' } : undefined}
              >
                {children}
              </div>
            );

            if (item.kind === "button") {
              return selectionWrapper(
                <ButtonPreview
                  key={itemId}
                  btn={item.data}
                  accent={accent}
                  linkId={link.id}
                  entryVariants={ev}
                  onOpenPage={onSelectElement ? undefined : setOpenPageId}
                />
              );
            }

            return selectionWrapper(
              <BlockRenderer
                key={itemId}
                block={item.data}
                accent={accent}
                dark={dark}
                textClass={textClass}
                subtextClass={subtextClass}
                delay={itemDelay}
                linkId={link.id}
                entryVariants={ev}
                onOpenPage={onSelectElement ? undefined : setOpenPageId}
              />
            );
          })}

          {/* Ghost block — shown while dragging a block type over the preview */}
          {ghostBlockType && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="mx-1 mb-2"
            >
              <div className={`rounded-xl border-2 border-dashed px-4 py-3 text-center transition-colors ${
                dark
                  ? "border-white/30 bg-white/5 text-white/60"
                  : "border-primary/40 bg-primary/5 text-primary/70"
              }`}>
                <p className="text-[11px] font-medium">
                  {GHOST_BLOCK_LABELS[ghostBlockType] ?? "Novo bloco"}
                </p>
                <p className={`text-[10px] mt-0.5 ${dark ? "text-white/30" : "text-muted-foreground"}`}>
                  Solte para adicionar
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer — exibe marca d'água apenas no plano free */}
        {(!link.ownerPlan || link.ownerPlan === "free") && (
          <motion.div
            className="px-5 pb-6 pt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <a
              href="https://wa.me/5599984389747?text=Ol%C3%A1%2C+quero+criar+meu+Link+Pro%21"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-[10px] rounded-full px-3 py-1.5 shadow-md border cursor-pointer transition-opacity hover:opacity-80 ${
                dark ? "bg-white/10 backdrop-blur-sm border-white/10" : "bg-white border-gray-100"
              }`}
            >
              <span className={dark ? "text-white/50" : "text-gray-400"}>Feito pela</span>
              <Zap className="h-2.5 w-2.5" style={{ color: accent }} />
              <span className={`font-bold ${dark ? "text-white/80" : "text-gray-700"}`}>LinkPro</span>
            </a>
          </motion.div>
        )}
      </div>{/* end unified content container */}

      <SubPageModal page={openPage} link={link} onClose={() => setOpenPageId(null)} />
    </div>
  );
});

// Stable particle positions — computed once
const PARTICLE_CONFIGS = Array.from({ length: 6 }, (_, i) => ({
  width: 4 + (((i * 7 + 3) % 6)),
  height: 4 + (((i * 5 + 2) % 6)),
  left: `${10 + ((i * 13 + 5) % 80)}%`,
  top: `${10 + ((i * 17 + 11) % 80)}%`,
  duration: 4 + (i % 3),
  delay: i * 0.8,
}));

const DecorativeParticles = memo(function DecorativeParticles({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {PARTICLE_CONFIGS.map((p, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: p.width,
            height: p.height,
            left: p.left,
            top: p.top,
            backgroundColor: accent,
            opacity: 0.15,
          }}
          animate={{ y: [0, -30, 0], opacity: [0.1, 0.3, 0.1], scale: [1, 1.5, 1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
});
