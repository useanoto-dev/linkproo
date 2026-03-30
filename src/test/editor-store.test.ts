import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore, serializeLink } from "@/stores/editor-store";
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

beforeEach(() => {
  useEditorStore.getState().resetLink(BASE);
});

describe("serializeLink", () => {
  it("exclui views, clicks e createdAt da serialização", () => {
    const json = serializeLink({ ...BASE, views: 999, clicks: 888 });
    const parsed = JSON.parse(json);
    expect(parsed).not.toHaveProperty("views");
    expect(parsed).not.toHaveProperty("clicks");
    expect(parsed).not.toHaveProperty("createdAt");
    expect(parsed).toHaveProperty("businessName", "Empresa");
  });

  it("produz saída idêntica para mesmos dados", () => {
    expect(serializeLink(BASE)).toBe(serializeLink({ ...BASE }));
  });

  it("produz saída diferente quando campo relevante muda", () => {
    const a = serializeLink(BASE);
    const b = serializeLink({ ...BASE, businessName: "Outro" });
    expect(a).not.toBe(b);
  });
});

describe("setLink com skipHistory=true", () => {
  it("não empurra para o histórico (past continua vazio)", () => {
    useEditorStore.getState().setLink({ ...BASE, businessName: "Skip" }, true);
    expect(useEditorStore.getState().past).toHaveLength(0);
    expect(useEditorStore.getState().canUndo).toBe(false);
    expect(useEditorStore.getState().link.businessName).toBe("Skip");
  });

  it("preserva o future existente", () => {
    // Cria um future: setLink normal → undo
    useEditorStore.getState().setLink({ ...BASE, businessName: "V2" });
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().future).toHaveLength(1);

    // skipHistory=true não deve limpar o future
    useEditorStore.getState().setLink({ ...BASE, businessName: "SkipFuture" }, true);
    expect(useEditorStore.getState().future).toHaveLength(1);
  });
});

describe("updateLink", () => {
  it("faz merge de updates parciais preservando outros campos", () => {
    useEditorStore.getState().updateLink({ tagline: "Nova tagline" });
    expect(useEditorStore.getState().link.tagline).toBe("Nova tagline");
    expect(useEditorStore.getState().link.businessName).toBe("Empresa");
  });

  it("empurra para o histórico (canUndo fica true)", () => {
    useEditorStore.getState().updateLink({ businessName: "Updated" });
    expect(useEditorStore.getState().canUndo).toBe(true);
    expect(useEditorStore.getState().past).toHaveLength(1);
  });
});

describe("updatePreviewLink", () => {
  it("atualiza previewLink sem afetar link principal", () => {
    const preview = { ...BASE, businessName: "Preview Only" };
    useEditorStore.getState().updatePreviewLink(preview);
    expect(useEditorStore.getState().previewLink.businessName).toBe("Preview Only");
    expect(useEditorStore.getState().link.businessName).toBe("Empresa");
  });
});

describe("setUI", () => {
  it("atualiza campo único sem sobrescrever os outros", () => {
    useEditorStore.getState().setUI({ openDrawer: "elements" });
    const ui = useEditorStore.getState().ui;
    expect(ui.openDrawer).toBe("elements");
    expect(ui.showPreview).toBe(true);    // default preservado
    expect(ui.device).toBe("iphone15");  // default preservado
  });

  it("atualiza múltiplos campos ao mesmo tempo", () => {
    useEditorStore.getState().setUI({ showPreview: false, showShortcuts: true });
    const ui = useEditorStore.getState().ui;
    expect(ui.showPreview).toBe(false);
    expect(ui.showShortcuts).toBe(true);
  });

  it("não afeta o histórico", () => {
    useEditorStore.getState().setUI({ openDrawer: "theme" });
    expect(useEditorStore.getState().canUndo).toBe(false);
  });
});

describe("mutações de autosave", () => {
  it("setAutosaveStatus atualiza o status", () => {
    useEditorStore.getState().setAutosaveStatus("saving");
    expect(useEditorStore.getState().autosave.status).toBe("saving");
  });

  it("setAutosaveSavedAt atualiza savedAt", () => {
    const now = new Date("2026-03-29T12:00:00Z");
    useEditorStore.getState().setAutosaveSavedAt(now);
    expect(useEditorStore.getState().autosave.savedAt).toEqual(now);
  });

  it("initAutosaveSnapshot serializa o link excluindo campos voláteis", () => {
    useEditorStore.getState().initAutosaveSnapshot(BASE);
    const snap = useEditorStore.getState().autosave.lastSavedSnapshot;
    expect(snap).toBe(serializeLink(BASE));
    expect(snap).not.toContain('"views"');
    expect(snap).not.toContain('"clicks"');
  });

  it("setAutosaveEnabled alterna a flag enabled", () => {
    expect(useEditorStore.getState().autosave.enabled).toBe(false); // default
    useEditorStore.getState().setAutosaveEnabled(true);
    expect(useEditorStore.getState().autosave.enabled).toBe(true);
    useEditorStore.getState().setAutosaveEnabled(false);
    expect(useEditorStore.getState().autosave.enabled).toBe(false);
  });

  it("mutações de autosave não afetam link nem histórico", () => {
    useEditorStore.getState().setAutosaveStatus("saved");
    useEditorStore.getState().setAutosaveEnabled(true);
    expect(useEditorStore.getState().link).toEqual(BASE);
    expect(useEditorStore.getState().canUndo).toBe(false);
  });
});
