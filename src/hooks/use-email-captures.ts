import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export async function saveEmailCapture(linkId: string, email: string, blockId: string): Promise<void> {
  const { error } = await supabase.from("email_captures").insert({
    link_id: linkId,
    email: email.toLowerCase().trim(),
    source_block_id: blockId,
  });
  if (error) throw error;
}

export function useEmailCaptures(linkId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["email-captures", linkId],
    queryFn: async () => {
      if (!linkId || !user) return [];
      const { data, error } = await supabase
        .from("email_captures")
        .select("id, email, captured_at, source_block_id")
        .eq("link_id", linkId)
        .order("captured_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!linkId && !!user,
  });
}
