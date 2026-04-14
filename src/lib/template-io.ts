import { SmartLink } from "@/types/smart-link";

// ─── Runtime-only fields stripped on export ─────────────────────────────────
const RUNTIME_FIELDS: (keyof SmartLink)[] = [
  "id", "slug", "views", "clicks", "isActive", "createdAt",
  "customDomain", "ownerPlan",
];

export interface TemplateExport {
  exportVersion: "1.0";
  exportedAt: string;
  linkproVersion: "2.0";
  template: Partial<SmartLink>;
}

// ─── Export ──────────────────────────────────────────────────────────────────

export function exportTemplateAsJson(link: SmartLink): string {
  const template: Partial<SmartLink> = { ...link };
  for (const field of RUNTIME_FIELDS) {
    delete template[field];
  }

  const payload: TemplateExport = {
    exportVersion: "1.0",
    exportedAt: new Date().toISOString(),
    linkproVersion: "2.0",
    template,
  };

  return JSON.stringify(payload, null, 2);
}

export function downloadTemplateJson(link: SmartLink): void {
  const json = exportTemplateAsJson(link);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (link.businessName || "meu-template")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  a.href = url;
  a.download = `${safeName}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Import ──────────────────────────────────────────────────────────────────

export interface ImportResult {
  ok: true;
  data: TemplateExport;
}
export interface ImportError {
  ok: false;
  error: string;
}

export function importTemplateFromJson(json: string): ImportResult | ImportError {
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "Arquivo inválido: não é um objeto JSON válido." };
    }
    if (parsed.exportVersion !== "1.0") {
      return { ok: false, error: "Versão do template não suportada." };
    }
    const tpl = parsed.template;
    if (!tpl || typeof tpl !== "object") {
      return { ok: false, error: "Arquivo não contém dados de template." };
    }
    if (typeof tpl.backgroundColor !== "string") {
      return { ok: false, error: "Template inválido: campo 'backgroundColor' ausente." };
    }
    if (!Array.isArray(tpl.buttons)) {
      return { ok: false, error: "Template inválido: campo 'buttons' ausente." };
    }
    return { ok: true, data: parsed as TemplateExport };
  } catch {
    return { ok: false, error: "Arquivo inválido: não foi possível interpretar o JSON." };
  }
}

// ─── Session storage helpers (used to pass imported template to editor) ───────

const SESSION_KEY = "linkpro-imported-template";

export function storeImportedTemplate(data: TemplateExport): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function popImportedTemplate(): TemplateExport | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(SESSION_KEY);
  try {
    return JSON.parse(raw) as TemplateExport;
  } catch {
    return null;
  }
}
