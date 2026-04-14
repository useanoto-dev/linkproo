import { useEffect, useRef, useState } from "react";
import { isMobileDevice, canvasFrameInterval } from "@/lib/device-utils";

interface SnowEffectProps {
  intensity: number; // 5-100
  color: string;
}

export function SnowEffect({ intensity, color }: SnowEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isIntersectingRef = useRef(false);

  // IntersectionObserver: pause when off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersectingRef.current = entry.isIntersecting;
        setIsVisible(entry.isIntersecting && !document.hidden);
      },
      { threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // visibilitychange: pause when tab is hidden, resume when visible again
  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(isIntersectingRef.current && !document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (!isVisible) return; // don't start RAF when off-screen / tab hidden

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w;
      canvas.height = h;
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Reduce particle count on mobile to prevent CPU starvation
    const isMobile = isMobileDevice();
    const frameInterval = canvasFrameInterval(isMobile);
    const count = Math.max(10, Math.floor((intensity / 100) * (isMobile ? 40 : 80)));

    interface Particle {
      x: number;
      y: number;
      r: number;
      speed: number;
      wind: number;
      opacity: number;
    }

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * (w || 400),
      y: Math.random() * (h || 800),
      r: 1 + Math.random() * 2.5,
      speed: 0.3 + Math.random() * 1.2,
      wind: -0.3 + Math.random() * 0.6,
      opacity: 0.3 + Math.random() * 0.5,
    }));

    let lastFrame = 0;
    const draw = (now: number) => {
      animRef.current = requestAnimationFrame(draw);
      if (frameInterval > 0 && now - lastFrame < frameInterval) return;
      lastFrame = now;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        p.y += p.speed;
        p.x += p.wind + Math.sin(p.y * 0.01) * 0.3;

        if (p.y > h + 10) {
          p.y = -10;
          p.x = Math.random() * w;
        }
        if (p.x > w + 10) p.x = -10;
        if (p.x < -10) p.x = w + 10;
      }

      ctx.globalAlpha = 1;
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [isVisible, intensity, color]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-30">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}
