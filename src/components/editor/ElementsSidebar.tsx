import {
  MousePointerClick, Type, Award, Minus, MessageSquare, Image,
  Heading, Space, Video, Timer, HelpCircle, Images, ImagePlus,
  Star, BarChart3, ShoppingBag, Mail, Music, MapPin, GalleryHorizontal,
  Megaphone, Search, Code, Zap, Calendar, Instagram, Youtube, Phone, Send
} from "lucide-react";
import { BlockType } from "@/types/smart-link";
import { useState } from "react";

interface ElementsSidebarProps {
  onAddBlock: (type: BlockType, defaults?: Record<string, unknown>) => void;
}

const categories = [
  {
    label: "Botões Animados",
    color: "text-pink-400",
    items: [
      { type: "animated-button" as BlockType, label: "WhatsApp", icon: Zap, defaults: { animStyle: 'whatsapp', content: 'Chama no WhatsApp', animSubtitle: 'Atendimento rápido', animButtonLabel: 'Falar no WhatsApp', animUrl: '' } },
      { type: "animated-button" as BlockType, label: "Localização", icon: MapPin, defaults: { animStyle: 'location', content: 'Nossa Localização', animSubtitle: 'Saiba como nos encontrar', animButtonLabel: 'Abrir Google Maps', animUrl: '' } },
      { type: "animated-button" as BlockType, label: "Agendamento", icon: Calendar, defaults: { animStyle: 'schedule', content: 'Agende sua consulta', animSubtitle: 'Horários disponíveis online', animButtonLabel: 'Agendar agora', animUrl: '' } },
      { type: "animated-button" as BlockType, label: "CTA Animado", icon: Megaphone, defaults: { animStyle: 'cta', content: 'Saiba Mais', animSubtitle: '', animButtonLabel: 'Clique aqui', animUrl: '' } },
      { type: "animated-button" as BlockType, label: "Instagram", icon: Instagram, defaults: { animStyle: 'instagram', content: 'Siga no Instagram', animSubtitle: 'Conteúdo novo toda semana', animButtonLabel: 'Ver perfil', animUrl: '' } },
      { type: "animated-button" as BlockType, label: "TikTok", icon: Music, defaults: { animStyle: 'tiktok', content: 'Me siga no TikTok', animSubtitle: 'Vídeos novos toda semana', animButtonLabel: 'Ver vídeos', animUrl: '' } },
      { type: "animated-button" as BlockType, label: "YouTube", icon: Youtube, defaults: { animStyle: 'youtube', content: 'Inscreva-se no Canal', animSubtitle: 'Novos vídeos toda semana', animButtonLabel: 'Assistir agora', animUrl: '' } },
      { type: "animated-button" as BlockType, label: "Telefone", icon: Phone, defaults: { animStyle: 'phone', content: 'Ligue para nós', animSubtitle: 'Atendimento direto', animButtonLabel: 'Ligar agora', animUrl: '' } },
      { type: "animated-button" as BlockType, label: "E-mail", icon: Mail, defaults: { animStyle: 'email', content: 'Entre em Contato', animSubtitle: 'Respondemos em até 24h', animButtonLabel: 'Enviar mensagem', animUrl: '' } },
      { type: "animated-button" as BlockType, label: "Telegram", icon: Send, defaults: { animStyle: 'telegram', content: 'Canal no Telegram', animSubtitle: 'Novidades em primeira mão', animButtonLabel: 'Entrar no canal', animUrl: '' } },
    ],
  },
  {
    label: "Links",
    color: "text-blue-400",
    items: [
      { type: "button" as BlockType, label: "Botão Visual", icon: MousePointerClick },
      { type: "image-button" as BlockType, label: "Botão Imagem", icon: ImagePlus },
    ],
  },
  {
    label: "Conteúdo",
    color: "text-purple-400",
    items: [
      { type: "header" as BlockType, label: "Título", icon: Heading },
      { type: "text" as BlockType, label: "Texto", icon: Type },
      { type: "image" as BlockType, label: "Imagem", icon: Image },
      { type: "video" as BlockType, label: "Vídeo", icon: Video },
      { type: "gallery" as BlockType, label: "Galeria", icon: Images },
      { type: "carousel" as BlockType, label: "Carrossel", icon: GalleryHorizontal },
      { type: "html" as BlockType, label: "HTML Livre", icon: Code },
    ],
  },
  {
    label: "Conversão",
    color: "text-green-400",
    items: [
      { type: "cta" as BlockType, label: "CTA", icon: MessageSquare },
      { type: "countdown" as BlockType, label: "Countdown", icon: Timer },
      { type: "testimonial" as BlockType, label: "Depoimento", icon: Star },
      { type: "stats" as BlockType, label: "Números/Stats", icon: BarChart3 },
      { type: "product" as BlockType, label: "Produto", icon: ShoppingBag },
      { type: "email-capture" as BlockType, label: "Captura Email", icon: Mail },
      { type: "banner" as BlockType, label: "Banner Promo", icon: Megaphone },
    ],
  },
  {
    label: "Mídia & Social",
    color: "text-orange-400",
    items: [
      { type: "spotify" as BlockType, label: "Spotify", icon: Music },
      { type: "map" as BlockType, label: "Mapa", icon: MapPin },
      { type: "faq" as BlockType, label: "FAQ", icon: HelpCircle },
      { type: "badges" as BlockType, label: "Badges", icon: Award },
    ],
  },
  {
    label: "Layout",
    color: "text-gray-400",
    items: [
      { type: "spacer" as BlockType, label: "Espaçador", icon: Space },
      { type: "separator" as BlockType, label: "Separador", icon: Minus },
    ],
  },
];

export function ElementsSidebar({ onAddBlock }: ElementsSidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? categories.map(cat => ({
        ...cat,
        items: cat.items.filter(el =>
          el.label.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cat => cat.items.length > 0)
    : categories;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar elemento..."
          className="w-full h-8 pl-8 pr-3 text-xs bg-secondary border border-border rounded-lg outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground transition-colors"
        />
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {filtered.map((cat, ci) => (
          <div key={cat.label}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${cat.color}`}>
              {cat.label}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {cat.items.map((el, i) => (
                <button
                  key={el.type}
                  type="button"
                  onClick={() => onAddBlock(el.type, (el as any).defaults)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/40 hover:bg-secondary hover:scale-[1.02] hover:-translate-y-px active:scale-[0.98] transition-transform duration-150 group text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                    <el.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-[11px] font-medium text-foreground leading-tight">{el.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
