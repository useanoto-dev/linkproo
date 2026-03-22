import { describe, it, expect } from "vitest";
import { extractBgColor, getCustomBgGradient, COLOR_PRESETS } from "@/lib/color-utils";

// ---------------------------------------------------------------------------
// extractBgColor
// ---------------------------------------------------------------------------
describe("extractBgColor", () => {
  it("retorna a cor correta para o preset padrão 'from-gray-50 to-white'", () => {
    expect(extractBgColor("from-gray-50 to-white")).toBe("#ffffff");
  });

  it("retorna a cor correta para preset de tema escuro 'from-slate-950 to-slate-900'", () => {
    expect(extractBgColor("from-slate-950 to-slate-900")).toBe("#0f172a");
  });

  it("retorna a cor correta para preset 'from-blue-950 to-indigo-950'", () => {
    expect(extractBgColor("from-blue-950 to-indigo-950")).toBe("#1e1b4b");
  });

  it("retorna a cor correta para preset 'from-rose-950 to-red-950'", () => {
    expect(extractBgColor("from-rose-950 to-red-950")).toBe("#4c0519");
  });

  it("retorna #000000 para um preset desconhecido", () => {
    expect(extractBgColor("from-unknown-500 to-unknown-600")).toBe("#000000");
  });

  it("retorna #000000 para string vazia", () => {
    expect(extractBgColor("")).toBe("#000000");
  });

  it("extrai a cor de fundo de um valor custom: com formato 'custom:startColor:endColor'", () => {
    // formato: custom:<startColor>:<endColor> — extractBgColor retorna p[2] (endColor)
    expect(extractBgColor("custom:#1a1a2e:#16213e")).toBe("#16213e");
  });

  it("extrai corretamente a segunda cor de gradiente custom", () => {
    expect(extractBgColor("custom:#ff0000:#0000ff")).toBe("#0000ff");
  });

  it("retorna todos os presets do colorMap sem retornar #000000", () => {
    const knownPresets = [
      "from-gray-50 to-white",
      "from-orange-50 to-amber-50",
      "from-blue-50 to-sky-100",
      "from-green-50 to-emerald-50",
      "from-pink-50 to-rose-100",
      "from-violet-50 to-purple-100",
      "from-slate-950 to-slate-900",
      "from-slate-950 to-gray-900",
      "from-blue-950 to-indigo-950",
      "from-blue-950 to-cyan-950",
      "from-green-950 to-emerald-950",
      "from-rose-950 to-red-950",
      "from-rose-950 to-pink-950",
      "from-purple-950 to-indigo-950",
    ];

    for (const preset of knownPresets) {
      const result = extractBgColor(preset);
      expect(result, `Preset "${preset}" deveria ter uma cor mapeada`).not.toBe("#000000");
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

// ---------------------------------------------------------------------------
// getCustomBgGradient
// ---------------------------------------------------------------------------
describe("getCustomBgGradient", () => {
  it("retorna undefined para string que não começa com 'custom:'", () => {
    expect(getCustomBgGradient("from-gray-50 to-white")).toBeUndefined();
  });

  it("retorna undefined para string vazia", () => {
    expect(getCustomBgGradient("")).toBeUndefined();
  });

  it("retorna um gradiente CSS para valor custom válido", () => {
    const result = getCustomBgGradient("custom:#1a1a2e:#16213e");
    expect(result).toBe("linear-gradient(180deg, #1a1a2e, #16213e)");
  });

  it("formata corretamente o gradiente com as cores na ordem start → end", () => {
    const result = getCustomBgGradient("custom:#ff6b6b:#4ecdc4");
    expect(result).toBe("linear-gradient(180deg, #ff6b6b, #4ecdc4)");
  });

  it("usa direção 180deg (vertical, de cima para baixo)", () => {
    const result = getCustomBgGradient("custom:#000000:#ffffff");
    expect(result).toContain("180deg");
  });

  it("preserva as cores exatamente como foram fornecidas (sem transformação)", () => {
    const result = getCustomBgGradient("custom:rgba(255,0,0,0.5):rgba(0,0,255,0.5)");
    expect(result).toBe("linear-gradient(180deg, rgba(255,0,0,0.5), rgba(0,0,255,0.5))");
  });
});

// ---------------------------------------------------------------------------
// COLOR_PRESETS (constante exportada)
// ---------------------------------------------------------------------------
describe("COLOR_PRESETS", () => {
  it("é um array não-vazio", () => {
    expect(Array.isArray(COLOR_PRESETS)).toBe(true);
    expect(COLOR_PRESETS.length).toBeGreaterThan(0);
  });

  it("cada preset tem as propriedades 'label' e 'value'", () => {
    for (const preset of COLOR_PRESETS) {
      expect(preset).toHaveProperty("label");
      expect(preset).toHaveProperty("value");
      expect(typeof preset.label).toBe("string");
      expect(typeof preset.value).toBe("string");
      expect(preset.label.length).toBeGreaterThan(0);
      expect(preset.value.length).toBeGreaterThan(0);
    }
  });

  it("contém o preset padrão 'Branco' com value 'from-gray-50 to-white'", () => {
    const branco = COLOR_PRESETS.find((p) => p.label === "Branco");
    expect(branco).toBeDefined();
    expect(branco?.value).toBe("from-gray-50 to-white");
  });

  it("todos os values dos presets são reconhecidos por extractBgColor (não retornam fallback #000000)", () => {
    for (const preset of COLOR_PRESETS) {
      const color = extractBgColor(preset.value);
      expect(
        color,
        `Preset "${preset.label}" (value: "${preset.value}") deveria ser mapeado`,
      ).not.toBe("#000000");
    }
  });

  it("não tem labels duplicados", () => {
    const labels = COLOR_PRESETS.map((p) => p.label);
    const unique = new Set(labels);
    expect(unique.size).toBe(labels.length);
  });

  it("não tem values duplicados", () => {
    const values = COLOR_PRESETS.map((p) => p.value);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});
