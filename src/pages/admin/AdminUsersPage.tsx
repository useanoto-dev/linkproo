import { DashboardLayout } from "@/components/DashboardLayout";
import { useAdminUsers, useUpdateUserPlan, useDeleteUser, useAdminUserLinks, AdminUserLink } from "@/hooks/use-admin";
import { Users, Loader2, Search, Mail, Clock, Trash2, Smartphone, AlertTriangle, Link2, ExternalLink, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REGIONS = ["Todos", "Brasil", "América", "Europa", "Ásia", "África", "Pacífico", "Outro"];

const PLAN_STYLES: Record<string, string> = {
  business: "bg-amber-500/10 text-amber-600",
  pro: "bg-primary/10 text-primary",
  free: "bg-secondary text-muted-foreground",
};

/** Returns online status based on last_sign_in_at */
function getOnlineStatus(lastSignIn: string | null | undefined): {
  dot: string;
  label: string;
} {
  if (!lastSignIn) return { dot: "bg-gray-300", label: "Nunca acessou" };
  const diff = Date.now() - new Date(lastSignIn).getTime();
  const hours = diff / (1000 * 60 * 60);
  if (hours < 1) return { dot: "bg-green-500", label: "Online agora" };
  if (hours < 24) return { dot: "bg-green-400", label: "Hoje" };
  if (hours < 24 * 7) return { dot: "bg-yellow-400", label: "Esta semana" };
  return {
    dot: "bg-gray-400",
    label: new Date(lastSignIn).toLocaleDateString("pt-BR"),
  };
}

/** Sub-row que carrega e exibe os links de um usuário */
function UserLinksRow({ userId, colSpan }: { userId: string; colSpan: number }) {
  const { data: links = [], isLoading } = useAdminUserLinks(userId);

  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-0">
        <div className="border border-border/40 rounded-xl mb-3 overflow-hidden bg-secondary/30">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : links.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhum link cadastrado</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30 bg-secondary/40">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Slug</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Botões</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Criado em</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {links.map((link: AdminUserLink) => (
                  <tr key={link.id} className="border-b border-border/20 last:border-b-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-2 font-medium text-foreground truncate max-w-[160px]">
                      {link.business_name || "—"}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground font-mono">
                      /{link.slug}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {link.button_count}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        link.is_active
                          ? "bg-green-500/10 text-green-600"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {link.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {new Date(link.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-2">
                      <a
                        href={`/${link.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors inline-flex cursor-pointer"
                        title="Abrir link"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useAdminUsers();
  const updatePlan = useUpdateUserPlan();
  const deleteUser = useDeleteUser();
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("Todos");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.company || "").toLowerCase().includes(search.toLowerCase());
    const matchesRegion =
      regionFilter === "Todos" || (u.country || "Outro") === regionFilter;
    return matchesSearch && matchesRegion;
  });

  // Count active in last 24h
  const activeToday = users.filter((u) => {
    if (!u.last_sign_in_at) return false;
    return Date.now() - new Date(u.last_sign_in_at).getTime() < 86400000;
  }).length;

  const duplicateCount = users.filter((u) => (u.duplicate_device_count ?? 0) > 0).length;

  const handlePlanChange = (userId: string, plan: string) => {
    updatePlan.mutate(
      { userId, plan },
      {
        onSuccess: () => toast.success("Plano atualizado!"),
        onError: () => toast.error("Erro ao atualizar plano"),
      }
    );
  };

  const handleDelete = (userId: string, email: string) => {
    if (confirmDeleteId !== userId) {
      setConfirmDeleteId(userId);
      return;
    }
    deleteUser.mutate(userId, {
      onSuccess: () => {
        toast.success(`Usuário ${email} removido.`);
        setConfirmDeleteId(null);
      },
      onError: (err: Error) => {
        toast.error("Erro ao deletar: " + err.message);
        setConfirmDeleteId(null);
      },
    });
  };

  return (
    <DashboardLayout title="Gerenciar Usuários">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">
              Usuários ({users.length})
            </h1>
            {activeToday > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {activeToday} ativo{activeToday > 1 ? "s" : ""} hoje
              </span>
            )}
            {duplicateCount > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 text-[11px] font-semibold">
                <Smartphone className="h-3 w-3" />
                {duplicateCount} multi-conta
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="h-10 w-[140px] text-xs">
                <Globe className="h-3.5 w-3.5 mr-1 text-muted-foreground shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Plano
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Último acesso
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Cadastro
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      País
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Dispositivo
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Links
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u, i) => {
                      const status = getOnlineStatus(u.last_sign_in_at);
                      const hasDuplicate = (u.duplicate_device_count ?? 0) > 0;
                      const isConfirming = confirmDeleteId === u.user_id;

                      return (
                        <>
                        <motion.tr
                          key={u.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: Math.min(i, 20) * 0.02 }}
                          className={`border-b border-border/30 last:border-b-0 transition-colors ${
                            hasDuplicate
                              ? "bg-orange-500/5 hover:bg-orange-500/10"
                              : "hover:bg-secondary/10"
                          }`}
                        >
                          {/* Avatar + name */}
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0">
                                {u.avatar_url ? (
                                  <img
                                    src={u.avatar_url}
                                    alt=""
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary">
                                      {(u.display_name || "U").charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                {/* Online dot */}
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${status.dot}`}
                                />
                              </div>
                              <span className="font-medium text-foreground truncate max-w-[140px]">
                                {u.display_name || "Sem nome"}
                              </span>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[200px] text-xs">
                                {u.email || "—"}
                              </span>
                            </div>
                          </td>

                          {/* Plan */}
                          <td className="px-5 py-3">
                            <Select
                              value={u.plan || "free"}
                              onValueChange={(val) =>
                                handlePlanChange(u.user_id, val)
                              }
                            >
                              <SelectTrigger className="h-7 w-[100px] text-[10px] font-semibold uppercase tracking-wider border-0 bg-transparent p-0">
                                <SelectValue>
                                  <span
                                    className={`px-2.5 py-1 rounded-full ${
                                      PLAN_STYLES[u.plan || "free"] ||
                                      PLAN_STYLES.free
                                    }`}
                                  >
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

                          {/* Last seen */}
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span
                                className={`text-xs font-medium ${
                                  status.label === "Online agora"
                                    ? "text-green-600"
                                    : status.label === "Hoje"
                                    ? "text-green-500"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {status.label}
                              </span>
                            </div>
                          </td>

                          {/* Registered */}
                          <td className="px-5 py-3 text-muted-foreground text-xs">
                            {new Date(u.created_at).toLocaleDateString("pt-BR")}
                          </td>

                          {/* Country */}
                          <td className="px-5 py-3">
                            {u.country ? (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Globe className="h-3 w-3 shrink-0" />
                                {u.country}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/40">—</span>
                            )}
                          </td>

                          {/* Device duplicate indicator */}
                          <td className="px-5 py-3">
                            {hasDuplicate ? (
                              <span
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 text-[10px] font-semibold"
                                title={`Este dispositivo tem ${u.duplicate_device_count} outra(s) conta(s)`}
                              >
                                <AlertTriangle className="h-3 w-3" />
                                +{u.duplicate_device_count} conta{(u.duplicate_device_count ?? 0) > 1 ? "s" : ""}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/40">—</span>
                            )}
                          </td>

                          {/* Link count + expand */}
                          <td className="px-5 py-3">
                            <button
                              type="button"
                              onClick={() => setExpandedUserId(expandedUserId === u.user_id ? null : u.user_id)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer text-[11px] font-semibold"
                              title="Ver links do usuário"
                            >
                              <Link2 className="h-3 w-3 text-primary" />
                              {u.link_count ?? 0}
                              {expandedUserId === u.user_id
                                ? <ChevronUp className="h-3 w-3" />
                                : <ChevronDown className="h-3 w-3" />
                              }
                            </button>
                          </td>

                          {/* Delete */}
                          <td className="px-4 py-3">
                            <AnimatePresence mode="wait">
                              {isConfirming ? (
                                <motion.div
                                  key="confirm"
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  className="flex items-center gap-1.5"
                                >
                                  <span className="text-[10px] text-destructive font-medium whitespace-nowrap">
                                    Confirmar?
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(u.user_id, u.email)}
                                    disabled={deleteUser.isPending}
                                    className="px-2 py-1 rounded-md bg-destructive text-destructive-foreground text-[10px] font-semibold hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50"
                                  >
                                    {deleteUser.isPending ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "Sim"
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-1 rounded-md bg-secondary text-foreground text-[10px] font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                                  >
                                    Não
                                  </button>
                                </motion.div>
                              ) : (
                                <motion.button
                                  key="delete-btn"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  type="button"
                                  onClick={() => handleDelete(u.user_id, u.email)}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                                  title="Deletar usuário"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </motion.button>
                              )}
                            </AnimatePresence>
                          </td>
                        </motion.tr>

                        {/* Sub-row com links do usuário */}
                        {expandedUserId === u.user_id && (
                          <UserLinksRow userId={u.user_id} colSpan={9} />
                        )}
                        </>
                      );
                    })
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
