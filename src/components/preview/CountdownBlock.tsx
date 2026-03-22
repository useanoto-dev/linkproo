import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function useCountdown(targetDate: string, isVisible: boolean) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!isVisible) return;
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };
    setTimeLeft(calc()); // Recalculate when becoming visible again
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [isVisible, targetDate]);
  return timeLeft;
}

interface CountdownBlockProps {
  date: string;
  label?: string;
  accent: string;
  dark: boolean;
  delay: number;
}

export function CountdownBlock({ date, label, accent, dark, delay }: CountdownBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true); // default true for initial render

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

  const t = useCountdown(date, isVisible);
  const units = [
    { value: t.days, label: "Dias" },
    { value: t.hours, label: "Hrs" },
    { value: t.minutes, label: "Min" },
    { value: t.seconds, label: "Seg" },
  ];
  return (
    <motion.div
      ref={containerRef}
      className="px-4 py-3"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      {label && (
        <p className={`text-center text-xs font-semibold mb-2 ${dark ? "text-white/70" : "text-gray-600"}`}>
          {label}
        </p>
      )}
      <div className="flex justify-center gap-2">
        {units.map((u) => (
          <div
            key={u.label}
            className={`flex flex-col items-center rounded-xl px-3 py-2 min-w-[52px] ${
              dark ? "bg-white/10 backdrop-blur-sm" : "bg-white shadow-sm"
            }`}
          >
            <span className="text-lg font-bold tabular-nums" style={{ color: accent }}>
              {String(u.value).padStart(2, "0")}
            </span>
            <span className={`text-[9px] font-medium ${dark ? "text-white/50" : "text-gray-400"}`}>
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
