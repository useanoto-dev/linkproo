import { Zap, Crown, Rocket, type LucideIcon } from "lucide-react";

export interface PlanDefinition {
  key: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  border: string;
  popular: boolean;
  features: string[];
  cta: string;
  ctaUpgrade: string;
}

export const plans: PlanDefinition[] = [
  {
    key: "free",
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    desc: "Perfeito para começar",
    icon: Zap,
    color: "text-muted-foreground",
    border: "border-border",
    popular: false,
    features: [
      "Até 3 links",
      "Blocos básicos",
      "Analytics simples",
      "Marca d'água LinkPro",
    ],
    cta: "Plano Atual",
    ctaUpgrade: "Plano Free",
  },
  {
    key: "pro",
    name: "Pro",
    price: "R$ 29",
    period: "/mês",
    desc: "Para profissionais e negócios",
    icon: Crown,
    color: "text-primary",
    border: "border-primary",
    popular: true,
    features: [
      "Até 50 links",
      "Todos os blocos",
      "Analytics avançado",
      "Domínio personalizado",
      "Sem marca d'água",
      "Suporte prioritário",
    ],
    cta: "Plano Atual",
    ctaUpgrade: "Assinar Pro",
  },
  {
    key: "business",
    name: "Business",
    price: "R$ 79",
    period: "/mês",
    desc: "Para agências e equipes",
    icon: Rocket,
    color: "text-accent",
    border: "border-accent",
    popular: false,
    features: [
      "Tudo do Pro",
      "Múltiplos domínios",
      "API de integração",
      "White-label completo",
      "Analytics em tempo real",
      "Suporte dedicado",
    ],
    cta: "Plano Atual",
    ctaUpgrade: "Assinar Business",
  },
];
