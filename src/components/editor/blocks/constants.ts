import { BlockType } from "@/types/smart-link";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

// ─── Module-level constants (never re-created on render) ──────────────────────

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero",
  info: "Informações",
  button: "Botão",
  "image-button": "Botão Imagem",
  badges: "Badges",
  text: "Texto",
  separator: "Separador",
  cta: "CTA",
  image: "Imagem",
  header: "Título",
  spacer: "Espaçador",
  video: "Vídeo",
  countdown: "Countdown",
  faq: "FAQ",
  gallery: "Galeria",
  testimonial: "Depoimento",
  stats: "Números/Stats",
  product: "Produto",
  "email-capture": "Captura Email",
  spotify: "Spotify",
  map: "Mapa",
  carousel: "Carrossel",
  banner: "Banner Promo",
  html: "HTML Customizado",
  "animated-button": "Botão Animado",
  contacts: "Contatos",
};

export const ANIM_STYLE_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp', color: 'bg-green-700' },
  { value: 'location', label: 'Localização', color: 'bg-blue-900' },
  { value: 'schedule', label: 'Agendamento', color: 'bg-blue-200 !text-blue-900' },
  { value: 'cta', label: 'CTA Custom', color: 'bg-purple-700' },
  { value: 'instagram', label: 'Instagram', color: 'bg-pink-600' },
  { value: 'tiktok', label: 'TikTok', color: 'bg-gray-900' },
  { value: 'youtube', label: 'YouTube', color: 'bg-red-600' },
  { value: 'phone', label: 'Telefone', color: 'bg-blue-700' },
  { value: 'email', label: 'E-mail', color: 'bg-teal-700' },
  { value: 'telegram', label: 'Telegram', color: 'bg-sky-600' },
] as const;

export const BUSINESS_NAME_SIZE_OPTIONS = [
  { label: 'XS', size: 14 },
  { label: 'S',  size: 18 },
  { label: 'M',  size: 24 },
  { label: 'G',  size: 32 },
  { label: 'XG', size: 42 },
];

export const BUSINESS_NAME_ALIGN_OPTIONS = [
  { value: "left" as const, Icon: AlignLeft },
  { value: "center" as const, Icon: AlignCenter },
  { value: "right" as const, Icon: AlignRight },
] as const;
