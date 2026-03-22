import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { plans } from "@/data/plans";

export default function PlansPage() {
  const { data: profile } = useProfile();
  const currentPlan = profile?.plan || "free";

  return (
    <DashboardLayout title="Planos">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold text-foreground">Escolha seu plano</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Upgrade para desbloquear recursos avançados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => {
            const isCurrentPlan = currentPlan === plan.key;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-xl border ${plan.border} bg-card p-6 relative ${plan.popular ? "ring-2 ring-primary/30" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                    Popular
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                    Seu plano
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <plan.icon className={`h-5 w-5 ${plan.color}`} />
                  <h3 className="font-display font-bold text-foreground">{plan.name}</h3>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-display font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className={`h-4 w-4 shrink-0 ${plan.color}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={isCurrentPlan}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    isCurrentPlan
                      ? "bg-secondary text-muted-foreground cursor-not-allowed"
                      : plan.popular
                      ? "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
                      : "bg-secondary text-foreground border border-border hover:bg-secondary/80"
                  }`}
                >
                  {isCurrentPlan ? plan.cta : plan.ctaUpgrade}
                </button>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          💳 O pagamento será processado de forma segura via Stripe. Cancele a qualquer momento.
        </p>
      </div>
    </DashboardLayout>
  );
}
