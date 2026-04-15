import { motion } from "framer-motion";
import { Eye, MousePointerClick, Link as LinkIcon, TrendingUp, Plus, Layout } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import React, { useState, useMemo, useEffect } from "react";
import { useLinks, useLinkStats } from "@/hooks/use-links";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { toast } from "sonner";
import type { LinkTemplate } from "@/data/templates";
import { useOnboardingStore } from "@/stores/onboarding-store";

// Style-filter category IDs — these cross-cut niches and filter by styleTag
const STYLE_CATEGORIES = new Set(['minimalistas', 'escuros', 'claros']);

/** Derives a CSS background style for the template card preview area. */
function getTemplateBgStyle(tpl: LinkTemplate, skipHeroImage = false): React.CSSProperties {
  const { heroImage, backgroundColor, accentColor } = tpl.template;

  if (heroImage && !skipHeroImage) {
    return {};
  }

  // Handle custom: format — "custom:#RRGGBB" or "custom:#RRGGBB:#RRGGBB"
  if (backgroundColor?.startsWith("custom:")) {
    const parts = backgroundColor.slice(7).split(":");
    if (parts.length >= 2) {
      return { background: `linear-gradient(135deg, ${parts[0]}, ${parts[1]})` };
    }
    return { background: parts[0] };
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

function isDarkBgColor(bg: string | undefined): boolean {
  if (!bg) return true;
  if (bg.startsWith("custom:")) {
    const hex = bg.slice(7).split(":")[0];
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  }
  return bg.includes("950") || bg.includes("900") || bg.includes("800") || bg.includes("dark");
}

interface TemplateCardProps {
  tpl: LinkTemplate;
  i: number;
  onUse: (id: string) => void;
}

function TemplateCard({ tpl, i, onUse }: TemplateCardProps) {
  const [imgFailed, setImgFailed] = React.useState(false);
  const bgStyle = getTemplateBgStyle(tpl, imgFailed);
  const hasPreviewImage = !!tpl.previewImage && !imgFailed;
  const hasHeroImage = !hasPreviewImage && !!tpl.template.heroImage && !imgFailed;
  const hasBgHtml = !!tpl.template.bgHtml?.enabled;
  const accent = tpl.template.accentColor || "#6366f1";
  const isDark = isDarkBgColor(tpl.template.backgroundColor);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.2 }}
      onClick={() => onUse(tpl.id)}
      className="group relative rounded-xl border border-border bg-card overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 hover:border-primary/30"
    >
      {/* Preview area - portrait */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4", ...bgStyle }}>
        {/* Priority 1: explicit previewImage thumbnail */}
        {hasPreviewImage && (
          <img
            src={tpl.previewImage}
            alt={tpl.name}
            loading="eager"
            decoding="async"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        )}

        {/* Priority 2: hero image */}
        {hasHeroImage && (
          <img
            src={tpl.template.heroImage}
            alt={tpl.name}
            loading="eager"
            decoding="async"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        )}

        {/* Priority 3: CSS mini-preview — button bars + name */}
        {!hasPreviewImage && !hasHeroImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
            {/* Simulated business name */}
            <div
              className="text-[10px] font-bold tracking-wide truncate max-w-full"
              style={{ color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)" }}
            >
              {tpl.template.businessName || tpl.name}
            </div>
            {/* 3 simulated button bars */}
            <div className="w-full space-y-1.5">
              {[0.85, 0.7, 0.6].map((opacity, bi) => (
                <div
                  key={bi}
                  className="w-full rounded-lg"
                  style={{ height: "20px", background: accent, opacity }}
                />
              ))}
            </div>
            {/* Animated pulse for bgHtml templates */}
            {hasBgHtml && (
              <div className="absolute inset-0 animate-pulse bg-white/5 rounded-xl" />
            )}
          </div>
        )}

        {/* Hover overlay with "Usar" button */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-black text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg">
            Usar modelo
          </span>
        </div>

        {/* Bottom gradient + name */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pt-8 pb-2 px-2.5">
          <p className="text-white text-[11px] font-semibold leading-tight truncate">{tpl.name}</p>
        </div>

        {/* Animated badge */}
        {hasBgHtml && (
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[8px] font-bold tracking-wider uppercase">
            ✦ Animado
          </div>
        )}

        {/* Category emoji */}
        <div className="absolute top-1.5 left-1.5 text-lg leading-none drop-shadow-md">
          {tpl.categoryEmoji}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4"
      >
        <Layout className="h-8 w-8 text-muted-foreground" />
      </motion.div>
      <p className="text-base font-semibold text-foreground mb-2">Nenhum modelo nesta categoria</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Tente selecionar outra categoria ou visualize todos os modelos disponíveis.
      </p>
      <button
        onClick={onReset}
        className="mt-4 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary text-sm font-medium transition-colors cursor-pointer"
      >
        Ver todos os modelos
      </button>
    </motion.div>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [templates, setTemplates] = useState<LinkTemplate[]>([]);
  const [templateCategories, setTemplateCategories] = useState<{ id: string; label: string; emoji: string; description: string; color: string }[]>([]);
  const { data: links = [], isLoading: linksLoading } = useLinks();
  const { data: stats, isLoading: statsLoading } = useLinkStats();
  const { isAtLimit, limits, totalLinks } = usePlanLimits();
  const { completed, isActive, start } = useOnboardingStore();

  useEffect(() => {
    if (!completed && !isActive) {
      const t = setTimeout(() => start(), 800);
      return () => clearTimeout(t);
    }
  }, [completed, isActive, start]);

  useEffect(() => {
    import("@/data/templates").then((m) => {
      setTemplates(m.templates);
      setTemplateCategories(m.templateCategories);
    });
  }, []);

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

  const filteredTemplates = useMemo(() => {
    if (!selectedCategory) return templates;
    if (STYLE_CATEGORIES.has(selectedCategory)) {
      return templates.filter(t => t.styleTag?.includes(selectedCategory));
    }
    return templates.filter(t => t.category === selectedCategory);
  }, [selectedCategory, templates]);

  const handleUseTemplate = (templateId: string) => {
    navigate(`/links/new?template=${templateId}`);
  };

  return (
    <DashboardLayout title="Dashboard">
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
                `Você atingiu o limite de ${limits.maxLinks} links do plano ${limits.label}. Acesse Planos para fazer upgrade.`
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

      {/* ── Template Library ── */}
      <section className="py-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layout className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground tracking-tight">Biblioteca de Modelos</h2>
            <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {templates.length} modelos
            </span>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6">

          {/* LEFT: Category filter - vertical list, sticky */}
          <div className="w-48 shrink-0">
            <div className="sticky top-4 space-y-0.5">
              {/* "Todos" button */}
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer text-left ${
                  !selectedCategory
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <span className="text-base leading-none">🎨</span>
                <span>Todos</span>
                <span className="ml-auto text-[10px] opacity-60">{templates.length}</span>
              </button>

              {/* Category buttons */}
              {templateCategories.map(cat => {
                const count = STYLE_CATEGORIES.has(cat.id)
                  ? templates.filter(t => t.styleTag?.includes(cat.id)).length
                  : templates.filter(t => t.category === cat.id).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer text-left ${
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <span className="text-base leading-none">{cat.emoji}</span>
                    <span className="truncate">{cat.label}</span>
                    <span className="ml-auto text-[10px] opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Template grid */}
          <div className="flex-1 min-w-0">
            {filteredTemplates.length === 0 ? (
              <EmptyState onReset={() => setSelectedCategory(null)} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredTemplates.map((tpl, i) => (
                  <TemplateCard key={tpl.id} tpl={tpl} i={i} onUse={handleUseTemplate} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
};

export default Dashboard;
