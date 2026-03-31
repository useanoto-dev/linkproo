import { useMemo } from "react";
import { useProfile } from "./use-profile";
import { useLinks } from "./use-links";
import { useUserRole } from "./use-user-role";

// Free for everyone: 1 smart link. Admins: unlimited.
export function usePlanLimits() {
  const { data: profile } = useProfile();
  const { data: links = [] } = useLinks();
  const { isAdmin } = useUserRole();

  const plan = profile?.plan || "free";
  const maxLinks = isAdmin ? Infinity : 1;

  const totalLinks = links.length;

  return useMemo(() => ({
    plan,
    limits: { maxLinks, label: isAdmin ? "Admin" : "Free" },
    totalLinks,
    activeLinks: links.filter((l) => l.isActive).length,
    canCreateLink: isAdmin || totalLinks < 1,
    linksRemaining: isAdmin ? Infinity : Math.max(0, 1 - totalLinks),
    isAtLimit: !isAdmin && totalLinks >= 1,
  }), [plan, maxLinks, totalLinks, links, isAdmin]);
}
