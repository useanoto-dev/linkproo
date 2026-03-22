import { describe, it, expect } from "vitest";
import { rowToSmartLink, smartLinkToRow } from "@/lib/link-mappers";
import type { SmartLink } from "@/types/smart-link";

// ---------------------------------------------------------------------------
// Fixture: SmartLink completo para testes de roundtrip
// ---------------------------------------------------------------------------
const FULL_SMART_LINK: SmartLink = {
  id: "test-id-001",
  slug: "empresa-teste",
  businessName: "Empresa Teste",
  businessNameHtml: false,
  tagline: "O melhor link da cidade",
  heroImage: "https://example.com/hero.jpg",
  heroImageHeight: "md",
  heroImageOpacity: 90,
  heroOverlayOpacity: 20,
  heroOverlayColor: "dark",
  logoUrl: "https://example.com/logo.png",
  logoSizePx: 96,
  logoShape: "circle",
  logoShadow: false,
  backgroundColor: "from-blue-950 to-indigo-950",
  textColor: "text-white",
  accentColor: "#3b82f6",
  fontFamily: "Poppins",
  titleSize: 28,
  businessNameFontSize: 32,
  businessNameAlign: "left",
  hideBusinessName: false,
  hideTagline: true,
  entryAnimation: "slide-left",
  snowEffect: { enabled: true, intensity: 50, color: "#ffffff" },
  bubblesEffect: undefined,
  firefliesEffect: undefined,
  matrixEffect: undefined,
  starsEffect: undefined,
  bgHtml: undefined,
  buttons: [
    {
      id: "btn-001",
      label: "WhatsApp",
      subtitle: "Fale conosco",
      url: "https://wa.me/5511999999999",
      linkType: "whatsapp",
      icon: "whatsapp",
      order: 0,
    },
  ],
  pages: [],
  badges: ["badge-1", "badge-2"],
  floatingEmojis: ["🎉", "🚀"],
  blocks: [
    {
      id: "block-001",
      type: "text",
      order: 0,
      content: "Bem-vindo ao meu link!",
    },
  ],
  views: 42,
  clicks: 10,
  isActive: true,
  createdAt: "2026-01-15T10:00:00.000Z",
};

