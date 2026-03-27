import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutosave } from "@/hooks/use-autosave";
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

describe("useAutosave", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("inicia com status 'idle'", () => {
    const { result } = renderHook(() => useAutosave(BASE, vi.fn(), true));
    expect(result.current.status).toBe("idle");
  });

  it("não salva quando enabled=false", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutosave(BASE, saveFn, false));

    await act(async () => { vi.advanceTimersByTime(3000); });

    expect(saveFn).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
  });

  it("não salva quando slug está vazio", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutosave({ ...BASE, slug: "" }, saveFn, true)
    );

    await act(async () => { vi.advanceTimersByTime(3000); });

    expect(saveFn).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
  });

  it("salva após o delay quando o link muda", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ link }) => useAutosave(link, saveFn, true, 1000),
      { initialProps: { link: BASE } }
    );

    act(() => { result.current.initializeRef(BASE); });

    rerender({ link: { ...BASE, businessName: "Novo Nome" } });

    // Antes do delay: não salvou
    await act(async () => { vi.advanceTimersByTime(800); });
    expect(saveFn).not.toHaveBeenCalled();

    // Após o delay: salvou
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(saveFn).toHaveBeenCalledOnce();
    expect(result.current.status).toBe("saved");
  });

  it("não salva quando apenas campos voláteis mudam (views, clicks)", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ link }) => useAutosave(link, saveFn, true, 500),
      { initialProps: { link: BASE } }
    );

    act(() => { result.current.initializeRef(BASE); });

    // views e clicks são excluídos da serialização
    rerender({ link: { ...BASE, views: 999, clicks: 888 } });

    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(saveFn).not.toHaveBeenCalled();
  });

  it("status transita para 'error' quando saveFn rejeita", async () => {
    const saveFn = vi.fn().mockRejectedValue(new Error("Falha"));
    const { result, rerender } = renderHook(
      ({ link }) => useAutosave(link, saveFn, true, 500),
      { initialProps: { link: BASE } }
    );

    act(() => { result.current.initializeRef(BASE); });
    rerender({ link: { ...BASE, businessName: "Com Erro" } });

    await act(async () => { vi.advanceTimersByTime(600); });

    expect(result.current.status).toBe("error");
  });

  it("flush() salva imediatamente sem aguardar o debounce", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ link }) => useAutosave(link, saveFn, true, 5000),
      { initialProps: { link: BASE } }
    );

    act(() => { result.current.initializeRef(BASE); });
    rerender({ link: { ...BASE, businessName: "Flush Test" } });

    // Não avança timers — flush deve salvar de imediato
    await act(async () => { await result.current.flush(); });

    expect(saveFn).toHaveBeenCalledOnce();
    expect(result.current.status).toBe("saved");
  });

  it("flush() não salva quando enabled=false", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutosave(BASE, saveFn, false, 500));

    await act(async () => { await result.current.flush(); });

    expect(saveFn).not.toHaveBeenCalled();
  });

  it("flush() não salva quando nada mudou desde o último save", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutosave(BASE, saveFn, true, 500));

    act(() => { result.current.initializeRef(BASE); });

    await act(async () => { await result.current.flush(); });

    expect(saveFn).not.toHaveBeenCalled();
  });

  it("savedAt é atualizado após save bem-sucedido", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ link }) => useAutosave(link, saveFn, true, 500),
      { initialProps: { link: BASE } }
    );

    act(() => { result.current.initializeRef(BASE); });

    expect(result.current.savedAt).toBeNull();

    rerender({ link: { ...BASE, businessName: "SavedAt Test" } });

    await act(async () => { vi.advanceTimersByTime(600); });

    expect(result.current.savedAt).toBeInstanceOf(Date);
  });
});
