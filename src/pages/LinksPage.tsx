import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SmartLinkCard } from "@/components/SmartLinkCard";
import { motion } from "framer-motion";
import { Plus, Inbox, Search, CheckSquare, Square, X, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLinks, useDeleteLink, useDuplicateLink, useToggleLinkActive } from "@/hooks/use-links";
import { Skeleton } from "@/components/ui/skeleton";

export default function LinksPage() {
  const navigate = useNavigate();
  const { data: links = [], isLoading } = useLinks();
  const deleteLink = useDeleteLink();
  const duplicateLink = useDuplicateLink();
  const toggleActive = useToggleLinkActive();

  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "views" | "clicks" | "name">("newest");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  const displayedLinks = useMemo(() => {
    let result = [...links];

    // Search
    if (searchDebounced.trim()) {
      const q = searchDebounced.toLowerCase();
      result = result.filter(l =>
        l.businessName?.toLowerCase().includes(q) ||
        l.slug?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter === "active") result = result.filter(l => l.isActive);
    if (statusFilter === "inactive") result = result.filter(l => !l.isActive);

    // Sort
    switch (sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        break;
      case "views":
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "clicks":
        result.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
        break;
      case "name":
        result.sort((a, b) => (a.businessName || "").localeCompare(b.businessName || "", "pt-BR"));
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
    }

    return result;
  }, [links, searchDebounced, sortBy, statusFilter]);

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allDisplayedSelected =
    displayedLinks.length > 0 && displayedLinks.every(l => selectedIds.has(l.id));

  const toggleSelectAll = () => {
    if (allDisplayedSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedLinks.map(l => l.id)));
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => deleteLink.mutate(id));
    exitSelectionMode();
  };

  const handleBulkActivate = (active: boolean) => {
    selectedIds.forEach(id => toggleActive.mutate({ linkId: id, active }));
    exitSelectionMode();
  };

  return (
    <DashboardLayout title="Meus Links">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Carregando..."
            : `${displayedLinks.length}${displayedLinks.length !== links.length ? ` de ${links.length}` : ""} link(s) criado(s)`}
        </p>
        <div className="flex items-center gap-2">
          {!isLoading && links.length > 0 && !selectionMode && (
            <button
              type="button"
              onClick={() => setSelectionMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors cursor-pointer select-none"
            >
              <CheckSquare className="h-4 w-4" />
              Selecionar
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/links/new")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer select-none"
          >
            <Plus className="h-4 w-4" />
            Novo Link
          </button>
        </div>
      </div>

      {/* Bulk action toolbar */}
      {selectionMode && (
        <div className="flex flex-wrap items-center gap-2 mb-5 px-3 py-2.5 rounded-xl border border-border bg-secondary/40">
          {/* Cancel */}
          <button
            type="button"
            onClick={exitSelectionMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors cursor-pointer select-none"
          >
            <X className="h-3.5 w-3.5" />
            Cancelar
          </button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Select all */}
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer select-none"
          >
            {allDisplayedSelected
              ? <CheckSquare className="h-3.5 w-3.5 text-primary" />
              : <Square className="h-3.5 w-3.5" />
            }
            Todos
          </button>

          {/* Count badge */}
          <span className="text-xs font-medium text-muted-foreground">
            {selectedIds.size} selecionado{selectedIds.size !== 1 ? "s" : ""}
          </span>

          <div className="flex-1" />

          {/* Bulk actions — only enabled when at least one is selected */}
          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={() => handleBulkActivate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer select-none"
          >
            <ToggleRight className="h-3.5 w-3.5" />
            Ativar
          </button>
          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={() => handleBulkActivate(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer select-none"
          >
            <ToggleLeft className="h-3.5 w-3.5" />
            Desativar
          </button>
          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer select-none"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Deletar
          </button>
        </div>
      )}

      {/* Search, sort, filter bar */}
      {!isLoading && links.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou slug..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          {/* Status filter */}
          <div className="flex rounded-lg border border-border overflow-hidden text-xs">
            {(["all", "active", "inactive"] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-2 transition-colors ${statusFilter === f ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted"}`}
              >
                {f === "all" ? "Todos" : f === "active" ? "Ativos" : "Inativos"}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
          >
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
            <option value="views">Mais vistos</option>
            <option value="clicks">Mais clicados</option>
            <option value="name">Nome A-Z</option>
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <Skeleton className="h-28 w-full" />
              <div className="px-3 py-2 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="px-3 py-2 flex gap-2">
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : links.length === 0 ? (
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
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </motion.div>
          <h3 className="font-display font-semibold text-foreground mb-1">Nenhum link criado</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Crie seu primeiro link usando um modelo ou comece do zero
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors cursor-pointer select-none"
            >
              Ver Modelos
            </button>
            <button
              type="button"
              onClick={() => navigate("/links/new")}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer select-none"
            >
              Criar do Zero
            </button>
          </div>
        </motion.div>
      ) : displayedLinks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Search className="h-8 w-8 mb-3 opacity-30" />
          <p className="text-sm">Nenhum link encontrado para "{searchDebounced}"</p>
          <button
            type="button"
            onClick={() => { setSearch(""); setStatusFilter("all"); }}
            className="mt-3 text-xs text-primary hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayedLinks.map((link, i) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <SmartLinkCard
                link={link}
                onDelete={(id) => deleteLink.mutate(id)}
                onDuplicate={(id) => duplicateLink.mutate(id)}
                onToggleActive={(id, active) => toggleActive.mutate({ linkId: id, active })}
                selectionMode={selectionMode}
                selected={selectedIds.has(link.id)}
                onSelect={toggleSelect}
              />
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
