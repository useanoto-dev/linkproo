import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { SmartLink } from "@/types/smart-link";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rowToSmartLink, smartLinkToRow } from "@/lib/link-mappers";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

/** Returns the full public URL for a published link slug — always uses current origin */
export function getPublicLinkUrl(slug: string): string {
  return `${window.location.origin}/${slug}`;
}

/** The current host, for display purposes */
export const PUBLISHED_DOMAIN = typeof window !== "undefined" ? window.location.host : "";

// Re-export mappers for backward compat
export { rowToSmartLink, smartLinkToRow };

// ─── Queries ────────────────────────────────────────────────

/** Fetch all links for current user (with aggregated view/click counts via RPC) */
export function useLinks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["links", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.rpc("get_user_links_with_stats");
      if (error) throw error;
      if (!data || data.length === 0) return [];
      return data.map((row) =>
        rowToSmartLink(row, Number(row.views_count) || 0, Number(row.clicks_count) || 0)
      );
    },
    enabled: !!user,
  });
}

/** Fetch single link by ID (for editor) */
export function useLink(id?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["links", "detail", id],
    queryFn: async () => {
      if (!id || !user) return null;
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToSmartLink(data) : null;
    },
    enabled: !!id && !!user,
  });
}

/** Fetch public link by slug (no auth needed) — single RPC call */
export function usePublicLink(slug?: string) {
  return useQuery({
    queryKey: ["public-link", slug],
    queryFn: async () => {
      if (!slug) return null;

      // Single RPC: returns link + owner plan in one round-trip.
      // Falls back to two-call approach if RPC is unavailable (e.g. local dev
      // without migration applied).
      const { data: rpcData, error: rpcError } = await supabase
        .rpc("get_public_link_with_plan", { p_slug: slug });

      if (!rpcError && rpcData && typeof rpcData === "object") {
        const { link, owner_plan } = rpcData as { link: Record<string, unknown>; owner_plan: string };
        if (link) return rowToSmartLink(link as Parameters<typeof rowToSmartLink>[0], 0, 0, owner_plan ?? "free");
      }

      // ── Fallback: sequential calls (used when RPC not yet deployed) ──
      const { data: linkData, error: linkError } = await supabase
        .from("links")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (linkError) throw linkError;
      if (!linkData) return null;

      let ownerPlan = "free";
      try {
        const { data: plan, error: planError } = await supabase
          .rpc("get_link_owner_plan", { _user_id: linkData.user_id });
        if (!planError && typeof plan === "string") ownerPlan = plan;
      } catch { /* default to free */ }

      return rowToSmartLink(linkData, 0, 0, ownerPlan);
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 2,  // 2 minutos de cache
    gcTime: 1000 * 60 * 10,    // 10 min no garbage collector
  });
}

// ─── Mutations ──────────────────────────────────────────────

/** Save (create or update) a link */
export function useSaveLink() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ link, isNew }: { link: SmartLink; isNew: boolean }) => {
      if (!user) throw new Error("Não autenticado");
      const row = smartLinkToRow(link, user.id);

      if (isNew) {
        // Enforce plan limits before creating
        const [{ plan }, { count: linkCount }] = await Promise.all([
          supabase.from("profiles").select("plan").eq("user_id", user.id).single()
            .then(({ data, error }) => {
              if (error) throw error;
              return { plan: (data?.plan || "free") as string };
            }),
          supabase.from("links").select("*", { count: "exact", head: true }).eq("user_id", user.id)
            .then(({ error, count }) => {
              if (error) throw error;
              return { count: count || 0 };
            }),
        ]);
        const planLimits: Record<string, number> = { free: 3, pro: 50, business: Infinity };
        const maxLinks = planLimits[plan] ?? planLimits.free;
        if (linkCount >= maxLinks) {
          throw new Error(`Limite de links atingido para o plano ${plan}. Faça upgrade para criar mais links.`);
        }

        const { data, error } = await supabase
          .from("links")
          .insert(row as unknown as TablesInsert<"links">)
          .select()
          .single();
        if (error) throw error;
        return rowToSmartLink(data);
      } else {
        const { data, error } = await supabase
          .from("links")
          .update(row as unknown as TablesInsert<"links">)
          .eq("id", link.id)
          .eq("user_id", user.id)
          .select()
          .single();
        if (error) throw error;
        return rowToSmartLink(data);
      }
    },
    onSuccess: () => {
      // ["links"] prefix covers ["links"], ["links","detail",id] and ["links","stats",uid]
      queryClient.invalidateQueries({ queryKey: ["links"] });
      queryClient.invalidateQueries({ queryKey: ["public-link"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao salvar o link. Tente novamente.");
    },
  });
}

