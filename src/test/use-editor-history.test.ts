import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEditorHistory } from "@/hooks/use-editor-history";
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

describe("useEditorHistory", () => {
  it("inicia com estado inicial, sem histórico", () => {
    const { result } = renderHook(() => useEditorHistory(BASE));
    expect(result.current.state).toEqual(BASE);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("set() atualiza o estado e habilita canUndo", () => {
    const { result } = renderHook(() => useEditorHistory(BASE));

    act(() => { result.current.set({ ...BASE, businessName: "V2" }); });

    expect(result.current.state.businessName).toBe("V2");
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("undo() restaura o estado anterior", () => {
    const { result } = renderHook(() => useEditorHistory(BASE));

    act(() => { result.current.set({ ...BASE, businessName: "V2" }); });
    act(() => { result.current.undo(); });

    expect(result.current.state.businessName).toBe("Empresa");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it("redo() reaplicam estado desfeito", () => {
    const { result } = renderHook(() => useEditorHistory(BASE));

    act(() => { result.current.set({ ...BASE, businessName: "V2" }); });
    act(() => { result.current.undo(); });
    act(() => { result.current.redo(); });

    expect(result.current.state.businessName).toBe("V2");
    expect(result.current.canRedo).toBe(false);
    expect(result.current.canUndo).toBe(true);
  });

  it("set() após undo atualiza o estado para o novo valor", () => {
    const { result } = renderHook(() => useEditorHistory(BASE));

    act(() => { result.current.set({ ...BASE, businessName: "V2" }); });
    act(() => { result.current.undo(); });
    act(() => { result.current.set({ ...BASE, businessName: "V3" }); });

    expect(result.current.state.businessName).toBe("V3");
  });

  it("suporta atualização funcional via função", () => {
    const { result } = renderHook(() => useEditorHistory(BASE));

    act(() => {
      result.current.set((prev) => ({ ...prev, tagline: "via fn" }));
    });

    expect(result.current.state.tagline).toBe("via fn");
    expect(result.current.canUndo).toBe(true);
  });

  it("reset() limpa todo o histórico e seta novo estado", () => {
    const { result } = renderHook(() => useEditorHistory(BASE));

    act(() => { result.current.set({ ...BASE, businessName: "V2" }); });
    act(() => { result.current.set({ ...BASE, businessName: "V3" }); });
    act(() => { result.current.reset(BASE); });

    expect(result.current.state).toEqual(BASE);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("undo() sem histórico não lança erro e mantém estado", () => {
    const { result } = renderHook(() => useEditorHistory(BASE));

    act(() => { result.current.undo(); });

    expect(result.current.state).toEqual(BASE);
    expect(result.current.canUndo).toBe(false);
  });

  it("redo() sem futuro não lança erro e mantém estado", () => {
    const { result } = renderHook(() => useEditorHistory(BASE));

    act(() => { result.current.set({ ...BASE, businessName: "V2" }); });
    act(() => { result.current.redo(); }); // nada para redesfazer

    expect(result.current.state.businessName).toBe("V2");
  });

  it("múltiplos undos restauram estados na ordem correta", () => {
    const { result } = renderHook(() => useEditorHistory(BASE));

    act(() => { result.current.set({ ...BASE, businessName: "V2" }); });
    act(() => { result.current.set({ ...BASE, businessName: "V3" }); });
    act(() => { result.current.set({ ...BASE, businessName: "V4" }); });

    act(() => { result.current.undo(); });
    expect(result.current.state.businessName).toBe("V3");

    act(() => { result.current.undo(); });
    expect(result.current.state.businessName).toBe("V2");

    act(() => { result.current.undo(); });
    expect(result.current.state.businessName).toBe("Empresa");
  });

  it("limite de 50 estados de histórico é respeitado", () => {
    const { result } = renderHook(() => useEditorHistory(BASE));

    for (let i = 0; i < 55; i++) {
      act(() => { result.current.set((prev) => ({ ...prev, tagline: `V${i}` })); });
    }

    // Desfaz 50 vezes (máximo permitido)
    for (let i = 0; i < 50; i++) {
      act(() => { result.current.undo(); });
    }

    expect(result.current.canUndo).toBe(false);
  });
});
