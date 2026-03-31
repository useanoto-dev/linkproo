import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Sparkles } from "lucide-react";
import { useOnboardingStore, ONBOARDING_STEPS } from "@/stores/onboarding-store";

export function OnboardingTour() {
  const { isActive, currentStep, next, skip } = useOnboardingStore();
  const step = ONBOARDING_STEPS[currentStep];
  const total = ONBOARDING_STEPS.length;

  return (
    <AnimatePresence>
      {isActive && step && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-[calc(var(--sidebar-width,256px)+16px)] z-50 w-80 max-w-[calc(100vw-2rem)]"
          style={{ '--sidebar-width': '256px' } as React.CSSProperties}
        >
          <div className="relative bg-background/95 backdrop-blur-md border border-border/60 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            {/* Progress bar */}
            <div className="h-0.5 bg-muted w-full">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: `${(currentStep / total) * 100}%` }}
                animate={{ width: `${((currentStep + 1) / total) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {currentStep + 1} de {total}
                  </span>
                </div>
                <button
                  onClick={skip}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-md hover:bg-muted"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Content */}
              <h3 className="font-semibold text-sm text-foreground mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>

              {/* Step dots */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-1">
                  {ONBOARDING_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === currentStep
                          ? 'w-4 bg-primary'
                          : i < currentStep
                          ? 'w-1.5 bg-primary/40'
                          : 'w-1.5 bg-muted-foreground/20'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  className="flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {step.action || "Próximo"}
                  {currentStep < total - 1 && <ChevronRight className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
