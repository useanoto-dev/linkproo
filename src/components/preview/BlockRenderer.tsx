import { memo, useState, useCallback } from "react";
import type React from "react";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import { Video, MapPin, ImagePlus } from "lucide-react";
import { LinkBlock } from "@/types/smart-link";
import { getVideoEmbedUrl, getSpotifyEmbedUrl } from "./preview-utils";
import type { EntryVariants } from "./preview-utils";
import { CountdownBlock } from "./CountdownBlock";
import { FaqAccordionItem } from "./FaqAccordionItem";
import { AnimatedButtonBlock } from "./AnimatedButtonBlock";
import { FreeHtmlBlock } from "./FreeHtmlBlock";
import { EmailCaptureBlock } from "./EmailCaptureBlock";
import { CarouselBlock } from "./CarouselBlock";
import { MapBlock } from "./MapBlock";
import { ContactsBlock } from "./ContactsBlock";
import { recordClick } from "@/hooks/use-links";

// ─────────────────────────────────────────────────────────────────────────────

function EmptyBlockPlaceholder({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="border-2 border-dashed border-white/20 rounded-2xl mx-4 my-2 p-6 flex flex-col items-center gap-2 opacity-60">
      <Icon className="w-6 h-6 text-white/60" />
      <span className="text-xs text-white/60 text-center">{label}</span>
    </div>
  );
}

interface BlockRendererProps {
  block: LinkBlock;
  accent: string;
  dark: boolean;
  textClass: string;
  subtextClass: string;
  delay: number;
  linkId: string;
  entryVariants: EntryVariants;
  onOpenPage?: (pageId: string) => void;
}

