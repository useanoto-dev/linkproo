import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingSection =
  | 'dashboard'
  | 'meus-links'
  | 'criar-link'
  | 'analytics'
  | 'videoaulas'
  | 'suporte'
  | 'configuracoes'
  | null;

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  highlight: OnboardingSection;
  action?: string; // CTA button text
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 0,
    title: "Bem-vindo ao LinkPro! 👋",
    description: "Aqui no Dashboard você tem uma visão geral do seu link: visualizações, cliques e desempenho em tempo real.",
    highlight: 'dashboard',
    action: "Próximo",
  },
  {
    id: 1,
    title: "Seus Links Inteligentes",
    description: "Em Meus Links você gerencia seu link inteligente — veja estatísticas, ative ou desative, e acesse o editor a qualquer momento.",
    highlight: 'meus-links',
    action: "Próximo",
  },
  {
    id: 2,
    title: "Criar seu Link",
    description: "Clique em Criar Link para escolher um template profissional e personalizar com as cores, botões e informações do seu negócio.",
    highlight: 'criar-link',
    action: "Próximo",
  },
  {
    id: 3,
    title: "Analytics em Tempo Real",
    description: "Analytics mostra de onde vêm seus visitantes, quais botões clicam mais e como seu link performa ao longo do tempo.",
    highlight: 'analytics',
    action: "Próximo",
  },
  {
    id: 4,
    title: "Videoaulas Exclusivas",
    description: "Acesse videoaulas para aprender a extrair o máximo do LinkPro — desde criar seu primeiro link até estratégias avançadas.",
    highlight: 'videoaulas',
    action: "Próximo",
  },
  {
    id: 5,
    title: "Configurações do Perfil",
    description: "Em Configurações você personaliza seu nome, avatar e dados do seu perfil público.",
    highlight: 'configuracoes',
    action: "Concluir tour",
  },
];

interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  completed: boolean;
  start: () => void;
  next: () => void;
  skip: () => void;
  reset: () => void;
  currentHighlight: () => OnboardingSection;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentStep: 0,
      completed: false,
      start: () => set({ isActive: true, currentStep: 0 }),
      next: () => {
        const { currentStep } = get();
        const isLast = currentStep >= ONBOARDING_STEPS.length - 1;
        if (isLast) {
          set({ isActive: false, completed: true });
        } else {
          set({ currentStep: currentStep + 1 });
        }
      },
      skip: () => set({ isActive: false, completed: true }),
      reset: () => set({ isActive: false, currentStep: 0, completed: false }),
      currentHighlight: () => {
        const { isActive, currentStep } = get();
        if (!isActive) return null;
        return ONBOARDING_STEPS[currentStep]?.highlight ?? null;
      },
    }),
    {
      name: 'linkpro-onboarding-v2',
      partialize: (state) => ({ completed: state.completed }),
    }
  )
);
