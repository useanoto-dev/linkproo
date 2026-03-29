import React from "react";
import { SmartLink, SmartLinkButton, LinkBlock, BlockType } from "@/types/smart-link";
import { useMemo, useEffect, useState, useRef, memo } from "react";
import { extractBgColor } from "@/lib/color-utils";
import { SubPageModal } from "@/components/SubPageModal";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { BackgroundEffects } from "@/components/preview/BackgroundEffects";
import { HeroImage } from "@/components/preview/HeroImage";
import { BusinessInfo } from "@/components/preview/BusinessInfo";
import { WatermarkFooter } from "@/components/preview/WatermarkFooter";
import { GhostBlock } from "@/components/preview/GhostBlock";
import { ButtonPreview } from "@/components/preview/ButtonPreview";
import { BlockRenderer } from "@/components/preview/BlockRenderer";
import { isDarkBg, parseCustomBg, FONT_LINKS, loadGoogleFont, getEntryVariants } from "@/components/preview/preview-utils";

interface SmartLinkPreviewProps {
  link: SmartLink;
  selectedId?: string;
  ghostBlockType?: BlockType;
  onSelectElement?: (id: string) => void;
}

export const SmartLinkPreview = memo(function SmartLinkPreview({ link, selectedId, ghostBlockType, onSelectElement }: SmartLinkPreviewProps) {
  const hasContent = link.businessName || link.heroImage || link.buttons.length > 0 || link.blocks.length > 0;
  const dark = isDarkBg(link.backgroundColor);
  const customBg = parseCustomBg(link.backgroundColor);
  const heroBgColor = extractBgColor(link.backgroundColor);
  const accent = link.accentColor || "#f59e0b";
  const entryAnim = link.entryAnimation ?? "fade-up";
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

  const isBioMode = link.headerStyle === 'bio' && !!link.heroImage;
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
  // banner renders in a single uniform tone. Custom two-color backgrounds keep their gradient.
  const bgStyle = customBg
    ? { background: customBg, fontFamily }
    : { background: heroBgColor, fontFamily };

  // Unique ID for clip-path so multiple previews on the same page don't conflict
  const curveClipId = `banner-curve-${link.id}`;
  // Classic overlap only when: no bio mode, has hero, no custom bgHtml, curve OFF
  const showClassicOverlap = !isBioMode && !!link.heroImage && !link.bgHtml?.enabled && !link.bannerCurve;

  return (
    <div className="min-h-full relative overflow-hidden" style={bgStyle}>
      {/* SVG clip-path definition for banner curve */}
      {link.heroImage && link.bannerCurve && (() => {
        // intensity 0 = flat (y=1.0), intensity 100 = very curved (y=0.55)
        const intensity = link.bannerCurveIntensity ?? 50;
        const y = (1.0 - (intensity / 100) * 0.45).toFixed(3);
        return (
          <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden', pointerEvents: 'none' }}>
            <defs>
              <clipPath id={curveClipId} clipPathUnits="objectBoundingBox">
                <path d={`M 0,0 L 1,0 L 1,1 C 0.7,${y} 0.3,${y} 0,1 Z`} />
              </clipPath>
            </defs>
          </svg>
        );
      })()}

      <BackgroundEffects link={link} />

      <HeroImage link={link} heroBgColor={heroBgColor} isBioMode={isBioMode} curveClipId={curveClipId} />

      {/* Single unified content container */}
      <div
        className={`relative z-10 ${showClassicOverlap ? "-mt-3 rounded-t-2xl shadow-[0_-2px_16px_rgba(0,0,0,0.10)]" : ""}`}
        style={showClassicOverlap ? bgStyle : undefined}
      >
        <BusinessInfo
          link={link}
          isBioMode={isBioMode}
          dark={dark}
          accent={accent}
          fontFamily={fontFamily}
          subtextClass={subtextClass}
        />

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

          {ghostBlockType && (
            <GhostBlock blockType={ghostBlockType} dark={dark} />
          )}
        </div>

        <WatermarkFooter link={link} dark={dark} accent={accent} />
      </div>

      {link.whatsappFloat?.enabled && (
        <WhatsAppFloat config={link.whatsappFloat} />
      )}

      <SubPageModal page={openPage} link={link} onClose={() => setOpenPageId(null)} />
    </div>
  );
});
