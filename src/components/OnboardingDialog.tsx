import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Palette, MousePointerClick, BarChart3, ArrowRight, X } from "lucide-react";

const steps = [
  {
    icon: Zap,
    title: "Bem-vindo ao LinkPro! 🎉",
    desc: "Crie páginas de link profissionais e interativas em minutos. Vamos te mostrar como.",
  },
  {
    icon: MousePointerClick,
    title: "Escolha um Modelo",
    desc: "Comece com um modelo pronto ou crie do zero. Cada modelo já vem com botões visuais, cores e layout prontos.",
  },
  {
    icon: Palette,
    title: "Personalize Tudo",
    desc: "Mude cores, fontes, imagens e gradientes. Adicione blocos como FAQ, countdown, galeria e muito mais.",
  },
  {
    icon: BarChart3,
    title: "Publique e Acompanhe",
    desc: "Seu link fica ativo instantaneamente. Acompanhe visualizações e cliques em tempo real no dashboard.",
  },
];

export function OnboardingDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("linkpro_onboarding_seen");
    if (!seen) {
      // Small delay to not block initial render
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("linkpro_onboarding_seen", "true");
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  if (!open) return null;

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
      >
        <div className="flex justify-end p-3 pb-0">
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-6 pb-2 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <current.icon className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-display text-lg font-bold text-foreground mb-2">
              {current.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {current.desc}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="px-6 pb-6 pt-4">
          {/* Step indicators */}
          <div className="flex justify-center gap-1.5 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all active:scale-95"
          >
            {step < steps.length - 1 ? "Próximo" : "Começar!"}
            <ArrowRight className="h-4 w-4" />
          </button>

          {step < steps.length - 1 && (
            <button
              onClick={handleClose}
              className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Pular introdução
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
