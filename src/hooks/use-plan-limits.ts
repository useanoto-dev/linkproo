import { useMemo } from "react";
import { useProfile } from "./use-profile";
import { useLinks } from "./use-links";

// Limits per plan — aligned with src/data/plans.ts
// free: "Até 3 links" | pro: "Até 50 links" | business: unlimited
const PLAN_LIMITS: Record<string, { maxLinks: number; label: string }> = {
  free:     { maxLinks: 3,        label: "Free" },
  pro:      { maxLinks: 50,       label: "Pro" },
  business: { maxLinks: Infinity, label: "Business" },
};

export function usePlanLimits() {
  const { data: profile } = useProfile();
  const { data: links = [] } = useLinks();

  const plan = profile?.plan || "free";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const activeLinks = links.filter((l) => l.isActive).length;
  const totalLinks = links.length;

  return useMemo(() => ({
    plan,
    limits,
    totalLinks,
    activeLinks,
    canCreateLink: totalLinks < limits.maxLinks,
    linksRemaining: Math.max(0, limits.maxLinks - totalLinks),
    isAtLimit: totalLinks >= limits.maxLinks,
  }), [plan, limits, totalLinks, activeLinks]);
}
