import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

// Mocks declarados antes do import do módulo
vi.mock("@/hooks/use-profile", () => ({ useProfile: vi.fn() }));
vi.mock("@/hooks/use-links", () => ({ useLinks: vi.fn() }));
vi.mock("@/hooks/use-user-role", () => ({ useUserRole: vi.fn() }));

import { usePlanLimits } from "@/hooks/use-plan-limits";
import { useProfile } from "@/hooks/use-profile";
import { useLinks } from "@/hooks/use-links";
import { useUserRole } from "@/hooks/use-user-role";

function setup(plan: string, linkCount: number, isAdmin = false) {
  const links = Array.from({ length: linkCount }, (_, i) => ({
    id: `link-${i}`,
    isActive: true,
  }));
  vi.mocked(useProfile).mockReturnValue({ data: { plan } } as ReturnType<typeof useProfile>);
  vi.mocked(useLinks).mockReturnValue({ data: links } as ReturnType<typeof useLinks>);
  vi.mocked(useUserRole).mockReturnValue({ isAdmin } as ReturnType<typeof useUserRole>);
}

describe("usePlanLimits", () => {
  it("plano free: limite de 3 links", () => {
    setup("free", 0);
    const { result } = renderHook(() => usePlanLimits());
    expect(result.current.limits.maxLinks).toBe(3);
    expect(result.current.plan).toBe("free");
  });

  it("plano free: canCreateLink=true quando abaixo do limite", () => {
    setup("free", 2);
    const { result } = renderHook(() => usePlanLimits());
    expect(result.current.canCreateLink).toBe(true);
    expect(result.current.isAtLimit).toBe(false);
  });

  it("plano free: isAtLimit=true quando no limite (3 links)", () => {
    setup("free", 3);
    const { result } = renderHook(() => usePlanLimits());
    expect(result.current.isAtLimit).toBe(true);
    expect(result.current.canCreateLink).toBe(false);
    expect(result.current.linksRemaining).toBe(0);
  });

  it("plano pro: limite de 50 links", () => {
    setup("pro", 10);
    const { result } = renderHook(() => usePlanLimits());
    expect(result.current.limits.maxLinks).toBe(50);
    expect(result.current.linksRemaining).toBe(40);
    expect(result.current.isAtLimit).toBe(false);
  });

  it("plano business: sem limite (Infinity)", () => {
    setup("business", 100);
    const { result } = renderHook(() => usePlanLimits());
    expect(result.current.limits.maxLinks).toBe(Infinity);
    expect(result.current.canCreateLink).toBe(true);
    expect(result.current.isAtLimit).toBe(false);
  });

  it("admin: sempre ilimitado independente do plano", () => {
    setup("free", 99, true);
    const { result } = renderHook(() => usePlanLimits());
    expect(result.current.limits.maxLinks).toBe(Infinity);
    expect(result.current.isAtLimit).toBe(false);
    expect(result.current.canCreateLink).toBe(true);
    expect(result.current.limits.label).toBe("Admin");
  });

  it("plano desconhecido cai no fallback do free (3 links)", () => {
    setup("unknown_plan", 0);
    const { result } = renderHook(() => usePlanLimits());
    expect(result.current.limits.maxLinks).toBe(3);
  });

  it("sem profile: usa plano 'free' como padrão", () => {
    vi.mocked(useProfile).mockReturnValue({ data: null } as ReturnType<typeof useProfile>);
    vi.mocked(useLinks).mockReturnValue({ data: [] } as ReturnType<typeof useLinks>);
    vi.mocked(useUserRole).mockReturnValue({ isAdmin: false } as ReturnType<typeof useUserRole>);

    const { result } = renderHook(() => usePlanLimits());
    expect(result.current.plan).toBe("free");
    expect(result.current.limits.maxLinks).toBe(3);
  });

  it("linksRemaining é calculado corretamente", () => {
    setup("free", 1);
    const { result } = renderHook(() => usePlanLimits());
    expect(result.current.linksRemaining).toBe(2);
  });

  it("totalLinks reflete todos os links (ativos e inativos)", () => {
    vi.mocked(useProfile).mockReturnValue({ data: { plan: "pro" } } as ReturnType<typeof useProfile>);
    vi.mocked(useLinks).mockReturnValue({
      data: [
        { id: "l1", isActive: true },
        { id: "l2", isActive: false },
        { id: "l3", isActive: true },
      ],
    } as ReturnType<typeof useLinks>);
    vi.mocked(useUserRole).mockReturnValue({ isAdmin: false } as ReturnType<typeof useUserRole>);

    const { result } = renderHook(() => usePlanLimits());
    expect(result.current.totalLinks).toBe(3);
    expect(result.current.activeLinks).toBe(2);
  });
});
