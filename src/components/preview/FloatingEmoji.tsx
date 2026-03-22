import { memo, useMemo } from "react";
import { motion } from "framer-motion";

export const FloatingEmoji = memo(function FloatingEmoji({ emoji, delay }: { emoji: string; delay: number }) {
  const left = useMemo(() => Math.random() * 80 + 10, []);
  const duration = useMemo(() => 5 + Math.random() * 3, []);
  const repeatDelay = useMemo(() => 1 + Math.random() * 2, []);

  return (
    <motion.span
      className="absolute text-3xl pointer-events-none select-none z-20"
      style={{ left: `${left}%`, willChange: "transform, opacity" }}
      initial={{ y: "110%", opacity: 0 }}
      animate={{ y: "-10%", opacity: [0, 0.7, 0.5, 0] }}
      transition={{ duration, delay, repeat: Infinity, repeatDelay, ease: "linear" }}
    >
      {emoji}
    </motion.span>
  );
});