/** Toggle link active status */
export function useToggleLinkActive() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, active }: { linkId: string; active: boolean }) => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("links")
        .update({ is_active: active })
        .eq("id", linkId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: (_, { active }) => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success(active ? "Link ativado!" : "Link desativado!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao atualizar o link. Tente novamente.");
    },
  });
}

/** Delete a link */
export function useDeleteLink() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", linkId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link excluído com sucesso!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao excluir o link. Tente novamente.");
    },
  });
}

/** Duplicate a link */
export function useDuplicateLink() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      if (!user) throw new Error("Não autenticado");
      const { data: original, error: fetchError } = await supabase
        .from("links")
        .select("*")
        .eq("id", linkId)
        .eq("user_id", user.id)
        .single();
      if (fetchError || !original) throw fetchError || new Error("Link não encontrado");

      const { id: _id, created_at: _created_at, updated_at: _updated_at, slug, ...rest } = original as Tables<"links">;
      const newSlug = `${slug}-copia-${Date.now().toString(36).slice(-4)}`;
      const { data, error } = await supabase
        .from("links")
        .insert({ ...rest, slug: newSlug, business_name: `${original.business_name} (Cópia)` })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link duplicado com sucesso!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao duplicar o link. Tente novamente.");
    },
  });
}

// ─── Analytics Helpers ──────────────────────────────────────

/** Record a view — deduplicated per session with a 30-minute TTL */
export async function recordView(linkId: string) {
  try {
    const key = `lp-viewed-${linkId}`;
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const ts = parseInt(stored, 10);
      // TTL: 30 minutos
      if (Date.now() - ts < 30 * 60 * 1000) return;
    }
    sessionStorage.setItem(key, String(Date.now()));

    await supabase.from("link_views").insert({
      link_id: linkId,
      referrer: (document.referrer || "").slice(0, 500),
      device: /Mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
    });
  } catch (err) {
    logger.error("[analytics] recordView failed:", err);
  }
}

/** Record a click — deduplicated per button with a 5-second TTL (evita duplo-clique) */
export async function recordClick(linkId: string, buttonId?: string) {
  try {
    const key = `lp-clicked-${linkId}-${buttonId ?? ""}`;
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const ts = parseInt(stored, 10);
      // TTL: 5 segundos (evita duplo-clique, mas não impede cliques legítimos)
      if (Date.now() - ts < 5 * 1000) return;
    }
    sessionStorage.setItem(key, String(Date.now()));

    const payload: TablesInsert<"link_clicks"> = {
      link_id: linkId,
      referrer: (document.referrer || "").slice(0, 500),
      device: /Mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
    };
    if (buttonId) payload.button_id = buttonId;
    await supabase.from("link_clicks").insert(payload);
  } catch (err) {
    logger.error("[analytics] recordClick failed:", err);
  }
}

/** Get aggregated analytics stats for user's links — single RPC round-trip. */
export function useLinkStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["links", "stats", user?.id],
    queryFn: async () => {
      if (!user) return { totalViews: 0, totalClicks: 0, totalLinks: 0, activeLinks: 0 };

      const { data, error } = await supabase.rpc("get_user_link_stats");

      if (!error && data && data.length > 0) {
        const row = data[0] as { total_views: number; total_clicks: number; total_links: number; active_links: number };
        return {
          totalViews:  Number(row.total_views)  || 0,
          totalClicks: Number(row.total_clicks) || 0,
          totalLinks:  Number(row.total_links)  || 0,
          activeLinks: Number(row.active_links) || 0,
        };
      }

      // Fallback for local dev without migration applied
      const { data: links } = await supabase
        .from("links").select("id, is_active").eq("user_id", user.id);
      if (!links || links.length === 0) return { totalViews: 0, totalClicks: 0, totalLinks: 0, activeLinks: 0 };
      const ids = links.map((l) => l.id);
      const [{ count: vc }, { count: cc }] = await Promise.all([
        supabase.from("link_views").select("*", { count: "exact", head: true }).in("link_id", ids),
        supabase.from("link_clicks").select("*", { count: "exact", head: true }).in("link_id", ids),
      ]);
      return { totalViews: vc || 0, totalClicks: cc || 0, totalLinks: links.length, activeLinks: links.filter((l) => l.is_active).length };
    },
    enabled: !!user,
  });
}
