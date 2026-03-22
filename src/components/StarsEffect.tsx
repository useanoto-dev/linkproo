import { useEffect, useRef, useState } from "react";

interface Props { count: number; color: string; shooting: boolean; }

export function StarsEffect({ count, color, shooting }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // IntersectionObserver: pause when off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // visibilitychange: pause when tab is backgrounded
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setIsVisible(false);
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
      return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : { r:255,g:255,b:255 };
    };
    const rgb = hexRgb(color);

    interface Star { x: number; y: number; r: number; phase: number; phaseSpd: number; bright: number; }
    interface Shooter { x: number; y: number; vx: number; vy: number; len: number; opacity: number; life: number; }

    let stars: Star[] = [];
    let shooters: Shooter[] = [];

    const initStars = () => {
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * (w || 400),
        y: Math.random() * (h || 800),
        r: 0.8 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        phaseSpd: 0.008 + Math.random() * 0.025,
        bright: 0.6 + Math.random() * 0.4,
      }));
    };
    initStars();

    let shootTimer = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Twinkling stars
      for (const s of stars) {
        s.phase += s.phaseSpd;
        const op = s.bright * (0.4 + 0.6 * ((Math.sin(s.phase) + 1) / 2));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${op})`;
        ctx.fill();
      }

      // Shooting stars
      if (shooting) {
        shootTimer++;
        if (shootTimer > 120 + Math.random() * 240) {
          shootTimer = 0;
          shooters.push({
            x: Math.random() * (w || 400) * 0.7,
            y: Math.random() * (h || 800) * 0.3,
            vx: 4 + Math.random() * 6,
            vy: 2 + Math.random() * 4,
            len: 60 + Math.random() * 80,
            opacity: 1,
            life: 0,
          });
        }

        shooters = shooters.filter((sh) => sh.opacity > 0.02);
        for (const sh of shooters) {
          sh.life++;
          sh.x += sh.vx;
          sh.y += sh.vy;
          sh.opacity -= 0.025;

          const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 10, sh.y - sh.vy * 10);
          grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${sh.opacity})`);
          grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
          ctx.beginPath();
          ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(sh.x - sh.vx * 10, sh.y - sh.vy * 10);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); };
  }, [isVisible, count, color, shooting]);

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
