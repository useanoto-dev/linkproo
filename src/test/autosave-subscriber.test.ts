import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useEditorStore } from "@/stores/editor-store";
import type { SmartLink } from "@/types/smart-link";

// vi.hoisted garante que as variáveis estejam disponíveis quando o mock for hoisted
const { mockFrom, mockEq2 } = vi.hoisted(() => {
  const mockEq2 = vi.fn().mockResolvedValue({ error: null });
  const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
  const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });
  const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });
  return { mockFrom, mockEq2 };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

vi.mock("@/lib/link-mappers", () => ({
  smartLinkToRow: vi.fn((link: SmartLink, userId: string) => ({
    id: link.id,
    slug: link.slug,
    user_id: userId,
  })),
}));

import {
  registerAutosaveSubscriber,
  flushAutosave,
  retryAutosave,
} from "@/stores/autosave-subscriber";

const BASE: SmartLink = {
  id: "test-id",
  slug: "test-slug",
  businessName: "Empresa",
  tagline: "",
  heroImage: "",
  logoUrl: "",
  backgroundColor: "from-gray-50 to-white",
  textColor: "text-white",
  accentColor: "#f59e0b",
  buttons: [],
  pages: [],
  badges: [],
  floatingEmojis: [],
  blocks: [],
  views: 0,
  clicks: 0,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  // Restore success mock (may be overridden in error tests)
  mockEq2.mockResolvedValue({ error: null });
  const store = useEditorStore.getState();
  store.resetLink(BASE);
  store.setAutosaveEnabled(true);
  store.initAutosaveSnapshot(BASE);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("registerAutosaveSubscriber", () => {
  it("returns an unsubscribe function", () => {
    const unsub = registerAutosaveSubscriber("user-123");
    expect(typeof unsub).toBe("function");
    unsub();
  });

  it("triggers save after debounce (1500ms) when link changes", async () => {
    const unsub = registerAutosaveSubscriber("user-123");

    useEditorStore.getState().setLink(
      { ...BASE, businessName: "Changed" },
      true // skipHistory to avoid side effects
    );

    // Before debounce: no save
    vi.advanceTimersByTime(1000);
    expect(mockFrom).not.toHaveBeenCalled();

    // After debounce: save fires
    await vi.advanceTimersByTimeAsync(600);
    expect(mockFrom).toHaveBeenCalledWith("links");

    unsub();
  });

  it("does NOT save when autosave.enabled is false", async () => {
    useEditorStore.getState().setAutosaveEnabled(false);
    const unsub = registerAutosaveSubscriber("user-123");

    useEditorStore.getState().setLink({ ...BASE, businessName: "Disabled" }, true);
    await vi.advanceTimersByTimeAsync(2000);

    expect(mockFrom).not.toHaveBeenCalled();
    unsub();
  });

  it("does NOT save when link.id starts with 'new-'", async () => {
    const unsub = registerAutosaveSubscriber("user-123");

    useEditorStore.getState().setLink({ ...BASE, id: "new-temp", businessName: "Temp" }, true);
    await vi.advanceTimersByTimeAsync(2000);

    expect(mockFrom).not.toHaveBeenCalled();
    unsub();
  });

  it("does NOT save when snapshot is unchanged", async () => {
    const unsub = registerAutosaveSubscriber("user-123");

    // Set same link — snapshot already matches
    useEditorStore.getState().setLink({ ...BASE }, true);
    await vi.advanceTimersByTimeAsync(2000);

    expect(mockFrom).not.toHaveBeenCalled();
    unsub();
  });

  it("unsubscribe clears pending timer — no save fires after cleanup", async () => {
    const unsub = registerAutosaveSubscriber("user-123");

    useEditorStore.getState().setLink({ ...BASE, businessName: "Pending" }, true);
    unsub(); // cleanup before debounce fires

    await vi.advanceTimersByTimeAsync(2000);
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe("flushAutosave", () => {
  it("saves immediately without waiting for debounce", async () => {
    const unsub = registerAutosaveSubscriber("user-123");

    useEditorStore.getState().setLink({ ...BASE, businessName: "Flush" }, true);

    // Do NOT advance timers — flush should save now
    await flushAutosave();

    expect(mockFrom).toHaveBeenCalledWith("links");
    unsub();
  });

  it("skips save when snapshot is unchanged", async () => {
    const unsub = registerAutosaveSubscriber("user-123");

    // No link change since snapshot was init'd
    await flushAutosave();

    expect(mockFrom).not.toHaveBeenCalled();
    unsub();
  });
});

describe("retryAutosave", () => {
  it("saves current link state", async () => {
    const unsub = registerAutosaveSubscriber("user-123");

    useEditorStore.getState().setLink({ ...BASE, businessName: "Retry" }, true);
    await retryAutosave();

    expect(mockFrom).toHaveBeenCalledWith("links");
    unsub();
  });
});

describe("performSave error handling", () => {
  it("sets autosave.status to 'error' on Supabase failure", async () => {
    mockEq2.mockResolvedValue({ error: new Error("DB fail") });

    const unsub = registerAutosaveSubscriber("user-123");
    useEditorStore.getState().setLink({ ...BASE, businessName: "Error" }, true);

    await vi.advanceTimersByTimeAsync(2000);

    expect(useEditorStore.getState().autosave.status).toBe("error");
    unsub();
  });
});
