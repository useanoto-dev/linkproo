import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { SmartLink } from "@/types/smart-link";

interface WatermarkFooterProps {
  link: SmartLink;
  dark: boolean;
  accent: string;
}

export function WatermarkFooter({ link, dark, accent }: WatermarkFooterProps) {
  const showWatermark = link.watermarkEnabled !== undefined
    ? link.watermarkEnabled
    : (!link.ownerPlan || link.ownerPlan === "free");

  if (!showWatermark) return null;

  return (
    <motion.div
      className="px-5 pb-6 pt-4 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <a
        href={link.watermarkUrl || "https://wa.me/5599984389747?text=Ol%C3%A1%2C+quero+criar+meu+Link+Pro%21"}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 text-[10px] rounded-full px-3 py-1.5 shadow-md border cursor-pointer transition-opacity hover:opacity-80 ${
          dark ? "bg-white/10 backdrop-blur-sm border-white/10" : "bg-white border-gray-100"
        }`}
      >
        <span className={dark ? "text-white/50" : "text-gray-400"}>Feito pela</span>
        <Zap className="h-2.5 w-2.5" style={{ color: accent }} />
        <span className={`font-bold ${dark ? "text-white/80" : "text-gray-700"}`}>LinkPro</span>
      </a>
    </motion.div>
  );
}
