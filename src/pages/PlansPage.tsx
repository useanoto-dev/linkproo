import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Zap, Gift, Link, LifeBuoy } from "lucide-react";

export default function PlansPage() {
  return (
    <DashboardLayout title="Planos">
      <div className="max-w-2xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center"
        >
          <div className="flex items-center justify-center mb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Gift className="h-7 w-7 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Plataforma gratuita por 1 ano
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto mb-8">
            Durante nosso período de lançamento, o LinkPro está disponível gratuitamente para todos os usuários. Aproveite e crie seu link inteligente sem nenhum custo.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Plano de lançamento</p>
                <p className="text-xs text-muted-foreground mt-0.5">Gratuito por 12 meses a partir do cadastro</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                <Link className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">1 link inteligente</p>
                <p className="text-xs text-muted-foreground mt-0.5">Personalizável, com analytics e domínio LinkPro</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 text-left">
            <div className="flex items-center gap-2 mb-2">
              <LifeBuoy className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Precisa de mais recursos?</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Se você precisar de links adicionais ou funcionalidades avançadas, entre em contato com nossa equipe de suporte e encontraremos a melhor solução para você.
            </p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
