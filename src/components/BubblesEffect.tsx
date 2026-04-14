import { useEffect, useRef, useState } from "react";
import { isMobileDevice, canvasFrameInterval } from "@/lib/device-utils";

interface Props { intensity: number; color: string; }

export function BubblesEffect({ intensity, color }: Props) {
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

    const isMobile = isMobileDevice();
    const frameInterval = canvasFrameInterval(isMobile);
    const effectiveIntensity = isMobile ? Math.floor(intensity * 0.5) : intensity;
    const count = Math.max(5, Math.floor((effectiveIntensity / 100) * 35));

    interface Bubble { x: number; y: number; r: number; speed: number; sway: number; swaySpd: number; swayPhase: number; opacity: number; }
    const hexRgb = (hex: string) => {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : { r:255,g:255,b:255 };
    };
    const rgb = hexRgb(color);
    const bubbles: Bubble[] = Array.from({ length: count }, () => ({
      x: Math.random() * (w || 400),
      y: (h || 800) + Math.random() * 300,
      r: 5 + Math.random() * 18,
      speed: 0.25 + Math.random() * 0.7,
      sway: 0.3 + Math.random() * 0.8,
      swaySpd: 0.008 + Math.random() * 0.015,
      swayPhase: Math.random() * Math.PI * 2,
      opacity: 0.35 + Math.random() * 0.45,
    }));

    let lastFrame = 0;
    const draw = (now: number) => {
      animRef.current = requestAnimationFrame(draw);
      if (frameInterval > 0 && now - lastFrame < frameInterval) return;
      lastFrame = now;
      ctx.clearRect(0, 0, w, h);
      for (const b of bubbles) {
        b.swayPhase += b.swaySpd;
        b.x += Math.sin(b.swayPhase) * b.sway;
        b.y -= b.speed;
        if (b.y < -b.r * 2) { b.y = (h || 800) + b.r; b.x = Math.random() * w; }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${b.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // specular highlight
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.32, b.r * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${b.opacity * 0.55})`;
        ctx.fill();
      }
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); };
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
