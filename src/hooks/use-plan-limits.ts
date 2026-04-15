import { useMemo } from "react";
import { useProfile } from "./use-profile";
import { useLinks } from "./use-links";
import { useUserRole } from "./use-user-role";

const PLAN_LIMITS: Record<string, { maxLinks: number; label: string }> = {
  free:     { maxLinks: 3,        label: "Free" },
  pro:      { maxLinks: 50,       label: "Pro" },
  business: { maxLinks: Infinity, label: "Business" },
};

const ADMIN_LIMITS = { maxLinks: Infinity, label: "Admin" };
const DEFAULT_LIMITS = PLAN_LIMITS.free;

export function usePlanLimits() {
  const { data: profile } = useProfile();
  const { data: links = [] } = useLinks();
  const { isAdmin } = useUserRole();

  const plan = profile?.plan || "free";
  const limits = isAdmin ? ADMIN_LIMITS : (PLAN_LIMITS[plan] ?? DEFAULT_LIMITS);
  const { maxLinks } = limits;

  const totalLinks = links.length;

  return useMemo(() => ({
    plan,
    limits,
    totalLinks,
    activeLinks: links.filter((l) => l.isActive).length,
    canCreateLink: isAdmin || totalLinks < maxLinks,
    linksRemaining: isAdmin ? Infinity : Math.max(0, maxLinks - totalLinks),
    isAtLimit: !isAdmin && totalLinks >= maxLinks,
  }), [plan, limits, maxLinks, totalLinks, links, isAdmin]);
}
