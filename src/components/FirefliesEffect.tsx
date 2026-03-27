import { useEffect, useRef, useState } from "react";

interface Props { count: number; color: string; }

export function FirefliesEffect({ count, color }: Props) {
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

    const hexRgb = (hex: string) => {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : { r:255,g:220,b:100 };
    };
    const rgb = hexRgb(color);

    interface Fly { x: number; y: number; vx: number; vy: number; r: number; phase: number; phaseSpd: number; }
    const flies: Fly[] = Array.from({ length: count }, () => ({
      x: Math.random() * (w || 400), y: Math.random() * (h || 800),
      vx: (-0.5 + Math.random()) * 0.4, vy: (-0.5 + Math.random()) * 0.4,
      r: 3 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2, phaseSpd: 0.018 + Math.random() * 0.028,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // Set shadow blur once before the loop (reduced from 20 to 6 for GPU performance)
      ctx.shadowBlur = 6;
      for (const f of flies) {
        f.phase += f.phaseSpd;
        f.vx += (-0.2 + Math.random() * 0.4) * 0.08;
        f.vy += (-0.2 + Math.random() * 0.4) * 0.08;
        f.vx = Math.max(-0.55, Math.min(0.55, f.vx));
        f.vy = Math.max(-0.55, Math.min(0.55, f.vy));
        f.x += f.vx; f.y += f.vy;
        if (f.x < 0) f.x = w; if (f.x > w) f.x = 0;
        if (f.y < 0) f.y = h; if (f.y > h) f.y = 0;

        const op = 0.55 + 0.45 * ((Math.sin(f.phase) + 1) / 2);
        ctx.shadowColor = `rgba(${rgb.r},${rgb.g},${rgb.b},${op * 0.9})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${op})`;
        ctx.fill();
      }
      // Reset shadow blur after the loop to avoid leaking into other draws
      ctx.shadowBlur = 0;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); };
  }, [isVisible, count, color]);

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
