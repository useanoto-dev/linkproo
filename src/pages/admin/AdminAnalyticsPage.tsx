import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

type Period = "7d" | "30d" | "90d";

const PLAN_COLORS: Record<string, string> = {
  free: "hsl(250, 10%, 50%)",
  pro: "hsl(262, 83%, 58%)",
  business: "hsl(38, 92%, 50%)",
};

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");

  const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const startDate = useMemo(
    () => startOfDay(subDays(new Date(), periodDays)),
    [periodDays]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics", period],
    queryFn: async () => {
      const [
        { data: allViews },
        { data: allClicks },
        { data: allProfiles },
        { data: allLinks },
      ] = await Promise.all([
        supabase
          .from("link_views")
          .select("viewed_at, device, link_id")
          .gte("viewed_at", startDate.toISOString())
          .limit(10000),
        supabase
          .from("link_clicks")
          .select("clicked_at, link_id")
          .gte("clicked_at", startDate.toISOString())
          .limit(10000),
        supabase.from("profiles").select("plan, created_at"),
        supabase.from("links").select("id, business_name, slug"),
      ]);

      return {
        views: (allViews as any[]) || [],
        clicks: (allClicks as any[]) || [],
        profiles: (allProfiles as any[]) || [],
        links: (allLinks as any[]) || [],
      };
    },
  });

  // --- KPIs ---
  const totalViews = data?.views.length ?? 0;
  const totalClicks = data?.clicks.length ?? 0;
  const newUsers = useMemo(() => {
    if (!data) return 0;
    return data.profiles.filter(
      (p: any) => new Date(p.created_at) >= startDate
    ).length;
  }, [data, startDate]);
  const conversionRate =
    totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  // --- Growth chart (views + clicks + new users per day) ---
  const growthChartData = useMemo(() => {
    if (!data) return [];
    const days = eachDayOfInterval({ start: startDate, end: new Date() });
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayViews = data.views.filter((v: any) =>
        (v.viewed_at as string)?.startsWith(dayStr)
      ).length;
      const dayClicks = data.clicks.filter((c: any) =>
        (c.clicked_at as string)?.startsWith(dayStr)
      ).length;
      const dayUsers = data.profiles.filter((p: any) =>
        (p.created_at as string)?.startsWith(dayStr)
      ).length;
      return {
        date: format(day, "dd/MM", { locale: ptBR }),
        views: dayViews,
        cliques: dayClicks,
        usuarios: dayUsers,
      };
    });
  }, [data, startDate]);

  // --- Plan distribution ---
  const planData = useMemo(() => {
    if (!data) return [];
    const counts: Record<string, number> = {};
    for (const p of data.profiles) {
      const plan: string = (p.plan as string) || "free";
      counts[plan] = (counts[plan] || 0) + 1;
    }
    return Object.entries(counts).map(([plan, value]) => ({
      name: PLAN_LABELS[plan] ?? plan,
      value,
      color: PLAN_COLORS[plan] ?? "hsl(250,10%,60%)",
    }));
  }, [data]);

  // --- Top 5 links by views ---
  const topLinks = useMemo(() => {
    if (!data) return [];
    const counts: Record<string, number> = {};
    for (const v of data.views) {
      const id: string = v.link_id as string;
      if (id) counts[id] = (counts[id] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([linkId, views]) => {
        const link = data.links.find((l: any) => l.id === linkId);
        return {
          name: (link?.business_name as string) || (link?.slug as string) || linkId,
          views,
        };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  }, [data]);

  const kpiCards = [
    {
      label: "Visualizações",
      value: totalViews.toLocaleString("pt-BR"),
      icon: Eye,
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      label: "Cliques",
      value: totalClicks.toLocaleString("pt-BR"),
      icon: MousePointerClick,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "Novos Usuários",
      value: newUsers.toLocaleString("pt-BR"),
      icon: Users,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "Taxa de Conversão",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: "text-amber-500 bg-amber-500/10",
    },
  ];

  return (
    <DashboardLayout title="Analytics da Plataforma">
      <div className="space-y-6">
        {/* Period selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {(["7d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "90 dias"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-72 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {kpiCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-border/50 bg-card p-5"
                >
                  <div className={`inline-flex p-2.5 rounded-xl ${card.color} mb-3`}>
                    <card.icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Growth Line Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border/50 bg-card p-5"
            >
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Crescimento da Plataforma
              </h3>
              {growthChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={270}>
                  <LineChart data={growthChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="hsl(262, 83%, 58%)"
                      strokeWidth={2}
                      dot={false}
                      name="Visualizações"
                    />
                    <Line
                      type="monotone"
                      dataKey="cliques"
                      stroke="hsl(38, 92%, 50%)"
                      strokeWidth={2}
                      dot={false}
                      name="Cliques"
                    />
                    <Line
                      type="monotone"
                      dataKey="usuarios"
                      stroke="hsl(142, 71%, 45%)"
                      strokeWidth={2}
                      dot={false}
                      name="Novos Usuários"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Nenhum dado no período selecionado
                </p>
              )}

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-3">
                {[
                  { label: "Visualizações", color: "hsl(262, 83%, 58%)" },
                  { label: "Cliques", color: "hsl(38, 92%, 50%)" },
                  { label: "Novos Usuários", color: "hsl(142, 71%, 45%)" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-3 h-0.5 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bottom grid: Plan Distribution + Top Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Plan Distribution PieChart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-border/50 bg-card p-5"
              >
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Distribuição de Planos
                </h3>
                {planData.length > 0 ? (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={150} height={150}>
                      <PieChart>
                        <Pie
                          data={planData}
                          cx="50%"
                          cy="50%"
                          innerRadius={38}
                          outerRadius={65}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {planData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2.5">
                      {planData.map((d) => (
                        <div key={d.name} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: d.color }}
                          />
                          <span className="text-xs text-foreground font-medium">
                            {d.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({d.value.toLocaleString("pt-BR")})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-10 text-muted-foreground">
                    <Users className="h-8 w-8 mb-2" />
                    <p className="text-xs">Sem dados de planos</p>
                  </div>
                )}
              </motion.div>

              {/* Top 5 Links Horizontal BarChart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-2xl border border-border/50 bg-card p-5"
              >
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Top Links da Plataforma
                </h3>
                {topLinks.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={topLinks} layout="vertical">
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        width={110}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Bar
                        dataKey="views"
                        fill="hsl(262, 83%, 58%)"
                        radius={[0, 4, 4, 0]}
                        name="Visualizações"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">
                    Sem dados no período
                  </p>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
