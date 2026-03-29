import { memo, useState } from "react";
import { motion } from "framer-motion";
import { LinkBlock } from "@/types/smart-link";
import { saveEmailCapture } from "@/hooks/use-email-captures";
import { toast } from "sonner";

interface EmailCaptureBlockProps {
  block: LinkBlock;
  accent: string;
  dark: boolean;
  textClass: string;
  delay: number;
  linkId: string;
}

export const EmailCaptureBlock = memo(function EmailCaptureBlock({
  block, accent, dark, textClass, delay, linkId
}: EmailCaptureBlockProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setSubmitted(true);
    saveEmailCapture(linkId, email, block.id).catch((err) => {
      console.error('[EmailCapture] Falha ao salvar email:', err);
      toast.error('Não foi possível registrar seu e-mail. Tente novamente.');
    });
  };

  if (submitted) {
    return (
      <motion.div className="px-4 py-2"
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className={`rounded-2xl p-4 text-center ${dark ? "bg-white/10 border border-white/10" : "bg-white border border-gray-100 shadow-sm"}`}>
          <div className="text-2xl mb-1">✅</div>
          <p className={`text-xs font-medium ${textClass}`}>
            {block.emailSuccessMessage || "Obrigado! Em breve você receberá nossas novidades."}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="px-4 py-2"
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
      <div className={`rounded-2xl p-4 space-y-2 ${dark ? "bg-white/10 border border-white/10" : "bg-white border border-gray-100 shadow-sm"}`}>
        {block.content && <p className={`text-xs font-semibold text-center ${textClass}`}>{block.content}</p>}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={block.emailPlaceholder || "seu@email.com"}
          className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${dark ? "bg-white/10 border-white/20 text-white placeholder:text-white/40" : "bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400"}`}
        />
        <button
          onClick={handleSubmit}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-transform cursor-pointer"
          style={{ background: accent }}
        >
          {block.emailButtonLabel || "Quero receber!"}
        </button>
      </div>
    </motion.div>
  );
});
