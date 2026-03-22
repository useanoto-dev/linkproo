import { DashboardLayout } from "@/components/DashboardLayout";
import { useAdminUsers, useUpdateUserPlan } from "@/hooks/use-admin";
import { Users, Loader2, Search, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PLAN_STYLES: Record<string, string> = {
  business: "bg-amber-500/10 text-amber-600",
  pro: "bg-primary/10 text-primary",
  free: "bg-secondary text-muted-foreground",
};

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useAdminUsers();
  const updatePlan = useUpdateUserPlan();
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const filtered = users.filter(
    (u) =>
      (u.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.company || "").toLowerCase().includes(search.toLowerCase())
  );

  const handlePlanChange = (userId: string, plan: string) => {
    updatePlan.mutate(
      { userId, plan },
      {
        onSuccess: () => toast.success("Plano atualizado!"),
        onError: () => toast.error("Erro ao atualizar plano"),
      }
    );
  };

  return (
    <DashboardLayout title="Gerenciar Usuários">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Usuários ({users.length})</h1>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Buscar por nome, email..."
              className="pl-10 h-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/20">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuário</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Empresa</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Plano</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</td></tr>
                  ) : (
                    filtered.map((u, i) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(i, 20) * 0.02 }}
                        className="border-b border-border/30 last:border-b-0 hover:bg-secondary/10 transition-colors"
                      >
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
                            <span className="font-medium text-foreground truncate max-w-[150px]">{u.display_name || "Sem nome"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[200px] text-xs">{u.email || "—"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">{u.company || "—"}</td>
                        <td className="px-5 py-3">
                          <Select
                            value={u.plan || "free"}
                            onValueChange={(val) => handlePlanChange(u.user_id, val)}
                          >
                            <SelectTrigger className="h-7 w-[100px] text-[10px] font-semibold uppercase tracking-wider border-0 bg-transparent p-0">
                              <SelectValue>
                                <span className={`px-2.5 py-1 rounded-full ${PLAN_STYLES[u.plan || "free"] || PLAN_STYLES.free}`}>
                                  {u.plan || "free"}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">
                          {new Date(u.created_at).toLocaleDateString("pt-BR")}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
