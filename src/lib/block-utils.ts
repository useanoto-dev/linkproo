import { BlockType, LinkBlock, StatItem } from "@/types/smart-link";

export function createBlockDefaults(
  type: BlockType,
  order: number = 0,
  extraDefaults?: Record<string, unknown>
): LinkBlock {
  const id = `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const base: LinkBlock = { id, type, order, content: "", subtitle: "" };

  const typeDefaults: Partial<LinkBlock> = (() => {
    switch (type) {
      case "spacer": return { height: 24 };
      case "image": return { borderRadius: 12 };
      case "video": return { videoUrl: "" };
      case "badges": return { badges: [] };
      case "testimonial": return { testimonialRating: 5 };
      case "stats": return {
        statItems: [
          { id: `stat-${Date.now()}-1`, value: "10k", label: "Clientes" },
          { id: `stat-${Date.now()}-2`, value: "4.9★", label: "Avaliação" },
          { id: `stat-${Date.now()}-3`, value: "100%", label: "Satisfação" },
        ] as StatItem[],
      };
      case "email-capture": return { emailPlaceholder: "seu@email.com", emailButtonLabel: "Quero receber!" };
      case "spotify": return { spotifyCompact: false };
      case "map": return { mapHeight: 220 };
      case "carousel": return { carouselSlides: [], carouselAutoplay: true };
      case "banner": return { bannerBg: "#6366f1" };
      case "animated-button": return {
        animStyle: "whatsapp",
        content: "Chama no WhatsApp",
        animSubtitle: "Atendimento rápido pelo chat",
        animButtonLabel: "Falar no WhatsApp",
        animUrl: "",
      };
      case "product": return { productButtonLabel: "Comprar agora" };
      case "faq": return { faqItems: [] };
      case "gallery": return { galleryImages: [] };
      default: return {};
    }
  })();

  return { ...base, ...typeDefaults, ...(extraDefaults || {}) };
}
