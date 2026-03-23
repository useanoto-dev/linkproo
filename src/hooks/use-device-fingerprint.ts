import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceFingerprint } from "@/lib/device-fingerprint";

/**
 * Silently records the current device fingerprint for the logged-in user.
 * Call this once in a top-level authenticated component (e.g. DashboardLayout).
 * On the same device, multiple calls are idempotent (upsert on user_id+fingerprint).
 */
export function useDeviceFingerprint() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const fingerprint = await getDeviceFingerprint();
        if (cancelled) return;

        await supabase.from("device_fingerprints").upsert(
          {
            user_id: user.id,
            fingerprint,
            user_agent: navigator.userAgent.slice(0, 500),
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "user_id,fingerprint" }
        );
      } catch {
        // Non-critical — silently ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]); // re-runs only when user changes
}
