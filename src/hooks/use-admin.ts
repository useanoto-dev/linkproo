import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  company: string | null;
  plan: string | null;
  created_at: string;
  last_sign_in_at?: string | null;
  duplicate_device_count?: number;
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_users");
      if (error) throw error;
      return data as AdminUser[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        { count: usersCount, error: e1 },
        { count: linksCount, error: e2 },
        { count: viewsCount, error: e3 },
        { count: clicksCount, error: e4 },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("links").select("*", { count: "exact", head: true }),
        supabase.from("link_views").select("*", { count: "exact", head: true }),
        supabase.from("link_clicks").select("*", { count: "exact", head: true }),
      ]);

      if (e1 ?? e2 ?? e3 ?? e4) throw e1 ?? e2 ?? e3 ?? e4;

      return {
        users: usersCount ?? 0,
        links: linksCount ?? 0,
        views: viewsCount ?? 0,
        clicks: clicksCount ?? 0,
      };
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useUpdateUserPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, plan }: { userId: string; plan: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ plan })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const { error } = await supabase.rpc("admin_delete_user", {
        target_user_id: targetUserId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}
