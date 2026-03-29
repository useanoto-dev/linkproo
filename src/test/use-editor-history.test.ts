/**
 * History behaviour is now provided by useEditorStore (Zustand).
 * These tests exercise the same undo/redo/reset contract that was previously
 * covered by the deleted useEditorHistory hook.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "@/stores/editor-store";
import type { SmartLink } from "@/types/smart-link";

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

// Reset the store before each test to avoid cross-test pollution
beforeEach(() => {
  useEditorStore.getState().resetLink(BASE);
});

describe("editor-store history", () => {
  it("inicia com estado inicial, sem histórico", () => {
    const { link, canUndo, canRedo } = useEditorStore.getState();
    expect(link).toEqual(BASE);
    expect(canUndo).toBe(false);
    expect(canRedo).toBe(false);
  });

  it("setLink() atualiza o estado e habilita canUndo", () => {
    useEditorStore.getState().setLink({ ...BASE, businessName: "V2" });
    const { link, canUndo, canRedo } = useEditorStore.getState();
    expect(link.businessName).toBe("V2");
    expect(canUndo).toBe(true);
    expect(canRedo).toBe(false);
  });

  it("undo() restaura o estado anterior", () => {
    useEditorStore.getState().setLink({ ...BASE, businessName: "V2" });
    useEditorStore.getState().undo();
    const { link, canUndo, canRedo } = useEditorStore.getState();
    expect(link.businessName).toBe("Empresa");
    expect(canUndo).toBe(false);
    expect(canRedo).toBe(true);
  });

  it("redo() reaplicam estado desfeito", () => {
    useEditorStore.getState().setLink({ ...BASE, businessName: "V2" });
    useEditorStore.getState().undo();
    useEditorStore.getState().redo();
    const { link, canUndo, canRedo } = useEditorStore.getState();
    expect(link.businessName).toBe("V2");
    expect(canRedo).toBe(false);
    expect(canUndo).toBe(true);
  });

  it("setLink() após undo sobrescreve o futuro", () => {
    useEditorStore.getState().setLink({ ...BASE, businessName: "V2" });
    useEditorStore.getState().undo();
    useEditorStore.getState().setLink({ ...BASE, businessName: "V3" });
    expect(useEditorStore.getState().link.businessName).toBe("V3");
  });

  it("suporta atualização funcional via função", () => {
    useEditorStore.getState().setLink((prev) => ({ ...prev, tagline: "via fn" }));
    const { link, canUndo } = useEditorStore.getState();
    expect(link.tagline).toBe("via fn");
    expect(canUndo).toBe(true);
  });

  it("resetLink() limpa todo o histórico e seta novo estado", () => {
    useEditorStore.getState().setLink({ ...BASE, businessName: "V2" });
    useEditorStore.getState().setLink({ ...BASE, businessName: "V3" });
    useEditorStore.getState().resetLink(BASE);
    const { link, canUndo, canRedo } = useEditorStore.getState();
    expect(link).toEqual(BASE);
    expect(canUndo).toBe(false);
    expect(canRedo).toBe(false);
  });

  it("undo() sem histórico não lança erro e mantém estado", () => {
    useEditorStore.getState().undo();
    const { link, canUndo } = useEditorStore.getState();
    expect(link).toEqual(BASE);
    expect(canUndo).toBe(false);
  });

  it("redo() sem futuro não lança erro e mantém estado", () => {
    useEditorStore.getState().setLink({ ...BASE, businessName: "V2" });
    useEditorStore.getState().redo(); // nothing to redo
    expect(useEditorStore.getState().link.businessName).toBe("V2");
  });

  it("múltiplos undos restauram estados na ordem correta", () => {
    useEditorStore.getState().setLink({ ...BASE, businessName: "V2" });
    useEditorStore.getState().setLink({ ...BASE, businessName: "V3" });
    useEditorStore.getState().setLink({ ...BASE, businessName: "V4" });

    useEditorStore.getState().undo();
    expect(useEditorStore.getState().link.businessName).toBe("V3");

    useEditorStore.getState().undo();
    expect(useEditorStore.getState().link.businessName).toBe("V2");

    useEditorStore.getState().undo();
    expect(useEditorStore.getState().link.businessName).toBe("Empresa");
  });

  it("limite de 50 estados de histórico é respeitado", () => {
    for (let i = 0; i < 55; i++) {
      useEditorStore.getState().setLink((prev) => ({ ...prev, tagline: `V${i}` }));
    }
    // Undo 50 times (the maximum allowed)
    for (let i = 0; i < 50; i++) {
      useEditorStore.getState().undo();
    }
    expect(useEditorStore.getState().canUndo).toBe(false);
  });
});
