/**
 * Testes da lógica de agendamento de blocos implementada na Phase 9.
 * Reproduz a lógica de visibilidade do BlockRenderer.tsx (linhas 185-188).
 */
import { describe, it, expect } from "vitest";

// Espelha exatamente a lógica do BlockRenderer (não-isNewLink):
//   if (block.visibleFrom && now < new Date(block.visibleFrom)) return null;
//   if (block.visibleUntil && now >= new Date(block.visibleUntil)) return null;
function isBlockVisible(
  visibleFrom: string | undefined,
  visibleUntil: string | undefined,
  now: Date
): boolean {
  if (!visibleFrom && !visibleUntil) return true;
  if (visibleFrom && now < new Date(visibleFrom)) return false;
  if (visibleUntil && now >= new Date(visibleUntil)) return false;
  return true;
}

const NOW = new Date("2026-03-27T12:00:00.000Z");
const PAST = "2020-01-01T00:00:00.000Z";
const FUTURE = "2099-01-01T00:00:00.000Z";

describe("agendamento de blocos (Phase 9 — visibleFrom / visibleUntil)", () => {
  it("bloco sem agendamento é sempre visível", () => {
    expect(isBlockVisible(undefined, undefined, NOW)).toBe(true);
  });

  it("visibleFrom no passado → bloco visível", () => {
    expect(isBlockVisible(PAST, undefined, NOW)).toBe(true);
  });

  it("visibleFrom no futuro → bloco oculto", () => {
    expect(isBlockVisible(FUTURE, undefined, NOW)).toBe(false);
  });

  it("visibleUntil no futuro → bloco visível", () => {
    expect(isBlockVisible(undefined, FUTURE, NOW)).toBe(true);
  });

  it("visibleUntil no passado → bloco oculto (expirado)", () => {
    expect(isBlockVisible(undefined, PAST, NOW)).toBe(false);
  });

  it("dentro da janela (visibleFrom passado + visibleUntil futuro) → visível", () => {
    expect(isBlockVisible(PAST, FUTURE, NOW)).toBe(true);
  });

  it("antes da janela (ambos no futuro) → oculto", () => {
    expect(isBlockVisible(FUTURE, FUTURE, NOW)).toBe(false);
  });

  it("visibleUntil exatamente igual a now → oculto (>= é exclusivo)", () => {
    const exact = NOW.toISOString();
    expect(isBlockVisible(undefined, exact, NOW)).toBe(false);
  });

  it("visibleFrom exatamente igual a now → visível (< é exclusivo)", () => {
    const exact = NOW.toISOString();
    expect(isBlockVisible(exact, undefined, NOW)).toBe(true);
  });

  it("1 segundo antes de visibleFrom → oculto", () => {
    const in1sec = new Date(NOW.getTime() + 1000).toISOString();
    expect(isBlockVisible(in1sec, undefined, NOW)).toBe(false);
  });

  it("1 segundo após visibleFrom → visível", () => {
    const past1sec = new Date(NOW.getTime() - 1000).toISOString();
    expect(isBlockVisible(past1sec, undefined, NOW)).toBe(true);
  });
});
