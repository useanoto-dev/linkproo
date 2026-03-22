import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Zap, ArrowRight, Palette, BarChart3, MousePointerClick,
  Smartphone, Globe, Shield, Star, Check, Sparkles,
  ChevronRight, Layers
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: Palette,
    title: "100% Personalizável",
    desc: "Cores, fontes, gradientes, imagens de fundo — controle total sobre cada pixel da sua página.",
  },
  {
    icon: MousePointerClick,
    title: "Botões Visuais Premium",
    desc: "Cards com imagens, emojis flutuantes, gradientes customizados. Muito além dos botões simples.",
  },
  {
    icon: BarChart3,
    title: "Analytics em Tempo Real",
    desc: "Saiba exatamente quantas pessoas viram e clicaram. Dados por dispositivo e período.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First",
    desc: "Projetado para brilhar no celular. Preview em tempo real enquanto você edita.",
  },
  {
    icon: Globe,
    title: "Link Inteligente",
    desc: "WhatsApp, Instagram, TikTok, e-mail — geração automática de URLs a partir do seu usuário.",
  },
  {
    icon: Shield,
    title: "Seguro & Confiável",
    desc: "Infraestrutura profissional com SSL, CDN global e 99.9% de uptime garantido.",
  },
];

// Use centralized plans data
import { plans as planDefs } from "@/data/plans";
const landingPlans = planDefs.map((p) => ({
  name: p.name,
  price: p.price,
  period: p.period,
  desc: p.desc,
  features: p.features,
  cta: p.ctaUpgrade === "Plano Free" ? "Começar Grátis" : p.ctaUpgrade === "Assinar Business" ? "Falar com Vendas" : p.ctaUpgrade,
  popular: p.popular,
}));

const testimonials = [
  {
    name: "Marina Costa",
    role: "Influenciadora Digital",
    avatar: "MC",
    text: "Migrei do Linktree pro LinkPro e minha taxa de clique subiu 40%. Os botões visuais fazem toda a diferença.",
    stars: 5,
  },
  {
    name: "Rafael Santos",
    role: "Dono de Pizzaria",
    avatar: "RS",
    text: "Montei minha página em 5 minutos. Meus clientes adoram — parece um mini site profissional.",
    stars: 5,
  },
  {
    name: "Carla Mendes",
    role: "Social Media",
    avatar: "CM",
    text: "Uso pra todos os meus clientes. Os templates são incríveis e a personalização é absurda.",
    stars: 5,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#07060B] text-white overflow-hidden">
      {/* ═══════════ NAV ═══════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#07060B]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Link<span className="text-violet-400">Pro</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Recursos</a>
            <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Depoimentos</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="text-sm text-white/70 hover:text-white transition-colors px-3 py-2"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 active:scale-95"
            >
              Criar Conta
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            A alternativa premium ao Linktree
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
          >
            Seu link na bio
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              nunca mais será igual
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Crie páginas de link visuais e interativas que convertem. Botões com imagens,
            gradientes personalizados, analytics e muito mais — em minutos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate("/auth")}
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-base transition-all shadow-2xl shadow-violet-600/30 hover:shadow-violet-500/50 active:scale-95"
            >
              Começar Grátis
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#features"
              className="flex items-center gap-2 px-6 py-4 rounded-2xl text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              Ver Recursos
              <ChevronRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 flex items-center justify-center gap-8 sm:gap-16 flex-wrap"
          >
            {[
              { value: "2.5K+", label: "Usuários" },
              { value: "12K+", label: "Links criados" },
              { value: "1.2M+", label: "Cliques gerados" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-xs text-white/30 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-xs mx-auto mt-16"
        >
          <div className="relative rounded-[2.5rem] border-[4px] border-white/10 bg-gradient-to-b from-violet-950/80 to-[#07060B] overflow-hidden shadow-2xl shadow-violet-600/20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#07060B] rounded-b-2xl z-10" />
            <div className="p-6 pt-10 space-y-4">
              {/* Mock hero */}
              <div className="w-full h-28 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-end p-4">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-white/20 mb-2" />
                  <div className="h-3 w-24 rounded bg-white/80" />
                  <div className="h-2 w-16 rounded bg-white/40 mt-1" />
                </div>
              </div>
              {/* Mock buttons */}
              {[
                { from: "from-blue-600", to: "to-blue-800" },
                { from: "from-green-600", to: "to-green-800" },
                { from: "from-purple-600", to: "to-purple-800" },
              ].map((g, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.15 }}
                  className={`h-16 rounded-xl bg-gradient-to-r ${g.from} ${g.to} flex items-center px-4 gap-3`}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/15 shrink-0" />
                  <div className="flex-1">
                    <div className="h-2.5 w-20 rounded bg-white/70" />
                    <div className="h-2 w-14 rounded bg-white/30 mt-1.5" />
                  </div>
                </motion.div>
              ))}
              {/* Mock badges */}
              <div className="flex justify-center gap-4 py-2">
                {["⭐", "🛡️", "💰"].map((e) => (
                  <div key={e} className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">{e}</div>
                    <div className="h-1.5 w-8 rounded bg-white/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow behind phone */}
          <div className="absolute -inset-10 bg-violet-600/10 rounded-full blur-3xl -z-10" />
        </motion.div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-4">
              <Layers className="h-3 w-3" />
              Recursos
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Tudo que você precisa.
              <br />
              <span className="text-white/40">Nada que você não precisa.</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/40 max-w-lg mx-auto">
              Ferramentas profissionais para criar links que realmente convertem.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-violet-500/20 transition-all duration-500"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 group-hover:shadow-lg group-hover:shadow-violet-500/10 transition-all">
                  <f.icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="text-base font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section id="pricing" className="relative py-24 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-4">
              <Sparkles className="h-3 w-3" />
              Preços
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Simples e transparente
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/40 max-w-lg mx-auto">
              Comece grátis. Escale quando precisar.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {landingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className={`relative rounded-2xl p-6 border transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-b from-violet-950/60 to-violet-950/20 border-violet-500/30 shadow-xl shadow-violet-600/10"
                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-[11px] font-bold uppercase tracking-wider shadow-lg">
                    Mais Popular
                  </div>
                )}
                <div className="mb-6 pt-2">
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p className="text-xs text-white/40">{plan.desc}</p>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-white/30">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                      <Check className="h-4 w-4 text-violet-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/auth")}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    plan.popular
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40"
                      : "bg-white/5 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section id="testimonials" className="relative py-24 md:py-32">
        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-4">
              <Star className="h-3 w-3" />
              Depoimentos
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Amado por milhares
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl p-6 border border-white/5 bg-white/[0.02]"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-white/30">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/15 rounded-full blur-[120px]" />
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative max-w-3xl mx-auto px-6 text-center"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
            Pronto para criar seu
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              link profissional?
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-white/40 mb-10 max-w-lg mx-auto">
            Junte-se a milhares de criadores e negócios que já transformaram seu link na bio.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <button
              onClick={() => navigate("/auth")}
              className="group inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-lg transition-all shadow-2xl shadow-violet-600/30 hover:shadow-violet-500/50 active:scale-95"
            >
              Começar Grátis Agora
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs text-white/25 mt-4">Não precisa de cartão de crédito</p>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-bold">
              Link<span className="text-violet-400">Pro</span>
            </span>
          </div>
          <p className="text-xs text-white/25">© {new Date().getFullYear()} LinkPro. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
