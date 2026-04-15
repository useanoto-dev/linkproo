import { BlockType, LinkBlock, StatItem, ContactItem } from "@/types/smart-link";

export function createBlockDefaults(
  type: BlockType,
  order: number = 0,
  extraDefaults?: Record<string, unknown>
): LinkBlock {
  const id = crypto.randomUUID();
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
          { id: crypto.randomUUID(), value: "10k", label: "Clientes" },
          { id: crypto.randomUUID(), value: "4.9★", label: "Avaliação" },
          { id: crypto.randomUUID(), value: "100%", label: "Satisfação" },
        ] as StatItem[],
      };
      case "email-capture": return { emailPlaceholder: "seu@email.com", emailButtonLabel: "Quero receber!" };
      case "spotify": return { spotifyCompact: false };
      case "map": return { mapHeight: 220 };
      case "carousel": return { carouselSlides: [], carouselAutoplay: true };
      case "banner": return { bannerBg: "#6366f1", bannerTag: "🔥 OFERTA", content: "Promoção Especial", subtitle: "Aproveite agora!" };
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
      case "contacts": return {
        contactsMode: 1,
        contactsList: [
          {
            id: crypto.randomUUID(),
            name: "Nome do Contato",
            role: "Cargo / Função",
            photo: "",
            whatsappNumber: "",
            whatsappMessage: "Olá! Vim pelo seu link.",
          } as ContactItem,
        ],
      };
      default: return {};
    }
  })();

  return { ...base, ...typeDefaults, ...(extraDefaults || {}) };
}
