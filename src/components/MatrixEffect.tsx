import { useEffect, useRef, useState } from "react";
import { isMobileDevice, canvasFrameInterval } from "@/lib/device-utils";

interface Props { speed: number; color: string; }

export function MatrixEffect({ speed, color }: Props) {
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
    let w = 0, h = 0;
    const resize = () => {
      const p = canvas.parentElement;
      if (!p) return;
      w = p.clientWidth; h = p.clientHeight;
      canvas.width = w; canvas.height = h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const FONT_SIZE = 13;
    const TRAIL_LEN = 16;
    const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF@#$%";

    const hexRgb = (hex: string) => {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : { r:0,g:255,b:70 };
    };
    const rgb = hexRgb(color);

    interface Column {
      x: number;
      headY: number;
      speed: number;
      trail: Array<{ y: number; char: string }>;
      active: boolean;
      delay: number;
    }

    const isMobile = isMobileDevice();
    const frameInterval = canvasFrameInterval(isMobile);

    let columns: Column[] = [];
    const initCols = () => {
      const rawCols = Math.max(1, Math.floor((w || 400) / FONT_SIZE));
      const numCols = isMobile ? Math.floor(rawCols * 0.5) : rawCols;
      columns = Array.from({ length: numCols }, (_, i) => ({
        x: i * FONT_SIZE,
        headY: -Math.random() * (h || 800),
        speed: (0.4 + Math.random() * 0.8) * (speed / 5),
        trail: [],
        active: true,
        delay: Math.random() * 60,
      }));
    };
    initCols();

    let lastFrame = 0;
    const draw = (now: number) => {
      animRef.current = requestAnimationFrame(draw);
      if (frameInterval > 0 && now - lastFrame < frameInterval) return;
      lastFrame = now;
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${FONT_SIZE}px monospace`;

      for (const col of columns) {
        if (col.delay > 0) { col.delay--; continue; }

        // advance head
        col.headY += col.speed;

        // push to trail
        col.trail.push({ y: col.headY, char: CHARS[Math.floor(Math.random() * CHARS.length)] });
        if (col.trail.length > TRAIL_LEN) col.trail.shift();

        // reset when fully off screen (trail gone + head past bottom)
        if (col.headY > (h || 800) + FONT_SIZE * TRAIL_LEN) {
          col.headY = -Math.random() * (h || 800) * 0.5;
          col.trail = [];
          col.delay = Math.random() * 80;
        }

        // draw trail (fading)
        col.trail.forEach((t, idx) => {
          const isHead = idx === col.trail.length - 1;
          const fade = (idx + 1) / TRAIL_LEN;
          if (isHead) {
            ctx.fillStyle = `rgba(255,255,255,0.95)`;
          } else {
            ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${fade * 0.85})`;
          }
          ctx.fillText(t.char, col.x, t.y);
        });
      }

    };

    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); };
  }, [isVisible, speed, color]);

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
