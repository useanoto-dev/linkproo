import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { Eye, MousePointerClick, TrendingUp, Monitor, Smartphone, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

type Period = "7d" | "30d" | "90d";

interface DayStatUser { date: string; views: number; clicks: number; }
interface DeviceStat { device: string; count: number; }
interface ButtonClick { button_id: string; count: number; }
interface LinkViewStat { link_id: string; slug: string; business_name: string; views: number; }
interface ReferrerStat { referrer: string; count: number; }
interface UserAnalyticsData {
  total_views: number;
  total_clicks: number;
  views_by_day: DayStatUser[];
  views_by_device: DeviceStat[];
  clicks_by_button: ButtonClick[];
  views_by_link: LinkViewStat[];
  referrer_top5: ReferrerStat[];
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("30d");

  const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", user?.id, period],
    queryFn: async () => {
      if (!user) return null;

      // Keep: links fetch for button label mapping (per D-11)
      const { data: links } = await supabase
        .from("links")
        .select("id, business_name, slug, blocks, buttons")
        .eq("user_id", user.id);

      if (!links || links.length === 0) {
        return {
          analytics: null as UserAnalyticsData | null,
          links: [] as typeof links,
          buttonLabels: {} as Record<string, string>,
          buttonLink: {} as Record<string, string>,
        };
      }

      // Replace all 4 event queries with single RPC (per D-10)
      const { data: analytics, error } = await supabase.rpc("get_user_analytics", {
        user_uuid: user.id,
        period_days: periodDays,
      });
      if (error) throw error;

      // Build button/block label maps (unchanged logic)
      const buttonLabels: Record<string, string> = {};
      const buttonLink: Record<string, string> = {};
      for (const link of links) {
        const linkName = link.business_name || link.slug;
        if (Array.isArray(link.buttons)) {
          for (const btn of link.buttons as Array<{ id?: string; label?: string }>) {
            if (btn?.id) {
              buttonLabels[btn.id] = btn.label || btn.id;
              buttonLink[btn.id] = linkName;
            }
          }
        }
        if (Array.isArray(link.blocks)) {
          for (const blk of link.blocks as Array<{ id?: string; content?: string; animButtonLabel?: string; type?: string }>) {
            if (blk?.id) {
              buttonLabels[blk.id] = blk.content || blk.animButtonLabel || blk.type || blk.id;
              buttonLink[blk.id] = linkName;
            }
          }
        }
      }

      return {
        analytics: analytics as UserAnalyticsData,
        links,
        buttonLabels,
        buttonLink,
      };
    },
    enabled: !!user,
  });

  // Views/clicks line chart
  const chartData = (data?.analytics?.views_by_day ?? []).map((d: DayStatUser) => ({
    date: format(parseISO(d.date), "dd/MM", { locale: ptBR }),
    views: d.views,
    clicks: d.clicks,
  }));

  // Device breakdown
  const deviceData = (data?.analytics?.views_by_device ?? []).map((d: DeviceStat) => ({
    name: d.device === "mobile" ? "Mobile" : d.device === "desktop" ? "Desktop" : "Outro",
    value: d.count,
    color: d.device === "mobile" ? "hsl(262, 83%, 58%)"
         : d.device === "desktop" ? "hsl(292, 84%, 61%)"
         : "hsl(250, 10%, 50%)",
  })).filter((d) => d.value > 0);

  // Top links
  const topLinks = (data?.analytics?.views_by_link ?? []).slice(0, 5).map((d: LinkViewStat) => ({
    name: d.business_name || d.slug,
    views: d.views,
  }));

  // Referrer data from RPC — client parses hostname like before
  const referrerData = (data?.analytics?.referrer_top5 ?? []).map((d: ReferrerStat) => {
    let name = d.referrer;
    if (name && name !== "Direto") {
      try { name = new URL(name).hostname; } catch { /* keep raw string */ }
    }
    return { name: name || "Direto", value: d.count };
  });

  // Top CTAs
  const topCTAs = (data?.analytics?.clicks_by_button ?? []).map((d: ButtonClick) => ({
    id: d.button_id,
    label: data?.buttonLabels?.[d.button_id] || d.button_id,
    linkName: data?.buttonLink?.[d.button_id] || "\u2014",
    count: d.count,
  }));

  // KPIs
  const totalViews = data?.analytics?.total_views ?? 0;
  const totalClicks = data?.analytics?.total_clicks ?? 0;
  const conversionRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  return (
    <DashboardLayout title="Analytics">
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
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-72 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Skeleton className="h-52 rounded-xl" />
              <Skeleton className="h-52 rounded-xl" />
            </div>
          </div>
        ) : !data?.analytics ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4"
            >
              <Eye className="h-8 w-8 text-muted-foreground" />
            </motion.div>
            <h3 className="font-semibold text-foreground mb-1">Ainda sem visitas</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Crie e compartilhe seu primeiro link para começar a ver analytics aqui
            </p>
          </motion.div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Visualizações", value: totalViews, icon: Eye },
                { label: "Cliques", value: totalClicks, icon: MousePointerClick },
                { label: "Conversão", value: `${conversionRate}%`, icon: TrendingUp },
                { label: "Links", value: data?.links?.length ?? 0, icon: Monitor },
              ].map((stat, i) => (
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
                  <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Views/Clicks over time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h3 className="text-sm font-semibold text-foreground mb-4">Visualizações e Cliques</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Visualizações" />
                    <Line type="monotone" dataKey="clicks" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="Cliques" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">Nenhum dado no período selecionado</p>
              )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Device breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h3 className="text-sm font-semibold text-foreground mb-4">Dispositivos</h3>
                {deviceData.length > 0 ? (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={140} height={140}>
                      <PieChart>
                        <Pie data={deviceData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" strokeWidth={0}>
                          {deviceData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {deviceData.map((d) => (
                        <div key={d.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-xs text-foreground">{d.name}</span>
                          <span className="text-xs text-muted-foreground">({d.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-muted-foreground">
                    <Smartphone className="h-8 w-8 mb-2" />
                    <p className="text-xs">Sem dados</p>
                  </div>
                )}
              </motion.div>

              {/* Top links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h3 className="text-sm font-semibold text-foreground mb-4">Top Links</h3>
                {topLinks.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={topLinks} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={100} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      />
                      <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Views" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
                )}
              </motion.div>
            </div>

            {/* Referrers */}
            {referrerData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h3 className="text-sm font-semibold text-foreground mb-4">Origens de Tráfego</h3>
                <div className="space-y-2">
                  {referrerData.map((ref) => (
                    <div key={ref.name} className="flex items-center gap-3">
                      <span className="text-xs text-foreground w-40 truncate">{ref.name}</span>
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(ref.value / (referrerData[0]?.value || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">{ref.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Top CTAs */}
            {topCTAs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-card border border-border rounded-xl p-5"
              >
                <h3 className="text-sm font-semibold text-foreground mb-4">Top CTAs</h3>
                <div>
                  {topCTAs.map((cta, i) => (
                    <div
                      key={cta.id}
                      className={`flex items-center justify-between py-2 gap-3 ${i < topCTAs.length - 1 ? "border-b border-border/30" : ""}`}
                    >
                      {/* Position */}
                      <span className="text-xs font-bold text-muted-foreground w-5 text-right shrink-0">
                        {i + 1}
                      </span>

                      {/* Label + link name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{cta.label}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{cta.linkName}</p>
                      </div>

                      {/* Progress bar + count */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${(cta.count / (topCTAs[0]?.count || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-foreground w-8 text-right">
                          {cta.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
