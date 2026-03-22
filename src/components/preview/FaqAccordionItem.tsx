import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FaqAccordionItemProps {
  item: { question: string; answer: string };
  accent: string;
  dark: boolean;
}

export function FaqAccordionItem({ item, accent, dark }: FaqAccordionItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-xl overflow-hidden border ${dark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left ${dark ? "text-white/90" : "text-gray-800"}`}
      >
        <span className="text-xs font-semibold pr-2">{item.question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={`px-4 pb-3 text-[11px] leading-relaxed ${dark ? "text-white/60" : "text-gray-500"}`}>
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
