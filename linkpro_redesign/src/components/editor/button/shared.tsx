import { LinkType } from "@/types/smart-link";
import { brandIcons, brandColors } from "@/data/brand-icons";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

// ── BrandIcon ────────────────────────────────────────────────────────────────

export function BrandIcon({
  type,
  size = 16,
  className = "",
}: {
  type: string;
  size?: number;
  className?: string;
}) {
  const svg = brandIcons[type];
  if (!svg) return null;
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size, color: brandColors[type] || "currentColor" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// ── Link type metadata ───────────────────────────────────────────────────────

export const linkTypeOptions: {
  value: LinkType;
  label: string;
  placeholder: string;
  prefix: string;
  helper: string;
}[] = [
  { value: "whatsapp", label: "WhatsApp", placeholder: "5511999999999", prefix: "https://wa.me/", helper: "Digite apenas o número com DDD e código do país (ex: 5511999999999)" },
  { value: "instagram", label: "Instagram", placeholder: "seu.usuario", prefix: "https://instagram.com/", helper: "Digite apenas seu @ (sem o @)" },
  { value: "tiktok", label: "TikTok", placeholder: "seu.usuario", prefix: "https://tiktok.com/@", helper: "Digite apenas seu usuário (sem o @)" },
  { value: "youtube", label: "YouTube", placeholder: "seu-canal", prefix: "https://youtube.com/@", helper: "Digite o nome do seu canal" },
  { value: "telegram", label: "Telegram", placeholder: "seu_usuario", prefix: "https://t.me/", helper: "Digite seu usuário do Telegram" },
  { value: "email", label: "E-mail", placeholder: "seu@email.com", prefix: "mailto:", helper: "Digite seu endereço de e-mail" },
  { value: "phone", label: "Telefone", placeholder: "5511999999999", prefix: "tel:+", helper: "Digite o número com DDD e código do país" },
  { value: "external", label: "Link externo", placeholder: "https://seusite.com", prefix: "", helper: "Cole o link completo" },
  { value: "page", label: "Sub-página", placeholder: "", prefix: "", helper: "Abre uma sub-página interna ao clicar" },
];

// ── URL generator ────────────────────────────────────────────────────────────

export function generateUrl(type: LinkType, value: string, whatsappMessage?: string): string {
  if (type === "external") return value;
  const opt = linkTypeOptions.find((o) => o.value === type);
  if (!opt) return value;
  const clean = value.replace(/^[@+\s]+/, "").trim();
  if (type === "whatsapp") {
    const number = clean.replace(/\D/g, "");
    const base = opt.prefix + number;
    return whatsappMessage?.trim()
      ? `${base}?text=${encodeURIComponent(whatsappMessage.trim())}`
      : base;
  }
  if (type === "phone") {
    return opt.prefix + clean.replace(/\D/g, "");
  }
  return opt.prefix + clean;
}

// ── Gradient presets ─────────────────────────────────────────────────────────

export const gradientOptions = [
  { label: "Azul", value: "from-blue-600 to-blue-800", css: "linear-gradient(135deg, #2563eb, #1e40af)" },
  { label: "Verde", value: "from-green-600 to-green-800", css: "linear-gradient(135deg, #16a34a, #166534)" },
  { label: "Vermelho", value: "from-red-600 to-red-800", css: "linear-gradient(135deg, #dc2626, #991b1b)" },
  { label: "Laranja", value: "from-orange-500 to-orange-700", css: "linear-gradient(135deg, #f97316, #c2410c)" },
  { label: "Roxo", value: "from-purple-600 to-purple-800", css: "linear-gradient(135deg, #9333ea, #6b21a8)" },
  { label: "Rosa", value: "from-pink-500 to-pink-700", css: "linear-gradient(135deg, #ec4899, #be185d)" },
  { label: "Amarelo", value: "from-yellow-500 to-amber-600", css: "linear-gradient(135deg, #eab308, #d97706)" },
  { label: "Ciano", value: "from-cyan-500 to-teal-700", css: "linear-gradient(135deg, #06b6d4, #0f766e)" },
  { label: "Índigo", value: "from-indigo-500 to-indigo-800", css: "linear-gradient(135deg, #6366f1, #3730a3)" },
  { label: "Esmeralda", value: "from-emerald-500 to-emerald-800", css: "linear-gradient(135deg, #10b981, #065f46)" },
];

// ── Option constants ─────────────────────────────────────────────────────────

export const BUTTON_STYLE_OPTIONS = [
  { value: "card", label: "Card", desc: "Grande" },
  { value: "pill", label: "Pílula", desc: "Compacto" },
  { value: "outline", label: "Borda", desc: "Contorno" },
  { value: "glass", label: "Vidro", desc: "Glass" },
  { value: "minimal", label: "Mínimo", desc: "Texto" },
  { value: "flat", label: "Flat", desc: "Sólido" },
  { value: "neubrutalism", label: "Bold", desc: "Brutalism" },
  { value: "soft", label: "Soft", desc: "Suave" },
] as const;

export const BUTTON_ALIGN_OPTIONS = [
  { value: "left" as const, icon: AlignLeft, label: "Esquerda" },
  { value: "center" as const, icon: AlignCenter, label: "Centro" },
  { value: "right" as const, icon: AlignRight, label: "Direita" },
] as const;

export const BUTTON_COLOR_MODE_OPTIONS = [
  { value: "preset" as const, label: "Predefinida" },
  { value: "solid" as const, label: "Cor sólida" },
  { value: "gradient" as const, label: "Gradiente" },
] as const;

// ── ColorState type ──────────────────────────────────────────────────────────

export interface ColorState {
  mode: "solid" | "gradient" | "preset";
  solidColor: string;
  customFrom: string;
  customTo: string;
}
