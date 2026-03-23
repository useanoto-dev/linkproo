import { memo, useState, useEffect, useRef } from "react";
import type React from "react";
import { motion } from "framer-motion";
import type { TargetAndTransition } from "framer-motion";
import DOMPurify from "dompurify";
import { Video, MapPin, ImagePlus } from "lucide-react";
import { LinkBlock, CarouselSlide } from "@/types/smart-link";
import { getVideoEmbedUrl, getSpotifyEmbedUrl, getMapEmbedUrl, isShortMapLink } from "./preview-utils";
import { CountdownBlock } from "./CountdownBlock";
import { FaqAccordionItem } from "./FaqAccordionItem";
import { recordClick } from "@/hooks/use-links";
import { saveEmailCapture } from "@/hooks/use-email-captures";
import { AnimatedButtonBlock } from "./AnimatedButtonBlock";

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
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

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
          <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: `${block.buttonHeight ?? 110}px` }}>
            {/* alt usa o label do botão; se ausente a imagem é decorativa pois o link envolve toda a área */}
            <img src={block.buttonImageUrl} alt={block.content || ""} loading="lazy" className="w-full h-full object-cover" style={{ minHeight: `${block.buttonHeight ?? 110}px` }} />
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
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
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
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
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
      <motion.div className="px-4 py-2"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
        <div
          className="w-full overflow-hidden rounded-xl"
          style={{ height: block.htmlHeight || 'auto', minHeight: 60, maxHeight: 800 }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.htmlContent || '', {
            ALLOWED_TAGS: ['div', 'span', 'p', 'a', 'b', 'i', 'em', 'strong', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'img', 'video', 'iframe', 'br', 'hr', 'table', 'tr', 'td', 'th', 'thead', 'tbody'],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style', 'target', 'rel', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow'],
            FORCE_BODY: false,
            ADD_TAGS: ['iframe'],
            ADD_ATTR: ['allowfullscreen', 'frameborder', 'allow'],
          }) }}
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

  // Legacy / unsupported block types — show nothing in public view.
  // 'hero' and 'info' are old types that have no editor UI or renderer.
  // They fall through intentionally so existing data with these types
  // renders as empty rather than crashing.
  if (block.type === "hero" || block.type === "info") {
    return null; // Intentionally hidden — legacy data
  }

  return null;
});
