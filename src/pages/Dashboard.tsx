import { motion } from "framer-motion";
import { Eye, MousePointerClick, Link as LinkIcon, TrendingUp, Plus, ArrowRight, Layout, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { templates, templateCategories } from "@/data/templates";
import { useLinks, useLinkStats } from "@/hooks/use-links";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { toast } from "sonner";
import type { LinkTemplate } from "@/data/templates";

/** Derives a CSS background style for the template card preview area. */
function getTemplateBgStyle(tpl: LinkTemplate): React.CSSProperties {
  const { heroImage, backgroundColor, accentColor } = tpl.template;

  if (heroImage) {
    return {};
  }

  // Map Tailwind gradient classes to hex colours
  const tailwindToHex: Record<string, string> = {
    "red-950": "#450a0a",
    "red-900": "#7f1d1d",
    "red-800": "#991b1b",
    "orange-950": "#431407",
    "orange-900": "#7c2d12",
    "amber-950": "#431407",
    "amber-900": "#78350f",
    "yellow-950": "#422006",
    "yellow-900": "#713f12",
    "green-950": "#052e16",
    "green-900": "#14532d",
    "emerald-950": "#022c22",
    "teal-950": "#042f2e",
    "cyan-950": "#083344",
    "sky-950": "#082f49",
    "blue-950": "#172554",
    "blue-900": "#1e3a5f",
    "indigo-950": "#1e1b4b",
    "violet-950": "#2e1065",
    "purple-950": "#3b0764",
    "fuchsia-950": "#2d0a30",
    "pink-950": "#500724",
    "rose-950": "#4c0519",
    "slate-950": "#020617",
    "slate-900": "#0f172a",
    "slate-800": "#1e293b",
    "zinc-950": "#09090b",
    "zinc-900": "#18181b",
    "gray-950": "#030712",
    "gray-900": "#111827",
    "stone-950": "#0c0a09",
    "stone-900": "#1c1917",
    "neutral-950": "#0a0a0a",
    "neutral-900": "#171717",
  };

  const fromMatch = backgroundColor?.match(/from-([\w]+-\d+)/);
  const toMatch = backgroundColor?.match(/to-([\w]+-\d+)/);
  const fromHex = fromMatch ? tailwindToHex[fromMatch[1]] : null;
  const toHex = toMatch ? tailwindToHex[toMatch[1]] : null;

  if (fromHex && toHex) {
    return { background: `linear-gradient(135deg, ${fromHex}, ${toHex})` };
  }
  if (fromHex) {
    return { background: fromHex };
  }

  // Fallback: use accentColor
  return {
    background: accentColor
      ? `linear-gradient(135deg, ${accentColor}cc, ${accentColor}66)`
      : "linear-gradient(135deg, #6366f1, #8b5cf6)",
  };
}

interface TemplateCardProps {
  tpl: LinkTemplate;
  i: number;
  onUse: (id: string) => void;
}

function TemplateCard({ tpl, i, onUse }: TemplateCardProps) {
  const bgStyle = getTemplateBgStyle(tpl);
  const hasHeroImage = !!tpl.template.heroImage;
  const hasBgHtml = !!tpl.template.bgHtml?.enabled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(i * 0.04, 0.35), duration: 0.22 }}
      onClick={() => onUse(tpl.id)}
      className="group shrink-0 w-44 rounded-xl border border-border bg-card overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5"
    >
      {/* Preview area — 3:2 aspect */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "3 / 2", ...bgStyle }}
      >
        {hasHeroImage && (
          <img
            src={tpl.template.heroImage}
            alt={tpl.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        )}

        {/* Animated bg indicator */}
        {hasBgHtml && !hasHeroImage && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-[9px] font-semibold tracking-wide flex items-center gap-0.5 z-10">
            ✨ Animado
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Template name */}
        <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2">
          <p className="text-white text-[12px] font-semibold leading-snug drop-shadow-sm truncate">
            {tpl.name}
          </p>
          <p className="text-white/60 text-[10px] truncate">{tpl.categoryEmoji}</p>
        </div>
      </div>

      {/* Card body */}
      <div className="px-2.5 pt-2 pb-2.5">
        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed mb-2">
          {tpl.description}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onUse(tpl.id); }}
          className="w-full flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/8 hover:bg-primary/15 text-primary text-[10px] font-medium transition-colors duration-200 cursor-pointer"
        >
          Usar modelo
          <ArrowRight className="h-2.5 w-2.5" />
        </button>
      </div>
    </motion.div>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: links = [], isLoading: linksLoading } = useLinks();
  const { data: stats, isLoading: statsLoading } = useLinkStats();
  const { isAtLimit, limits, totalLinks } = usePlanLimits();

  const isLoading = linksLoading || statsLoading;
  const totalViews = stats?.totalViews ?? 0;
  const totalClicks = stats?.totalClicks ?? 0;
  const conversionRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  const statCards = [
    { label: "Links Ativos", value: String(stats?.activeLinks ?? 0), icon: LinkIcon, change: `${stats?.totalLinks ?? 0} total` },
    { label: "Visualizações", value: totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}K` : String(totalViews), icon: Eye, change: "Total acumulado" },
    { label: "Cliques", value: totalClicks > 1000 ? `${(totalClicks / 1000).toFixed(1)}K` : String(totalClicks), icon: MousePointerClick, change: "Total acumulado" },
    { label: "Taxa de Conversão", value: `${conversionRate}%`, icon: TrendingUp, change: "Cliques / Visualizações" },
  ];

  const filteredTemplates = selectedCategory
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  // Categories that have at least one template
  const activeCategories = templateCategories.filter(cat =>
    templates.some(t => t.category === cat.id)
  );

  const handleUseTemplate = (templateId: string) => {
    navigate(`/links/new?template=${templateId}`);
  };

  return (
    <DashboardLayout title="Dashboard">
      <OnboardingDialog />

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.25 }}
            className="bg-card border border-border rounded-xl p-4 relative"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </span>
                {isLoading ? (
                  <Skeleton className="h-7 w-16 rounded mt-1.5" />
                ) : (
                  <p className="text-2xl font-semibold text-foreground mt-1 leading-none">
                    {stat.value}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1.5">{stat.change}</p>
              </div>
              <div className="shrink-0 ml-2 mt-0.5 p-1.5 rounded-lg bg-muted/60">
                <stat.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div className="flex flex-wrap gap-2.5 mb-10 items-center">
        <button
          onClick={() => {
            if (isAtLimit) {
              toast.error(
                `Limite atingido! Plano ${limits.label} permite até ${limits.maxLinks} links. Faça upgrade para continuar.`
              );
              return;
            }
            navigate("/links/new");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            isAtLimit
              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
              : "bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
          }`}
        >
          <Plus className="h-4 w-4" />
          Criar do Zero
        </button>
        <button
          onClick={() => navigate("/links")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted/60 transition-all duration-200 cursor-pointer"
        >
          <LinkIcon className="h-4 w-4" />
          Meus Links ({links.length})
        </button>
        <span className="text-xs text-muted-foreground ml-1">
          {totalLinks}/{limits.maxLinks === Infinity ? "∞" : limits.maxLinks} links usados
        </span>
      </div>

      {/* ── Templates Library ── */}
      <section className="py-2">
        {/* Section header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Layout className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display text-xl font-semibold text-foreground tracking-tight">
              Biblioteca de Modelos
            </h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {templates.length} modelos
            </span>
          </div>
          <p className="text-sm text-muted-foreground pl-6">
            Escolha um modelo para começar em segundos
          </p>
        </div>

        {/* Category filter pills — horizontal scrollable */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              !selectedCategory
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            Todos
          </button>
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Template sections */}
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Layout className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Nenhum modelo nesta categoria</p>
            <p className="text-xs text-muted-foreground">Tente selecionar outra categoria ou ver todos os modelos.</p>
          </div>
        ) : selectedCategory ? (
          /* Single category: horizontal scroll */
          <div
            className="flex gap-3 overflow-x-auto pb-3"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {filteredTemplates.map((tpl, i) => (
              <TemplateCard key={tpl.id} tpl={tpl} i={i} onUse={handleUseTemplate} />
            ))}
          </div>
        ) : (
          /* All: grouped by category with horizontal rows */
          <div className="space-y-8">
            {activeCategories.map((cat) => {
              const catTemplates = templates.filter(t => t.category === cat.id);
              if (catTemplates.length === 0) return null;
              return (
                <div key={cat.id}>
                  {/* Category header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{cat.emoji}</span>
                      <h3 className="text-sm font-semibold text-foreground">{cat.label}</h3>
                      <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                        {catTemplates.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedCategory(cat.id)}
                      className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors cursor-pointer"
                    >
                      Ver todos
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  {/* Horizontal scroll row */}
                  <div
                    className="flex gap-3 overflow-x-auto pb-2"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {catTemplates.map((tpl, i) => (
                      <TemplateCard key={tpl.id} tpl={tpl} i={i} onUse={handleUseTemplate} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default Dashboard;
