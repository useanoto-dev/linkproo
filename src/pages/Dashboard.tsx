import { motion } from "framer-motion";
import { Eye, MousePointerClick, Link as LinkIcon, TrendingUp, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { templates, templateCategories } from "@/data/templates";
import { useLinks, useLinkStats } from "@/hooks/use-links";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { toast } from "sonner";

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

  const handleUseTemplate = (templateId: string) => {
    navigate(`/links/new?template=${templateId}`);
  };

  return (
    <DashboardLayout title="Dashboard">
      <OnboardingDialog />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <stat.icon className="h-3.5 w-3.5 text-primary" />
            </div>
            {isLoading ? (
              <Skeleton className="h-7 w-16 rounded" />
            ) : (
              <>
                <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.change}</p>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8 items-center">
        <button
          onClick={() => {
            if (isAtLimit) {
              toast.error(`Limite atingido! Plano ${limits.label} permite até ${limits.maxLinks} links. Faça upgrade para continuar.`);
              return;
            }
            navigate("/links/new");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity ${
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors cursor-pointer"
        >
          <LinkIcon className="h-4 w-4" />
          Meus Links ({links.length})
        </button>
        <span className="text-xs text-muted-foreground ml-1">
          {totalLinks}/{limits.maxLinks === Infinity ? "∞" : limits.maxLinks} links usados
        </span>
      </div>

      {/* Templates Section */}
      <div className="space-y-5">
        <h2 className="font-display text-xl font-semibold text-foreground">Modelos Prontos</h2>
        <p className="text-sm text-muted-foreground -mt-2">
          Escolha um modelo, personalize e publique em minutos
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !selectedCategory
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            Todos
          </button>
          {templateCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((tpl, i) => {
            const catData = templateCategories.find(c => c.id === tpl.category);
            const catColor = catData?.color || "bg-primary";

            return (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleUseTemplate(tpl.id)}
                className="rounded-xl overflow-hidden cursor-pointer group border border-border bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={tpl.template.heroImage}
                    alt={tpl.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${catColor}`}>
                      {tpl.categoryEmoji} {catData?.label || "Modelo"}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-3 right-3">
                    <h3 className="font-display font-bold text-foreground text-sm truncate">{tpl.name}</h3>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2.5">{tpl.description}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {tpl.template.buttons.length} botões
                    </span>
                    {tpl.template.blocks.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {tpl.template.blocks.length} blocos
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
