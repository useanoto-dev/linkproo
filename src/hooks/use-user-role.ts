import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  const { user, loading: isAuthLoading } = useAuth();

  const { data: role = null, isLoading: isRoleLoading } = useQuery({
    queryKey: ["user-role-check", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      return (data as any)?.role as string | null;
    },
    enabled: !!user && !isAuthLoading,
    staleTime: 1000 * 60 * 5,
  });

  return {
    role,
    isAdmin: role === "admin",
    isLoading: isAuthLoading || isRoleLoading,
  };
}
