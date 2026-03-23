import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  const { user, loading: isAuthLoading } = useAuth();

  const { data: isAdmin = false, isLoading: isRoleLoading } = useQuery({
    queryKey: ["user-role-check", user?.id],
    queryFn: async () => {
      if (!user) return false;
      // Query specifically for admin role — avoids returning 'user' when both rows exist
      const { data } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !isAuthLoading,
    staleTime: 1000 * 60 * 5,
  });

  return {
    role: isAdmin ? "admin" : "user",
    isAdmin,
    isLoading: isAuthLoading || isRoleLoading,
  };
}
