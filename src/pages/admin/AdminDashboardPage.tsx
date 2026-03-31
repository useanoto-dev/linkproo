import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Users, Link, Eye, MousePointerClick, ArrowRight, Globe } from "lucide-react";
import { useAdminStats, useAdminUsers } from "@/hooks/use-admin";
import { Link as RouterLink } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users = [], isLoading: usersLoading } = useAdminUsers();

  const statCards = [
    { label: "Usuários", value: stats?.users ?? 0, icon: Users, color: "text-blue-500 bg-blue-500/10" },
    { label: "Links criados", value: stats?.links ?? 0, icon: Link, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Visualizações", value: stats?.views ?? 0, icon: Eye, color: "text-purple-500 bg-purple-500/10" },
    { label: "Cliques", value: stats?.clicks ?? 0, icon: MousePointerClick, color: "text-amber-500 bg-amber-500/10" },
  ];

  if (statsLoading) {
    return (
      <DashboardLayout title="Painel Admin">
        <div className="space-y-8">
          {/* Stat cards skeleton — 4 cards matching grid-cols-2 lg:grid-cols-4 gap-4 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-border/50 bg-card">
                <Skeleton className="h-10 w-10 rounded-xl mb-3" />
                <Skeleton className="h-7 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
          {/* Recent users table skeleton — 5 rows */}
          <div>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="space-y-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-border/30 last:border-b-0">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20 ml-auto" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Painel Admin">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl border border-border/50 bg-card"
            >
              <div className={`inline-flex p-2.5 rounded-xl ${stat.color} mb-3`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Regional distribution */}
        {!usersLoading && users.length > 0 && (() => {
          const counts: Record<string, number> = {};
          for (const u of users) {
            const key = u.country || "Desconhecido";
            counts[key] = (counts[key] ?? 0) + 1;
          }
          const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
          const total = users.length;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-5 rounded-2xl border border-border/50 bg-card"
            >
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Distribuição por Região</h2>
              </div>
              <div className="space-y-2.5">
                {sorted.map(([region, count]) => {
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={region}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-foreground font-medium">{region}</span>
                        <span className="text-muted-foreground">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}

        {/* Recent users */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Usuários Recentes
            </h2>
            <RouterLink
              to="/admin/users"
              className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </RouterLink>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/20">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuário</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Empresa</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Plano</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Carregando...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum usuário</td></tr>
                  ) : (
                    users.slice(0, 20).map((u) => (
                      <tr key={u.id} className="border-b border-border/30 last:border-b-0 hover:bg-secondary/10 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">
                                  {(u.display_name || "U").charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="font-medium text-foreground">{u.display_name || "Sem nome"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{u.company || "—"}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            u.plan === "business" ? "bg-amber-500/10 text-amber-600" :
                            u.plan === "pro" ? "bg-primary/10 text-primary" :
                            "bg-secondary text-muted-foreground"
                          }`}>
                            {u.plan || "free"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">
                          {new Date(u.created_at).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
