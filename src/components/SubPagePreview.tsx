import { useEffect } from "react";
import { ArrowLeft, Zap } from "lucide-react";
import { SubPage, SmartLink } from "@/types/smart-link";
import { getCustomBgGradient } from "@/lib/color-utils";
import { BlockRenderer } from "@/components/preview/BlockRenderer";
import {
  isDarkBg,
  FONT_LINKS,
  loadGoogleFont,
  getEntryVariants,
} from "@/components/preview/preview-utils";

interface SubPagePreviewProps {
  page: SubPage;
  link: SmartLink;
  /** If provided, the back-arrow becomes a clickable button that calls this handler. */
  onBack?: () => void;
}

// A static "no animation" entry variants object — sub-pages have their own
// slide-up entrance via SubPageModal, so individual blocks don't need it.
const STATIC_ENTRY = getEntryVariants("none", 0);

export function SubPagePreview({ page, link, onBack }: SubPagePreviewProps) {
  const bgSource = page.backgroundColor || link.backgroundColor;
  const dark = isDarkBg(bgSource);
  const accent = link.accentColor || "#f59e0b";
  const textClass = dark ? "text-white" : "text-gray-900";
  const subtextClass = dark ? "text-white/60" : "text-gray-500";
  const customBg = getCustomBgGradient(bgSource);
  const fontKey = page.fontFamily || link.fontFamily || "Inter";
  const fontFamily = FONT_LINKS[fontKey] || "'Inter', sans-serif";

  useEffect(() => {
    if (fontKey) loadGoogleFont(fontKey);
  }, [fontKey]);

  const bgStyle = customBg
    ? { background: customBg, fontFamily }
    : { fontFamily };
  const bgClass = customBg ? "" : `bg-gradient-to-b ${bgSource}`;

  const sortedBlocks = page.blocks
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className={`min-h-full ${bgClass} relative`} style={bgStyle}>
      {/* Header */}
      <div
        className={`flex items-center gap-3 px-4 py-3 backdrop-blur-sm ${
          dark
            ? "bg-white/5 border-b border-white/10"
            : "bg-white/80 border-b border-gray-200"
        }`}
      >
        {onBack ? (
          <button
            onClick={onBack}
            className={`p-2 rounded-xl transition-colors ${
              dark
                ? "bg-white/10 text-white/70 hover:bg-white/20"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : (
          <div
            className={`p-2 rounded-xl ${
              dark ? "bg-white/10 text-white/70" : "bg-gray-100 text-gray-600"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
          </div>
        )}
        <h2 className={`text-sm font-bold ${textClass} truncate`}>
          {page.title || "Sem título"}
        </h2>
      </div>

      {/* Content */}
      <div className="py-4 space-y-2">
        {sortedBlocks.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className={`text-xs ${subtextClass}`}>Adicione blocos à página</p>
          </div>
        )}

        {sortedBlocks.map((block, idx) => (
          <BlockRenderer
            key={block.id}
            block={block}
            accent={accent}
            dark={dark}
            textClass={textClass}
            subtextClass={subtextClass}
            delay={idx * 0.06}
            linkId={link.id}
            entryVariants={STATIC_ENTRY}
            onOpenPage={undefined}
          />
        ))}
      </div>

      {/* Footer — exibe marca d'água apenas no plano free */}
      {(!link.ownerPlan || link.ownerPlan === "free") && (
        <div className="px-5 pb-6 pt-2 text-center">
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
        </div>
      )}
    </div>
  );
}