export const BlockRenderer = memo(function BlockRenderer({
  block,
  accent,
  dark,
  textClass,
  subtextClass,
  delay,
  linkId,
  entryVariants: bev,
  onOpenPage,
}: BlockRendererProps) {
  const isNewLink = linkId.startsWith("new-");

  // Hook must be called unconditionally — BEFORE any early returns (Rules of Hooks)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [imgBlockError, setImgBlockError] = useState(false);
  const [imgBtnError, setImgBtnError] = useState(false);
  const [imgBtnRetryKey, setImgBtnRetryKey] = useState(0);
  const handleImgBlockError = useCallback(() => setImgBlockError(true), []);
  // Retry after 4s on transient failure; keeps block visible instead of vanishing permanently
  const handleImgBtnError = useCallback(() => {
    setImgBtnError(true);
    setTimeout(() => {
      setImgBtnError(false);
      setImgBtnRetryKey((k) => k + 1);
    }, 4000);
  }, []);

  // Scheduling visibility — hidden outside the configured window (skip in editor preview)
  if (!isNewLink && (block.visibleFrom || block.visibleUntil)) {
    const now = new Date();
    if (block.visibleFrom && now < new Date(block.visibleFrom)) return null;
    if (block.visibleUntil && now >= new Date(block.visibleUntil)) return null;
  }

  if (block.type === "image-button") {
    if (!block.buttonImageUrl || imgBtnError) {
      if (!isNewLink) return null;
      return <EmptyBlockPlaceholder icon={ImagePlus} label="Adicione uma imagem no editor" />;
    }
    const isPageBlock = !!block.blockPageId;
    const handleClick = (e: React.MouseEvent) => {
      if (isPageBlock) { e.preventDefault(); onOpenPage?.(block.blockPageId!); }
      if (!isNewLink) recordClick(linkId, block.id);
    };
    return (
      <div className="px-4 pb-2">
        <motion.a
          href={isPageBlock ? "#" : (block.buttonUrl || "#")}
          target={isPageBlock ? undefined : "_blank"}
          rel={isPageBlock ? undefined : "noopener noreferrer"}
          onClick={handleClick}
          initial={bev.initial}
          animate={bev.animate}
          transition={bev.transition}
          whileHover={{ scale: 1.04, y: -3, transition: { duration: 0.2 } }}
          className="block w-full rounded-2xl shadow-md transition-shadow hover:shadow-xl relative overflow-hidden group"
        >
          <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: `${block.buttonHeight ?? 148}px` }}>
            {/* alt uses button label; if absent, image is decorative since the link wraps the whole area */}
            <img key={imgBtnRetryKey} src={block.buttonImageUrl} alt={block.content || ""} loading="lazy" onError={handleImgBtnError} className="w-full h-full object-cover" style={{ minHeight: `${block.buttonHeight ?? 148}px` }} />
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: `inset 0 0 30px rgba(255,255,255,0.1), 0 0 20px ${accent}30` }}
            />
          </div>
        </motion.a>
      </div>
    );
  }

  if (block.type === "header" && block.content) {
    return (
      <motion.div className={`px-5 py-3 flex items-center gap-2 ${textClass}`}
        initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.5 }}
        style={{ color: block.blockTextColor || undefined, textAlign: block.blockTextAlign || undefined }}>
        {block.emoji && <span className="text-xl">{block.emoji}</span>}
        <h2 className="text-base font-bold">{block.content}</h2>
      </motion.div>
    );
  }

  if (block.type === "image" && block.imageUrl && !imgBlockError) {
    return (
      <motion.div className="px-4 py-2"
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.5 }}>
        <img src={block.imageUrl} alt={block.content || 'Imagem de destaque'} loading="lazy" onError={handleImgBlockError} className="w-full object-cover shadow-md" style={{ borderRadius: `${block.borderRadius ?? 12}px` }} />
      </motion.div>
    );
  }

  if (block.type === "video") {
    if (!block.videoUrl) {
      if (!isNewLink) return null;
      return <EmptyBlockPlaceholder icon={Video} label="Adicione uma URL de vídeo no editor" />;
    }
    const embedUrl = getVideoEmbedUrl(block.videoUrl);
    if (!embedUrl) return null;
    return (
      <motion.div className="px-4 py-2"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
        <div className="relative w-full rounded-2xl overflow-hidden shadow-md" style={{ paddingBottom: "56.25%" }}>
          <iframe src={embedUrl} className="absolute inset-0 w-full h-full"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen />
        </div>
      </motion.div>
    );
  }

  if (block.type === "spacer") {
    return <div style={{ height: `${block.height ?? 24}px` }} />;
  }

  if (block.type === "badges" && block.badges && block.badges.length > 0) {
    return (
      <motion.div className="flex justify-center gap-5 px-5 py-4 flex-wrap"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
        {block.badges.map((badge, bi) => (
          <motion.div key={badge.id} className="flex flex-col items-center gap-1.5"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + bi * 0.08 }} whileHover={{ scale: 1.15, y: -3 }}>
            <div className={`w-10 h-10 rounded-full ${badge.color} flex items-center justify-center shadow-lg`}>
              <span className="text-white text-lg">{badge.emoji}</span>
            </div>
            <span className={`text-[9px] font-semibold ${dark ? "text-white/70" : "text-gray-600"}`}>{badge.label}</span>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (block.type === "cta" && block.content) {
    return (
      <div className="px-4 py-3">
        <motion.div
          className={`rounded-2xl p-5 shadow-md text-center ${dark ? "bg-white/10 backdrop-blur-sm" : "bg-white"}`}
          style={{ borderWidth: 2, borderColor: accent + "40", textAlign: block.blockTextAlign || undefined }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.5 }} whileHover={{ y: -2, boxShadow: `0 8px 25px ${accent}20` }}>
          <h3 className="font-bold text-sm mb-1.5 leading-tight" style={{ color: block.blockTextColor || accent }}>{block.content}</h3>
          {block.subtitle && <p className={`text-[11px] leading-relaxed ${subtextClass}`}>{block.subtitle}</p>}
        </motion.div>
      </div>
    );
  }

  if (block.type === "text" && block.content) {
    return (
      <motion.div className={`px-5 py-2.5 text-xs leading-relaxed ${subtextClass}`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 0.5 }}
        style={{ color: block.blockTextColor || undefined, textAlign: block.blockTextAlign || "center" }}>
        <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.content || '', {
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'span', 'ul', 'ol', 'li'],
          ALLOWED_ATTR: ['href', 'target', 'rel'],
          FORCE_BODY: true,
        }) }} />
      </motion.div>
    );
  }

  if (block.type === "separator") {
    return (
      <motion.div className="px-6 py-3"
        initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay, duration: 0.4 }}>
        <div className="h-px" style={{ backgroundColor: accent + "30" }} />
      </motion.div>
    );
  }

  if (block.type === "countdown" && block.countdownDate) {
    return <CountdownBlock date={block.countdownDate} label={block.countdownLabel} accent={accent} dark={dark} delay={delay} />;
  }

  if (block.type === "faq" && block.faqItems && block.faqItems.length > 0) {
    return (
      <motion.div className="px-4 py-2 space-y-2"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
        {block.faqItems.map((fItem) => (
          <FaqAccordionItem key={fItem.id} item={fItem} accent={accent} dark={dark} />
        ))}
      </motion.div>
    );
  }

  if (block.type === "gallery" && block.galleryImages && block.galleryImages.length > 0) {
    const cols = block.galleryImages.length === 1 ? "grid-cols-1" : block.galleryImages.length === 2 ? "grid-cols-2" : "grid-cols-3";
    return (
      <>
        <motion.div className="px-4 py-2"
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
          <div className={`grid gap-1.5 ${cols}`}>
            {block.galleryImages.map((img, gi) => (
              <motion.div key={img.id} className="w-full aspect-square rounded-xl shadow-sm overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + gi * 0.05 }}>
                <img
                  src={img.url}
                  alt={img.caption || `Imagem ${gi + 1} da galeria`}
                  loading="lazy"
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setLightboxUrl(img.url)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
        {lightboxUrl && (
          <div
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Imagem ampliada"
            onClick={() => setLightboxUrl(null)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none"
              onClick={() => setLightboxUrl(null)}
              aria-label="Fechar"
            >
              ✕
            </button>
            <img
              src={lightboxUrl}
              alt="Imagem ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </>
    );
  }

  if (block.type === "testimonial" && block.content) {
    const stars = block.testimonialRating ?? 5;
    return (
      <motion.div className="px-4 py-2"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
        <div className={`rounded-2xl p-4 shadow-sm ${dark ? "bg-white/10 backdrop-blur-sm border border-white/10" : "bg-white border border-gray-100 shadow-md"}`}>
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-sm ${i < stars ? "opacity-100" : "opacity-20"}`}>⭐</span>
            ))}
          </div>
          <p className={`text-xs leading-relaxed italic mb-3 ${subtextClass}`}>"{block.content}"</p>
          <div className="flex items-center gap-2">
            {block.testimonialAvatar ? (
              <img src={block.testimonialAvatar} alt={block.testimonialName || 'Avatar'} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: accent }}>
                {(block.testimonialName || "?")[0].toUpperCase()}
              </div>
            )}
            <div>
              {block.testimonialName && <p className={`text-xs font-semibold ${textClass}`}>{block.testimonialName}</p>}
              {block.testimonialRole && <p className={`text-[10px] ${subtextClass}`}>{block.testimonialRole}</p>}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (block.type === "stats" && block.statItems && block.statItems.length > 0) {
    return (
      <motion.div className="px-4 py-3"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
        <div className={`flex justify-around gap-2 rounded-2xl p-4 ${dark ? "bg-white/10 border border-white/10" : "bg-white border border-gray-100 shadow-sm"}`}>
          {block.statItems.map((stat, si) => (
            <motion.div key={stat.id} className="text-center"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + si * 0.08 }}>
              <div className="text-xl font-black" style={{ color: accent }}>{stat.value}</div>
              <div className={`text-[10px] font-medium mt-0.5 ${subtextClass}`}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (block.type === "product" && block.productName) {
    return (
      <motion.div className="px-4 py-2"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
        <div className={`rounded-2xl overflow-hidden shadow-md ${dark ? "bg-white/10 border border-white/10" : "bg-white border border-gray-100"}`}>
          {block.productImage && (
            <img src={block.productImage} alt={block.productName || 'Imagem do produto'} loading="lazy" className="w-full h-40 object-cover" />
          )}
          <div className="p-3 space-y-2">
            <p className={`font-bold text-sm ${textClass}`}>{block.productName}</p>
            {block.productDescription && (
              <p className={`text-[11px] leading-relaxed ${subtextClass}`}>{block.productDescription}</p>
            )}
            <div className="flex items-center gap-2">
              {block.productOldPrice && (
                <span className={`text-xs line-through ${subtextClass} opacity-60`}>{block.productOldPrice}</span>
              )}
              {block.productPrice && (
                <span className="text-base font-black" style={{ color: accent }}>{block.productPrice}</span>
              )}
            </div>
            {block.productButtonLabel && (
              <a
                href={block.productButtonUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { if (!isNewLink) recordClick(linkId, block.id); }}
                className="block w-full py-2.5 rounded-xl text-center text-xs font-bold text-white shadow-md active:scale-95 transition-transform"
                style={{ background: accent }}
              >
                {block.productButtonLabel}
              </a>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (block.type === "email-capture") {
    return <EmailCaptureBlock block={block} accent={accent} dark={dark} textClass={textClass} delay={delay} linkId={linkId} />;
  }

  if (block.type === "spotify" && block.spotifyUrl) {
    const embedUrl = getSpotifyEmbedUrl(block.spotifyUrl);
    if (!embedUrl) return null;
    const height = block.spotifyCompact ? 80 : 152;
    return (
      <motion.div className="px-4 py-2"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
        <iframe
          src={embedUrl}
          width="100%"
          height={height}
          style={{ borderRadius: 16 }}
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="no-referrer-when-downgrade"
          loading="lazy"
        />
      </motion.div>
    );
  }

  if (block.type === "map") {
    if (!block.mapUrl && !block.mapAddress) {
      if (!isNewLink) return null;
      return <EmptyBlockPlaceholder icon={MapPin} label="Adicione um endereço no editor" />;
    }
    return <MapBlock block={block} accent={accent} dark={dark} textClass={textClass} delay={delay} linkId={linkId} isNewLink={isNewLink} />;
  }

  if (block.type === "html" && block.htmlContent) {
    return (
      <motion.div className="px-4 py-2"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
        <FreeHtmlBlock htmlContent={block.htmlContent} fixedHeight={block.htmlHeight || undefined} />
      </motion.div>
    );
  }

  if (block.type === "carousel") {
    return <CarouselBlock block={block} delay={delay} />;
  }

  if (block.type === "animated-button") {
    const handleClick = () => {
      if (!isNewLink) recordClick(linkId, block.id);
      if (block.blockPageId) onOpenPage?.(block.blockPageId);
    };
    return (
      <motion.div className="px-4 py-2"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
        <AnimatedButtonBlock
          block={block}
          dark={dark}
          onClick={handleClick}
          overrideUrl={block.blockPageId ? "#" : undefined}
        />
      </motion.div>
    );
  }

  if (block.type === "banner") {
    if (!block.content && !block.bannerTag && !block.subtitle) return null;
    const bg = block.bannerBg || accent;
    const bannerTextColor = block.blockTextColor || "white";
    return (
      <motion.div className="px-4 py-2"
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.4 }}>
        <div className="rounded-2xl p-4 text-center shadow-lg relative overflow-hidden" style={{ background: bg }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent pointer-events-none" />
          {block.bannerTag && (
            <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold mb-2" style={{ color: bannerTextColor }}>
              {block.bannerTag}
            </span>
          )}
          {block.content && (
            <p className="font-black text-base leading-tight relative z-10" style={{ color: bannerTextColor }}>{block.content}</p>
          )}
          {block.subtitle && (
            <p className="text-xs mt-1 relative z-10" style={{ color: bannerTextColor, opacity: 0.8 }}>{block.subtitle}</p>
          )}
        </div>
      </motion.div>
    );
  }

  if (block.type === "contacts") {
    return <ContactsBlock block={block} accent={accent} textClass={textClass} subtextClass={subtextClass} delay={delay} linkId={linkId} />;
  }

  // Legacy block types — intentionally hidden, no editor UI
  return null;
});
