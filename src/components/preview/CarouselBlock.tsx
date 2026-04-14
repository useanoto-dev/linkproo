import { memo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LinkBlock, CarouselSlide } from "@/types/smart-link";

interface CarouselBlockProps {
  block: LinkBlock;
  delay: number;
}

export const CarouselBlock = memo(function CarouselBlock({ block, delay }: CarouselBlockProps) {
  const [idx, setIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const slides: CarouselSlide[] = block.carouselSlides || [];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !block.carouselAutoplay || slides.length <= 1) return;
    const timer = setInterval(() => setIdx(i => (i + 1) % slides.length), 3000);
    return () => clearInterval(timer);
  }, [isVisible, block.carouselAutoplay, slides.length]);

  if (!slides.length) return null;

  return (
    <motion.div className="px-4 py-2" ref={ref}
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
        {slides.map((slide, i) => {
          const shouldRender = Math.abs(i - idx) <= 1 ||
            (i === 0 && idx === slides.length - 1) ||
            (i === slides.length - 1 && idx === 0);
          return (
            <motion.img
              key={slide.id}
              src={shouldRender ? slide.url : undefined}
              alt={slide.caption || `Slide ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              initial={{ opacity: 0 }}
              animate={{ opacity: i === idx ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              aria-hidden={i !== idx}
            />
          );
        })}
        {/* aria-live announces slide change to screen readers */}
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
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer bg-white ${i === idx ? "w-3 opacity-100" : "w-1.5 opacity-50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
});
