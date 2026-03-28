import { memo, useState, useEffect, useMemo, useRef } from "react";
import type React from "react";
import { motion } from "framer-motion";
import type { TargetAndTransition } from "framer-motion";
import DOMPurify from "dompurify";
import { Video, MapPin, ImagePlus } from "lucide-react";
import { LinkBlock, CarouselSlide, ContactItem } from "@/types/smart-link";
import { getVideoEmbedUrl, getSpotifyEmbedUrl, getMapEmbedUrl, isShortMapLink } from "./preview-utils";
import { CountdownBlock } from "./CountdownBlock";
import { FaqAccordionItem } from "./FaqAccordionItem";
import { recordClick } from "@/hooks/use-links";
import { saveEmailCapture } from "@/hooks/use-email-captures";
import { AnimatedButtonBlock } from "./AnimatedButtonBlock";

// ─── FreeHtmlBlock ────────────────────────────────────────────────────────────
// Renders user-provided HTML/CSS/scripts inside an isolated iframe.
// - sandbox="allow-scripts": JS runs but cannot access parent DOM or cookies.
// - Auto-height: postMessage reports body.scrollHeight when no fixed height set.
// - Fixed height: renders with scrollbar if content overflows.

function FreeHtmlBlock({ htmlContent, fixedHeight }: { htmlContent: string; fixedHeight?: number }) {
  const [autoHeight, setAutoHeight] = useState(150);
  // useRef gives a stable ID that never triggers useMemo/useEffect deps changes
  const msgIdRef = useRef(`fhb-${Math.random().toString(36).slice(2)}`);
  const msgId = msgIdRef.current;

  useEffect(() => {
    if (fixedHeight) return;
    function onMsg(e: MessageEvent) {
      if (e.data?.type === "fhb-height" && e.data?.id === msgId && typeof e.data.height === "number") {
        setAutoHeight(Math.max(40, Math.min(e.data.height + 4, 2400)));
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [fixedHeight, msgId]);

  const srcDoc = useMemo(() => {
    const id = JSON.stringify(msgId);
    // background:transparent lets the page theme show through the iframe
    const baseStyle = `<style>*{box-sizing:border-box;}html,body{margin:0;padding:0;width:100%;background:transparent;}</style>`;
    // Robust height measurement: handles absolute/fixed/flex/grid layouts
    const reporter = fixedHeight
      ? ""
      : `<scr` +
        `ipt>` +
        `function _rep(){` +
          `var h=0;` +
          `try{` +
            `h=Math.max(` +
              `document.body?document.body.scrollHeight:0,` +
              `document.body?document.body.offsetHeight:0,` +
              `document.documentElement?document.documentElement.scrollHeight:0,` +
              `document.documentElement?document.documentElement.offsetHeight:0` +
            `);` +
            `if(h<10){var els=document.querySelectorAll("body > *");for(var i=0;i<els.length;i++){var r=els[i].getBoundingClientRect();h=Math.max(h,r.bottom+(window.pageYOffset||0));}}` +
            `if(h<10)h=window.innerHeight||150;` +
          `}catch(e){h=150;}` +
          `window.parent.postMessage({type:'fhb-height',id:${id},height:h},'*');` +
        `}` +
        `window.addEventListener('load',_rep);` +
        `new MutationObserver(_rep).observe(document.body,{childList:true,subtree:true,attributes:true});` +
        `setTimeout(_rep,200);setTimeout(_rep,800);</scr` +
        `ipt>`;

    let doc = htmlContent;
    if (doc.includes("</head>")) {
      // Full HTML with </head> tag
      doc = doc.replace("</head>", baseStyle + "</head>");
    } else if (/<body[\s>]/i.test(doc)) {
      // Full HTML with <body> but no </head> — inject before <body>
      doc = doc.replace(/<body[\s>]/i, (m) => baseStyle + m);
    } else if (/^\s*<!|^\s*<html[\s>]/i.test(doc)) {
      // DOCTYPE or <html> with no head/body — prepend style
      doc = baseStyle + doc;
    } else {
      // Plain snippet — wrap in complete HTML document
      doc = `<html><head>${baseStyle}</head><body>${doc}</body></html>`;
    }
    return doc.includes("</body>")
      ? doc.replace("</body>", reporter + "</body>")
      : doc + reporter;
  }, [htmlContent, fixedHeight, msgId]);

  const height = fixedHeight || autoHeight;

  return (
    // key=srcDoc forces a full iframe remount whenever HTML changes (reliable across all browsers)
    <iframe
      key={srcDoc}
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      scrolling={fixedHeight ? "yes" : "no"}
      title="html-livre"
      style={{
        width: "100%",
        height,
        border: "none",
        display: "block",
        borderRadius: 12,
        overflow: "hidden",
        background: "transparent",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function EmptyBlockPlaceholder({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="border-2 border-dashed border-white/20 rounded-2xl mx-4 my-2 p-6 flex flex-col items-center gap-2 opacity-60">
      <Icon className="w-6 h-6 text-white/60" />
      <span className="text-xs text-white/60 text-center">{label}</span>
    </div>
  );
}

const EmailCaptureBlock = memo(function EmailCaptureBlock({
  block, accent, dark, textClass, delay, linkId
}: { block: LinkBlock; accent: string; dark: boolean; textClass: string; delay: number; linkId: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setSubmitted(true);
    saveEmailCapture(linkId, email, block.id).catch((err) => {
      console.error('[EmailCapture] Falha ao salvar email:', err);
      // UX não é revertida — usuário já viu "sucesso"
      // Em produção: integrar Sentry aqui
    });
  };

  if (submitted) {
    return (
      <motion.div className="px-4 py-2"
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className={`rounded-2xl p-4 text-center ${dark ? "bg-white/10 border border-white/10" : "bg-white border border-gray-100 shadow-sm"}`}>
          <div className="text-2xl mb-1">✅</div>
          <p className={`text-xs font-medium ${textClass}`}>
            {block.emailSuccessMessage || "Obrigado! Em breve você receberá nossas novidades."}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="px-4 py-2"
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
      <div className={`rounded-2xl p-4 space-y-2 ${dark ? "bg-white/10 border border-white/10" : "bg-white border border-gray-100 shadow-sm"}`}>
        {block.content && <p className={`text-xs font-semibold text-center ${textClass}`}>{block.content}</p>}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={block.emailPlaceholder || "seu@email.com"}
          className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${dark ? "bg-white/10 border-white/20 text-white placeholder:text-white/40" : "bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400"}`}
        />
        <button
          onClick={handleSubmit}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-transform cursor-pointer"
          style={{ background: accent }}
        >
          {block.emailButtonLabel || "Quero receber!"}
        </button>
      </div>
    </motion.div>
  );
});

const CarouselBlock = memo(function CarouselBlock({
  block, delay
}: { block: LinkBlock; delay: number }) {
  const [idx, setIdx] = useState(0);
  const [isCarouselVisible, setIsCarouselVisible] = useState(false);
  const slides: CarouselSlide[] = block.carouselSlides || [];
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsCarouselVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isCarouselVisible || !block.carouselAutoplay || slides.length <= 1) return;
    const timer = setInterval(() => setIdx(i => (i + 1) % slides.length), 3000);
    return () => clearInterval(timer);
  }, [isCarouselVisible, block.carouselAutoplay, slides.length]);

  const goTo = (i: number) => {
    setIdx(i);
  };

  if (!slides.length) return null;

  return (
    <motion.div className="px-4 py-2" ref={carouselRef}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}>
      <div
        className="relative rounded-2xl overflow-hidden shadow-md outline-none"
        style={{ aspectRatio: "16/9" }}
        role="region"
        aria-label="Carrossel de slides"
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + slides.length) % slides.length);
          if (e.key === 'ArrowRight') setIdx(i => (i + 1) % slides.length);
        }}
      >
        {slides.map((slide, i) => (
          <motion.img
            key={slide.id}
            src={slide.url}
            alt={slide.caption || `Slide ${i + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: i === idx ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            aria-hidden={i !== idx}
          />
        ))}
        {/* aria-live anuncia mudança de slide para screen readers */}
        <div aria-live="polite" className="sr-only">
          {slides[idx]?.caption || `Slide ${idx + 1} de ${slides.length}`}
        </div>
        {slides.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1" role="tablist" aria-label="Slides">
            {slides.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === idx}
                aria-label={`Slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer bg-white ${i === idx ? "w-3 opacity-100" : "w-1.5 opacity-50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
});

interface BlockRendererProps {
  block: LinkBlock;
  accent: string;
  dark: boolean;
  textClass: string;
  subtextClass: string;
  delay: number;
  linkId: string;
  entryVariants: { initial: TargetAndTransition; animate: TargetAndTransition; transition: Record<string, unknown> };
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

  // Scheduling visibility — hidden outside the configured window (skip in editor preview)
  if (!isNewLink && (block.visibleFrom || block.visibleUntil)) {
    const now = new Date();
    if (block.visibleFrom && now < new Date(block.visibleFrom)) return null;
    if (block.visibleUntil && now >= new Date(block.visibleUntil)) return null;
  }

  if (block.type === "image-button") {
    if (!block.buttonImageUrl) {
      if (!isNewLink) return null;
      return <EmptyBlockPlaceholder icon={ImagePlus} label="Adicione uma imagem no editor" />;
    }
    const isPageBlock = !!block.blockPageId;
    const handleImageButtonClick = (e: React.MouseEvent) => {
      if (isPageBlock) {
        e.preventDefault();
        onOpenPage?.(block.blockPageId!);
      }
      if (!isNewLink) recordClick(linkId, block.id);
    };
    return (
      <div className="px-4 pb-2">
        <motion.a
          href={isPageBlock ? "#" : (block.buttonUrl || "#")}
          target={isPageBlock ? undefined : "_blank"}
          rel={isPageBlock ? undefined : "noopener noreferrer"}
          onClick={handleImageButtonClick}
          initial={bev.initial}
          animate={bev.animate}
          transition={bev.transition}
          whileHover={{ scale: 1.04, y: -3, transition: { duration: 0.2 } }}
          className="block w-full rounded-2xl shadow-lg hover:shadow-2xl transition-all relative overflow-hidden group"
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}
        >
          <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: `${block.buttonHeight ?? 148}px` }}>
            {/* alt usa o label do botão; se ausente a imagem é decorativa pois o link envolve toda a área */}
            <img src={block.buttonImageUrl} alt={block.content || ""} loading="lazy" className="w-full h-full object-cover" style={{ minHeight: `${block.buttonHeight ?? 148}px` }} />
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

  if (block.type === "image" && block.imageUrl) {
    return (
      <motion.div className="px-4 py-2"
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.5 }}>
        <img src={block.imageUrl} alt={block.content || 'Imagem de destaque'} className="w-full object-cover shadow-md" style={{ borderRadius: `${block.borderRadius ?? 12}px` }} />
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
    return (
      <>
        <motion.div className="px-4 py-2"
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
          <div className={`grid gap-1.5 ${block.galleryImages.length === 1 ? "grid-cols-1" : block.galleryImages.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
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

  if (block.type === "map" && !block.mapUrl && !block.mapAddress) {
    if (!isNewLink) return null;
    return <EmptyBlockPlaceholder icon={MapPin} label="Adicione um endereço no editor" />;
  }

  if (block.type === "map" && (block.mapUrl || block.mapAddress)) {
    // Priority: address field generates embed directly
    const addressEmbed = block.mapAddress
      ? `https://maps.google.com/maps?q=${encodeURIComponent(block.mapAddress)}&output=embed&hl=pt-BR`
      : null;
    const urlEmbed = block.mapUrl ? getMapEmbedUrl(block.mapUrl) : null;
    const embedUrl = addressEmbed || urlEmbed;
    const openUrl = block.mapUrl || (block.mapAddress ? `https://maps.google.com/maps?q=${encodeURIComponent(block.mapAddress)}` : null);

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

  if (block.type === "html" && block.htmlContent) {
    return (
      <motion.div
        className="px-4 py-2"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
      >
        <FreeHtmlBlock
          htmlContent={block.htmlContent}
          fixedHeight={block.htmlHeight || undefined}
        />
      </motion.div>
    );
  }

  if (block.type === "carousel") {
    return <CarouselBlock block={block} delay={delay} />;
  }

  if (block.type === "animated-button") {
    const handleAnimButtonClick = () => {
      if (!isNewLink) recordClick(linkId, block.id);
      if (block.blockPageId) {
        onOpenPage?.(block.blockPageId);
      }
    };
    return (
      <motion.div
        className="px-4 py-2"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
      >
        <AnimatedButtonBlock
          block={block}
          dark={dark}
          onClick={handleAnimButtonClick}
          overrideUrl={block.blockPageId ? "#" : undefined}
        />
      </motion.div>
    );
  }

  if (block.type === "banner") {
    // Hide completely if nothing to show (avoids empty box in public view)
    if (!block.content && !block.bannerTag && !block.subtitle) return null;
    const bg = block.bannerBg || accent;
    // blockTextColor overrides the default white text on the banner
    const bannerTextColor = block.blockTextColor || "white";
    return (
      <motion.div className="px-4 py-2"
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.4 }}>
        <div
          className="rounded-2xl p-4 text-center shadow-lg relative overflow-hidden"
          style={{ background: bg }}
        >
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

  // ─── Contacts block ─────────────────────────────────────────────────────────
  if (block.type === "contacts") {
    const contacts: ContactItem[] = block.contactsList || [];
    const mode = block.contactsMode || 1;
    const visible = contacts.slice(0, mode);

    if (visible.length === 0) return null;

    const ContactCard = ({ contact }: { contact: ContactItem }) => {
      const waUrl = contact.whatsappNumber
        ? `https://wa.me/${contact.whatsappNumber.replace(/\D/g, "")}${contact.whatsappMessage ? `?text=${encodeURIComponent(contact.whatsappMessage)}` : ""}`
        : undefined;

      return (
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          {/* Circular photo or placeholder */}
          <div className="relative">
            {contact.photo ? (
              <img
                src={contact.photo}
                alt={contact.name}
                className="w-16 h-16 rounded-full object-cover border-2"
                style={{ borderColor: `${accent}60` }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ background: `${accent}30`, color: accent }}
              >
                {contact.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name */}
          <div className="text-center">
            <p className={`text-sm font-semibold leading-tight ${textClass}`}>{contact.name}</p>
            {contact.role && (
              <p className={`text-[11px] mt-0.5 ${subtextClass}`}>{contact.role}</p>
            )}
          </div>

          {/* WhatsApp button */}
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { if (linkId) recordClick(linkId); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all active:scale-95"
              style={{ background: "#25D366", color: "#fff" }}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          )}
        </div>
      );
    };

    return (
      <motion.div
        className="px-4 py-3"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
      >
        {mode === 1 ? (
          <div className="flex justify-center">
            <ContactCard contact={visible[0]} />
          </div>
        ) : (
          <div className="flex gap-3 justify-center">
            {visible.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  // Legacy / unsupported block types — show nothing in public view.
  // 'hero' and 'info' are old types that have no editor UI or renderer.
  // They fall through intentionally so existing data with these types
  // renders as empty rather than crashing.
  if (block.type === "hero" || block.type === "info") {
    return null; // Intentionally hidden — legacy data
  }

  return null;
});
