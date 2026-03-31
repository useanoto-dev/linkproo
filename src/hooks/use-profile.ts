import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  company: string | null;
  plan: string | null;
  country: string | null;
  timezone: string | null;
}

function timezoneToCountry(tz: string): string {
  if (
    tz.startsWith('America/Sao_Paulo') ||
    tz.startsWith('America/Fortaleza') ||
    tz.startsWith('America/Manaus') ||
    tz.startsWith('America/Belem') ||
    tz.startsWith('America/Recife') ||
    tz.startsWith('America/Maceio') ||
    tz.startsWith('America/Bahia') ||
    tz.startsWith('America/Cuiaba') ||
    tz.startsWith('America/Porto_Velho') ||
    tz.startsWith('America/Boa_Vista') ||
    tz.startsWith('America/Porto_Acre') ||
    tz.startsWith('America/Noronha') ||
    tz.startsWith('America/Araguaina') ||
    tz.startsWith('America/Santarem')
  ) return 'Brasil';
  if (tz.startsWith('America/')) return 'América';
  if (tz.startsWith('Europe/')) return 'Europa';
  if (tz.startsWith('Africa/')) return 'África';
  if (tz.startsWith('Asia/')) return 'Ásia';
  if (tz.startsWith('Pacific/')) return 'Pacífico';
  return 'Outro';
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, company, plan, country, timezone")
        .eq("user_id", user.id)
        .maybeSingle();

      // Auto-capture timezone/country if missing
      if (data && (!data.country || !data.timezone)) {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const country = timezoneToCountry(tz);
        await supabase
          .from("profiles")
          .update({ timezone: tz, country })
          .eq("user_id", user.id);
        return { ...data, timezone: tz, country } as Profile;
      }

      return data as Profile | null;
    },
    enabled: !!user,
  });
}
