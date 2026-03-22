/**
 * Testes de sanidade dos utilitários básicos do projeto.
 * Substitui o placeholder original que só tinha expect(true).toBe(true).
 */
import { describe, it, expect } from "vitest";
import { normalizeSlug, validateSlug } from "@/lib/slug-utils";
import { extractBgColor } from "@/lib/color-utils";

describe("sanidade geral dos utilitários", () => {
  it("normalizeSlug transforma texto com acentos em slug válido", () => {
    expect(normalizeSlug("Meu Link Incrível")).toBe("meu-link-incrivel");
  });

  it("validateSlug retorna null para slug simples e válido", () => {
    expect(validateSlug("minha-empresa")).toBeNull();
  });

  it("validateSlug rejeita slug com menos de 3 caracteres", () => {
    const error = validateSlug("ab");
    expect(error).not.toBeNull();
    expect(typeof error).toBe("string");
  });

  it("extractBgColor retorna uma cor hex válida para um preset conhecido", () => {
    const color = extractBgColor("from-gray-50 to-white");
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("extractBgColor retorna #000000 para preset desconhecido", () => {
    expect(extractBgColor("preset-inexistente")).toBe("#000000");
  });
});
