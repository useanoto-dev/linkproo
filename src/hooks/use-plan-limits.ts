import { useMemo } from "react";
import { useProfile } from "./use-profile";
import { useLinks } from "./use-links";
import { useUserRole } from "./use-user-role";

// Limits per plan
// free: 3 links | pro: 50 links | business: unlimited | admin: always unlimited
const PLAN_LIMITS: Record<string, { maxLinks: number; label: string }> = {
  free:     { maxLinks: 3,        label: "Free" },
  pro:      { maxLinks: 50,       label: "Pro" },
  business: { maxLinks: Infinity, label: "Business" },
};

export function usePlanLimits() {
  const { data: profile } = useProfile();
  const { data: links = [] } = useLinks();
  const { isAdmin } = useUserRole();

  const plan = profile?.plan || "free";
  // Admins always get unlimited regardless of plan
  const limits = isAdmin
    ? { maxLinks: Infinity, label: "Admin" }
    : (PLAN_LIMITS[plan] || PLAN_LIMITS.free);

  const activeLinks = links.filter((l) => l.isActive).length;
  const totalLinks = links.length;

  return useMemo(() => ({
    plan,
    limits,
    totalLinks,
    activeLinks,
    canCreateLink: totalLinks < limits.maxLinks,
    linksRemaining: Math.max(0, limits.maxLinks === Infinity ? Infinity : limits.maxLinks - totalLinks),
    isAtLimit: !isAdmin && totalLinks >= limits.maxLinks,
  }), [plan, limits, totalLinks, activeLinks, isAdmin]);
}