// ---------------------------------------------------------------------------
// rowToSmartLink
// ---------------------------------------------------------------------------
describe("rowToSmartLink", () => {
  it("mapeia corretamente os campos snake_case do banco para camelCase", () => {
    const row = {
      id: "row-id",
      slug: "meu-slug",
      business_name: "Minha Empresa",
      tagline: "Tagline da empresa",
      hero_image: "",
      logo_url: "",
      background_color: "from-gray-50 to-white",
      text_color: "text-white",
      accent_color: "#f59e0b",
      buttons: [],
      pages: [],
      badges: [],
      floating_emojis: [],
      blocks: [],
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    };

    const link = rowToSmartLink(row);

    expect(link.id).toBe("row-id");
    expect(link.slug).toBe("meu-slug");
    expect(link.businessName).toBe("Minha Empresa");
    expect(link.tagline).toBe("Tagline da empresa");
    expect(link.backgroundColor).toBe("from-gray-50 to-white");
    expect(link.textColor).toBe("text-white");
    expect(link.accentColor).toBe("#f59e0b");
    expect(link.isActive).toBe(true);
    expect(link.createdAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("aplica valores padrão para campos ausentes no row", () => {
    const link = rowToSmartLink({ id: "x", slug: "x" });

    expect(link.tagline).toBe("");
    expect(link.heroImage).toBe("");
    expect(link.logoUrl).toBe("");
    expect(link.logoSizePx).toBe(80);
    expect(link.logoShape).toBe("rounded");
    expect(link.logoShadow).toBe(true);
    expect(link.backgroundColor).toBe("from-gray-50 to-white");
    expect(link.textColor).toBe("text-white");
    expect(link.accentColor).toBe("#f59e0b");
    expect(link.fontFamily).toBe("Inter");
    expect(link.entryAnimation).toBe("fade-up");
    expect(link.businessNameAlign).toBe("center");
    expect(link.businessNameHtml).toBe(false);
    expect(link.hideBusinessName).toBe(false);
    expect(link.hideTagline).toBe(false);
    expect(link.isActive).toBe(true);
  });

  it("não lança erro com row totalmente vazio (exceto id)", () => {
    expect(() => rowToSmartLink({})).not.toThrow();
  });

  it("retorna array vazio para buttons quando JSONB é null", () => {
    const link = rowToSmartLink({ id: "x", slug: "x", buttons: null });
    expect(link.buttons).toEqual([]);
  });

  it("retorna array vazio para blocks quando JSONB é null", () => {
    const link = rowToSmartLink({ id: "x", slug: "x", blocks: null });
    expect(link.blocks).toEqual([]);
  });

  it("retorna array vazio para pages quando JSONB é null", () => {
    const link = rowToSmartLink({ id: "x", slug: "x", pages: null });
    expect(link.pages).toEqual([]);
  });

  it("retorna array vazio para badges quando JSONB é null", () => {
    const link = rowToSmartLink({ id: "x", slug: "x", badges: null });
    expect(link.badges).toEqual([]);
  });

  it("retorna array vazio para floatingEmojis quando JSONB é null", () => {
    const link = rowToSmartLink({ id: "x", slug: "x", floating_emojis: null });
    expect(link.floatingEmojis).toEqual([]);
  });

  it("usa viewCount e clickCount dos parâmetros opcionais", () => {
    const link = rowToSmartLink({ id: "x", slug: "x" }, 99, 55);
    expect(link.views).toBe(99);
    expect(link.clicks).toBe(55);
  });

  it("extrai bubblesEffect de bg_effects.bubbles", () => {
    const row = {
      id: "x",
      slug: "x",
      bg_effects: {
        bubbles: { enabled: true, intensity: 40, color: "#ff0000" },
      },
    };
    const link = rowToSmartLink(row);
    expect(link.bubblesEffect).toEqual({ enabled: true, intensity: 40, color: "#ff0000" });
    expect(link.firefliesEffect).toBeUndefined();
    expect(link.matrixEffect).toBeUndefined();
  });

  it("extrai snowEffect de snow_effect quando presente", () => {
    const row = {
      id: "x",
      slug: "x",
      snow_effect: { enabled: true, intensity: 30, color: "#ffffff" },
    };
    const link = rowToSmartLink(row);
    expect(link.snowEffect).toEqual({ enabled: true, intensity: 30, color: "#ffffff" });
  });

  it("mantém snowEffect como undefined quando snow_effect é null/undefined", () => {
    const link = rowToSmartLink({ id: "x", slug: "x", snow_effect: null });
    expect(link.snowEffect).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// smartLinkToRow
// ---------------------------------------------------------------------------
describe("smartLinkToRow", () => {
  const USER_ID = "user-abc-123";

  it("mapeia camelCase para snake_case corretamente", () => {
    const row = smartLinkToRow(FULL_SMART_LINK, USER_ID);

    expect(row.user_id).toBe(USER_ID);
    expect(row.slug).toBe(FULL_SMART_LINK.slug);
    expect(row.business_name).toBe(FULL_SMART_LINK.businessName);
    expect(row.tagline).toBe(FULL_SMART_LINK.tagline);
    expect(row.hero_image).toBe(FULL_SMART_LINK.heroImage);
    expect(row.logo_url).toBe(FULL_SMART_LINK.logoUrl);
    expect(row.background_color).toBe(FULL_SMART_LINK.backgroundColor);
    expect(row.text_color).toBe(FULL_SMART_LINK.textColor);
    expect(row.accent_color).toBe(FULL_SMART_LINK.accentColor);
    expect(row.font_family).toBe(FULL_SMART_LINK.fontFamily);
    expect(row.entry_animation).toBe(FULL_SMART_LINK.entryAnimation);
    expect(row.is_active).toBe(FULL_SMART_LINK.isActive);
  });

  it("converte undefined → null para campos opcionais que vão ao banco", () => {
    const minimalLink: SmartLink = {
      id: "min-id",
      slug: "minimal",
      businessName: "Minimal",
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

    const row = smartLinkToRow(minimalLink, USER_ID);

    expect(row.hero_image_height).toBeNull();
    expect(row.hero_image_opacity).toBeNull();
    expect(row.hero_overlay_opacity).toBeNull();
    expect(row.hero_overlay_color).toBeNull();
    expect(row.title_size).toBeNull();
    expect(row.business_name_font_size).toBeNull();
    expect(row.snow_effect).toBeNull();
    expect(row.bg_effects).toBeNull();
  });

  it("serializa snow_effect corretamente quando snowEffect está presente", () => {
    const row = smartLinkToRow(FULL_SMART_LINK, USER_ID);
    expect(row.snow_effect).toEqual(FULL_SMART_LINK.snowEffect);
  });

  it("serializa bg_effects como null quando nenhum efeito de fundo está presente", () => {
    const row = smartLinkToRow(FULL_SMART_LINK, USER_ID);
    // FULL_SMART_LINK não tem bubbles/fireflies/matrix/stars/bgHtml
    expect(row.bg_effects).toBeNull();
  });

  it("serializa bg_effects com todos os sub-campos quando bubblesEffect está presente", () => {
    const linkWithBubbles: SmartLink = {
      ...FULL_SMART_LINK,
      snowEffect: undefined,
      bubblesEffect: { enabled: true, intensity: 60, color: "#00ff00" },
    };
    const row = smartLinkToRow(linkWithBubbles, USER_ID);

    expect(row.bg_effects).not.toBeNull();
    expect(row.bg_effects?.bubbles).toEqual({ enabled: true, intensity: 60, color: "#00ff00" });
    expect(row.bg_effects?.fireflies).toBeNull();
    expect(row.bg_effects?.matrix).toBeNull();
    expect(row.bg_effects?.stars).toBeNull();
    expect(row.bg_effects?.bgHtml).toBeNull();
  });

  it("usa valor padrão 'center' para businessNameAlign quando não definido", () => {
    const link: SmartLink = { ...FULL_SMART_LINK, businessNameAlign: undefined };
    const row = smartLinkToRow(link, USER_ID);
    expect(row.business_name_align).toBe("center");
  });

  it("usa valor padrão 'fade-up' para entry_animation quando não definido", () => {
    const link: SmartLink = { ...FULL_SMART_LINK, entryAnimation: undefined };
    const row = smartLinkToRow(link, USER_ID);
    expect(row.entry_animation).toBe("fade-up");
  });
});

// ---------------------------------------------------------------------------
// Roundtrip: smartLinkToRow → rowToSmartLink preserva os campos
// ---------------------------------------------------------------------------
describe("roundtrip smartLinkToRow + rowToSmartLink", () => {
  it("preserva os campos essenciais de identidade e aparência", () => {
    const row = smartLinkToRow(FULL_SMART_LINK, "user-xyz");
    // Injetamos de volta o id e created_at (não persistidos por smartLinkToRow)
    const restored = rowToSmartLink(
      { ...row, id: FULL_SMART_LINK.id, created_at: FULL_SMART_LINK.createdAt },
      FULL_SMART_LINK.views,
      FULL_SMART_LINK.clicks,
    );

    expect(restored.id).toBe(FULL_SMART_LINK.id);
    expect(restored.slug).toBe(FULL_SMART_LINK.slug);
    expect(restored.businessName).toBe(FULL_SMART_LINK.businessName);
    expect(restored.tagline).toBe(FULL_SMART_LINK.tagline);
    expect(restored.heroImage).toBe(FULL_SMART_LINK.heroImage);
    expect(restored.logoUrl).toBe(FULL_SMART_LINK.logoUrl);
    expect(restored.logoSizePx).toBe(FULL_SMART_LINK.logoSizePx);
    expect(restored.logoShape).toBe(FULL_SMART_LINK.logoShape);
    expect(restored.logoShadow).toBe(FULL_SMART_LINK.logoShadow);
    expect(restored.backgroundColor).toBe(FULL_SMART_LINK.backgroundColor);
    expect(restored.textColor).toBe(FULL_SMART_LINK.textColor);
    expect(restored.accentColor).toBe(FULL_SMART_LINK.accentColor);
    expect(restored.fontFamily).toBe(FULL_SMART_LINK.fontFamily);
    expect(restored.entryAnimation).toBe(FULL_SMART_LINK.entryAnimation);
    expect(restored.businessNameAlign).toBe(FULL_SMART_LINK.businessNameAlign);
    expect(restored.hideTagline).toBe(FULL_SMART_LINK.hideTagline);
    expect(restored.isActive).toBe(FULL_SMART_LINK.isActive);
    expect(restored.createdAt).toBe(FULL_SMART_LINK.createdAt);
    expect(restored.views).toBe(FULL_SMART_LINK.views);
    expect(restored.clicks).toBe(FULL_SMART_LINK.clicks);
  });

  it("preserva arrays de buttons, badges, floatingEmojis e blocks", () => {
    const row = smartLinkToRow(FULL_SMART_LINK, "user-xyz");
    const restored = rowToSmartLink({ ...row, id: FULL_SMART_LINK.id, created_at: FULL_SMART_LINK.createdAt });

    expect(restored.buttons).toEqual(FULL_SMART_LINK.buttons);
    expect(restored.badges).toEqual(FULL_SMART_LINK.badges);
    expect(restored.floatingEmojis).toEqual(FULL_SMART_LINK.floatingEmojis);
    expect(restored.blocks).toEqual(FULL_SMART_LINK.blocks);
  });

  it("preserva snowEffect no roundtrip", () => {
    const row = smartLinkToRow(FULL_SMART_LINK, "user-xyz");
    const restored = rowToSmartLink({ ...row, id: FULL_SMART_LINK.id, created_at: FULL_SMART_LINK.createdAt });
    expect(restored.snowEffect).toEqual(FULL_SMART_LINK.snowEffect);
  });

  it("preserva heroImageOpacity e heroOverlayOpacity no roundtrip", () => {
    const row = smartLinkToRow(FULL_SMART_LINK, "user-xyz");
    const restored = rowToSmartLink({ ...row, id: FULL_SMART_LINK.id, created_at: FULL_SMART_LINK.createdAt });
    expect(restored.heroImageOpacity).toBe(FULL_SMART_LINK.heroImageOpacity);
    expect(restored.heroOverlayOpacity).toBe(FULL_SMART_LINK.heroOverlayOpacity);
    expect(restored.heroOverlayColor).toBe(FULL_SMART_LINK.heroOverlayColor);
  });
});
