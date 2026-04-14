/**
 * Premium template collection for LinkPro.
 * Each template has a unique visual identity — different palette, typography,
 * button style, and composition. Zero emoji-as-icon.
 */
import type { LinkTemplate } from "./templates";

export const premiumCategories = [
  { id: "premium", label: "Premium", emoji: "✦", description: "Templates profissionais com design único", color: "bg-gradient-to-r from-violet-600 to-indigo-600" },
];

export const premiumTemplates: LinkTemplate[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. MONO — Ultra-minimal noir
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-mono",
    category: "premium",
    categoryEmoji: "✦",
    name: "Mono",
    description: "Ultra-minimalista. Fundo escuro, tipografia limpa, sem distrações.",
    template: {
      slug: "",
      businessName: "Studio Noir",
      tagline: "Design & Direção Criativa",
      heroImage: "",
      logoUrl: "",
      backgroundColor: "custom:#0A0A0A",
      textColor: "text-white",
      accentColor: "#FAFAFA",
      fontFamily: "Space Grotesk",
      businessNameFontSize: 28,
      taglineFontSize: 13,
      businessNameAlign: "center",
      headerStyle: "classic",
      hideBusinessName: false,
      hideTagline: false,
      entryAnimation: "fade-up",
      buttons: [
        {
          id: "m1", label: "Portfolio", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#FAFAFA:#FAFAFA",
          linkType: "external", linkValue: "",
          buttonStyle: "minimal" as const, titleSize: 14,
        },
        {
          id: "m2", label: "Serviços", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#FAFAFA:#FAFAFA",
          linkType: "external", linkValue: "",
          buttonStyle: "minimal" as const, titleSize: 14,
        },
        {
          id: "m3", label: "Contato", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#FAFAFA:#FAFAFA",
          linkType: "email", linkValue: "",
          buttonStyle: "minimal" as const, titleSize: 14,
        },
        {
          id: "m4", label: "Instagram", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#FAFAFA:#FAFAFA",
          linkType: "instagram", linkValue: "",
          buttonStyle: "minimal" as const, titleSize: 14,
        },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "mb1", type: "separator", order: 0 },
        { id: "mb2", type: "text", order: 1, content: "Transformamos marcas em experiências.", blockTextColor: "#737373", blockTextAlign: "center" },
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PAPER — Editorial cream com serif
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-paper",
    category: "premium",
    categoryEmoji: "✦",
    name: "Paper",
    description: "Editorial e elegante. Tipografia serif, fundo creme, estilo revista.",
    template: {
      slug: "",
      businessName: "Ana Beatriz",
      tagline: "Escritora & Mentora de Criatividade",
      heroImage: "",
      logoUrl: "",
      backgroundColor: "custom:#FEFCF6",
      textColor: "text-gray-900",
      accentColor: "#5B7C5E",
      fontFamily: "Cormorant Garamond",
      businessNameFontSize: 32,
      taglineFontSize: 14,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#1A1A18",
      taglineColor: "#6B6960",
      entryAnimation: "fade-up",
      buttons: [
        {
          id: "p1", label: "Meu Livro Mais Recente", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#5B7C5E:#5B7C5E",
          linkType: "external", linkValue: "",
          buttonStyle: "outline" as const, titleSize: 14,
        },
        {
          id: "p2", label: "Newsletter Semanal", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#5B7C5E:#5B7C5E",
          linkType: "external", linkValue: "",
          buttonStyle: "outline" as const, titleSize: 14,
        },
        {
          id: "p3", label: "Mentoria Individual", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#5B7C5E:#5B7C5E",
          linkType: "whatsapp", linkValue: "",
          buttonStyle: "outline" as const, titleSize: 14,
        },
        {
          id: "p4", label: "Sobre Mim", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#5B7C5E:#5B7C5E",
          linkType: "external", linkValue: "",
          buttonStyle: "outline" as const, titleSize: 14,
        },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "pb1", type: "separator", order: 0 },
        { id: "pb2", type: "text", order: 1, content: "\"A escrita é a forma mais generosa de existir.\"", blockTextColor: "#6B6960", blockTextAlign: "center" },
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. BISTRO — Gastronomia com paleta terracotta
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-bistro",
    category: "premium",
    categoryEmoji: "✦",
    name: "Bistro",
    description: "Elegante e quente. Perfeito para restaurantes, chefs e bistrôs.",
    template: {
      slug: "",
      businessName: "Osteria del Porto",
      tagline: "Cozinha italiana autoral · Est. 2019",
      heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=75",
      heroImageHeightPx: 220,
      heroOverlayOpacity: 40,
      heroOverlayColor: "dark",
      logoUrl: "",
      backgroundColor: "custom:#FAF7F2",
      textColor: "text-gray-900",
      accentColor: "#C45D3E",
      fontFamily: "DM Serif Display",
      businessNameFontSize: 26,
      taglineFontSize: 12,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#2C2418",
      taglineColor: "#8C7E6A",
      entryAnimation: "fade-up",
      buttons: [
        {
          id: "b1", label: "Ver Cardápio", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#C45D3E:#C45D3E",
          linkType: "external", linkValue: "",
          buttonStyle: "flat" as const, titleSize: 14,
        },
        {
          id: "b2", label: "Reservar Mesa", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#C45D3E:#C45D3E",
          linkType: "whatsapp", linkValue: "",
          buttonStyle: "outline" as const, titleSize: 14,
        },
        {
          id: "b3", label: "Delivery", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#C45D3E:#C45D3E",
          linkType: "whatsapp", linkValue: "",
          buttonStyle: "soft" as const, titleSize: 14,
        },
        {
          id: "b4", label: "Nossa Localização", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#C45D3E:#C45D3E",
          linkType: "external", linkValue: "",
          buttonStyle: "minimal" as const, titleSize: 14,
        },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "bb1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "4.9", label: "Avaliação" },
          { id: "s2", value: "6", label: "Anos" },
          { id: "s3", value: "200+", label: "Pratos" },
        ]},
        { id: "bb2", type: "separator", order: 1 },
        { id: "bb3", type: "text", order: 2, content: "Aberto de terça a domingo, das 18h às 23h.", blockTextColor: "#8C7E6A", blockTextAlign: "center" },
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. CLINICAL — Saúde com paleta ocean
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-clinical",
    category: "premium",
    categoryEmoji: "✦",
    name: "Clinical",
    description: "Profissional e confiável. Para médicos, dentistas e clínicas.",
    template: {
      slug: "",
      businessName: "Dra. Camila Lopes",
      tagline: "Dermatologista · CRM 48.291",
      heroImage: "",
      logoUrl: "",
      backgroundColor: "custom:#F0F7FA",
      textColor: "text-gray-900",
      accentColor: "#0891B2",
      fontFamily: "Plus Jakarta Sans",
      businessNameFontSize: 24,
      taglineFontSize: 12,
      businessNameAlign: "center",
      headerStyle: "bio",
      titleColor: "#0C2D3E",
      taglineColor: "#5A7B8F",
      entryAnimation: "fade-up",
      buttons: [
        {
          id: "c1", label: "Agendar Consulta", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#0891B2:#0891B2",
          linkType: "whatsapp", linkValue: "",
          buttonStyle: "flat" as const, titleSize: 14,
        },
        {
          id: "c2", label: "Especialidades", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#0891B2:#0891B2",
          linkType: "external", linkValue: "",
          buttonStyle: "soft" as const, titleSize: 14,
        },
        {
          id: "c3", label: "Resultados de Exames", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#0891B2:#0891B2",
          linkType: "external", linkValue: "",
          buttonStyle: "soft" as const, titleSize: 14,
        },
        {
          id: "c4", label: "Como Chegar", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#0891B2:#0891B2",
          linkType: "external", linkValue: "",
          buttonStyle: "minimal" as const, titleSize: 14,
        },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "cb1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "12+", label: "Anos de experiência" },
          { id: "s2", value: "5.000+", label: "Pacientes" },
          { id: "s3", value: "98%", label: "Satisfação" },
        ]},
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. NEO — Neubrutalism para creators
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-neo",
    category: "premium",
    categoryEmoji: "✦",
    name: "Neo",
    description: "Bold e chamativo. Neubrutalism para creators e artistas digitais.",
    template: {
      slug: "",
      businessName: "LUCAS.DEV",
      tagline: "Full-stack developer & content creator",
      heroImage: "",
      logoUrl: "",
      backgroundColor: "custom:#FEF08A",
      textColor: "text-gray-900",
      accentColor: "#000000",
      fontFamily: "Space Grotesk",
      businessNameFontSize: 30,
      taglineFontSize: 13,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#000000",
      taglineColor: "#44403C",
      entryAnimation: "bounce",
      buttons: [
        {
          id: "n1", label: "YouTube", subtitle: "120k inscritos", url: "", icon: "",
          gradientColor: "custom:#EF4444:#EF4444",
          linkType: "youtube", linkValue: "",
          buttonStyle: "neubrutalism" as const, titleSize: 14,
        },
        {
          id: "n2", label: "GitHub", subtitle: "Open source", url: "", icon: "",
          gradientColor: "custom:#1F2937:#1F2937",
          linkType: "external", linkValue: "",
          buttonStyle: "neubrutalism" as const, titleSize: 14,
        },
        {
          id: "n3", label: "Curso de React", subtitle: "Novo!", url: "", icon: "",
          gradientColor: "custom:#3B82F6:#3B82F6",
          linkType: "external", linkValue: "",
          buttonStyle: "neubrutalism" as const, titleSize: 14,
          badgeLabel: "NEW", badgeColor: "#EF4444",
        },
        {
          id: "n4", label: "Twitter/X", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#000000:#000000",
          linkType: "external", linkValue: "",
          buttonStyle: "neubrutalism" as const, titleSize: 14,
        },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. GLOW — Beleza & estética com paleta blush
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-glow",
    category: "premium",
    categoryEmoji: "✦",
    name: "Glow",
    description: "Feminino e luxuoso. Para salões, clínicas estéticas e makeup artists.",
    template: {
      slug: "",
      businessName: "Atelier Beleza",
      tagline: "Estética avançada & bem-estar",
      heroImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=75",
      heroImageHeightPx: 200,
      heroOverlayOpacity: 25,
      heroOverlayColor: "light",
      logoUrl: "",
      backgroundColor: "custom:#FDF2F5",
      textColor: "text-gray-900",
      accentColor: "#DB2777",
      fontFamily: "Playfair Display",
      businessNameFontSize: 26,
      taglineFontSize: 12,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#2D1318",
      taglineColor: "#9E6B78",
      entryAnimation: "fade-up",
      buttons: [
        {
          id: "g1", label: "Agendar Horário", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#DB2777:#DB2777",
          linkType: "whatsapp", linkValue: "",
          buttonStyle: "flat" as const, titleSize: 14, buttonBorderRadius: 24,
        },
        {
          id: "g2", label: "Tratamentos", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#DB2777:#DB2777",
          linkType: "external", linkValue: "",
          buttonStyle: "soft" as const, titleSize: 14, buttonBorderRadius: 24,
        },
        {
          id: "g3", label: "Antes & Depois", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#DB2777:#DB2777",
          linkType: "instagram", linkValue: "",
          buttonStyle: "soft" as const, titleSize: 14, buttonBorderRadius: 24,
        },
        {
          id: "g4", label: "Promoções do Mês", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#DB2777:#DB2777",
          linkType: "external", linkValue: "",
          buttonStyle: "outline" as const, titleSize: 14, buttonBorderRadius: 24,
        },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "gb1", type: "testimonial", order: 0, content: "Melhor experiência que já tive. Profissionais incríveis e resultado impecável.", testimonialName: "Maria F.", testimonialRole: "Cliente há 2 anos", testimonialRating: 5 },
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. PULSE — Fitness com dark + neon
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-pulse",
    category: "premium",
    categoryEmoji: "✦",
    name: "Pulse",
    description: "Energético e impactante. Para academias, personal trainers e CrossFit.",
    template: {
      slug: "",
      businessName: "APEX FITNESS",
      tagline: "Treinamento de alta performance",
      heroImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=75",
      heroImageHeightPx: 220,
      heroOverlayOpacity: 50,
      heroOverlayColor: "dark",
      logoUrl: "",
      backgroundColor: "custom:#0F0F0F",
      textColor: "text-white",
      accentColor: "#00FF94",
      fontFamily: "Sora",
      businessNameFontSize: 28,
      taglineFontSize: 12,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#F5F5F5",
      taglineColor: "#888888",
      entryAnimation: "scale",
      buttons: [
        {
          id: "f1", label: "AULA EXPERIMENTAL GRÁTIS", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#00FF94:#00FF94",
          linkType: "whatsapp", linkValue: "",
          buttonStyle: "flat" as const, titleSize: 13,
        },
        {
          id: "f2", label: "Planos e Preços", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#00FF94:#00FF94",
          linkType: "external", linkValue: "",
          buttonStyle: "outline" as const, titleSize: 13,
        },
        {
          id: "f3", label: "Horários das Aulas", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#00FF94:#00FF94",
          linkType: "external", linkValue: "",
          buttonStyle: "outline" as const, titleSize: 13,
        },
        {
          id: "f4", label: "Instagram", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#00FF94:#00FF94",
          linkType: "instagram", linkValue: "",
          buttonStyle: "minimal" as const, titleSize: 13,
        },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "fb1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "500+", label: "Alunos ativos" },
          { id: "s2", value: "15", label: "Modalidades" },
          { id: "s3", value: "5h-23h", label: "Funcionamento" },
        ]},
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. INK — Barbearia/tattoo dark com gold
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-ink",
    category: "premium",
    categoryEmoji: "✦",
    name: "Ink",
    description: "Dark e sofisticado. Para barbearias, tattoo studios e marcas masculinas.",
    template: {
      slug: "",
      businessName: "The Gentleman's Cut",
      tagline: "Barbearia & Grooming · Desde 2018",
      heroImage: "https://images.unsplash.com/photo-1503951914875-452cb81ae0ec?w=800&q=75",
      heroImageHeightPx: 200,
      heroOverlayOpacity: 45,
      heroOverlayColor: "dark",
      logoUrl: "",
      backgroundColor: "custom:#0A0A0A",
      textColor: "text-white",
      accentColor: "#C5A55A",
      fontFamily: "Bebas Neue",
      businessNameFontSize: 32,
      taglineFontSize: 11,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#FAFAFA",
      taglineColor: "#737373",
      entryAnimation: "fade-up",
      buttons: [
        {
          id: "i1", label: "AGENDAR HORÁRIO", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#C5A55A:#C5A55A",
          linkType: "whatsapp", linkValue: "",
          buttonStyle: "flat" as const, titleSize: 14,
        },
        {
          id: "i2", label: "SERVIÇOS & PREÇOS", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#C5A55A:#C5A55A",
          linkType: "external", linkValue: "",
          buttonStyle: "outline" as const, titleSize: 14,
        },
        {
          id: "i3", label: "NOSSO TRABALHO", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#C5A55A:#C5A55A",
          linkType: "instagram", linkValue: "",
          buttonStyle: "outline" as const, titleSize: 14,
        },
        {
          id: "i4", label: "COMO CHEGAR", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#C5A55A:#C5A55A",
          linkType: "external", linkValue: "",
          buttonStyle: "minimal" as const, titleSize: 14,
        },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. GARDEN — Pet shop / Vet com verde suave
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-garden",
    category: "premium",
    categoryEmoji: "✦",
    name: "Garden",
    description: "Acolhedor e amigável. Para pet shops, veterinários e dog walkers.",
    template: {
      slug: "",
      businessName: "Patinhas & Cia",
      tagline: "Cuidamos do seu melhor amigo com carinho",
      heroImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=75",
      heroImageHeightPx: 200,
      heroOverlayOpacity: 20,
      heroOverlayColor: "light",
      logoUrl: "",
      backgroundColor: "custom:#F0F7F2",
      textColor: "text-gray-900",
      accentColor: "#16A34A",
      fontFamily: "Outfit",
      businessNameFontSize: 24,
      taglineFontSize: 13,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#14532D",
      taglineColor: "#4D7C5A",
      entryAnimation: "fade-up",
      buttons: [
        {
          id: "gd1", label: "Agendar Banho & Tosa", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#16A34A:#16A34A",
          linkType: "whatsapp", linkValue: "",
          buttonStyle: "soft" as const, titleSize: 14, buttonBorderRadius: 20,
        },
        {
          id: "gd2", label: "Consulta Veterinária", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#16A34A:#16A34A",
          linkType: "whatsapp", linkValue: "",
          buttonStyle: "soft" as const, titleSize: 14, buttonBorderRadius: 20,
        },
        {
          id: "gd3", label: "Pet Shop Online", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#16A34A:#16A34A",
          linkType: "external", linkValue: "",
          buttonStyle: "flat" as const, titleSize: 14, buttonBorderRadius: 20,
        },
        {
          id: "gd4", label: "Nossos Peludos no Insta", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#16A34A:#16A34A",
          linkType: "instagram", linkValue: "",
          buttonStyle: "minimal" as const, titleSize: 14,
        },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "gdb1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "2.000+", label: "Pets atendidos" },
          { id: "s2", value: "4.9", label: "Avaliação Google" },
          { id: "s3", value: "8", label: "Veterinários" },
        ]},
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. LAVENDER — Coaches, terapeutas, mentores
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-lavender",
    category: "premium",
    categoryEmoji: "✦",
    name: "Lavender",
    description: "Sereno e profissional. Para coaches, terapeutas e mentores.",
    template: {
      slug: "",
      businessName: "Fernanda Costa",
      tagline: "Coach de Carreira & Desenvolvimento Pessoal",
      heroImage: "",
      logoUrl: "",
      backgroundColor: "custom:#F8F5FF",
      textColor: "text-gray-900",
      accentColor: "#7C3AED",
      fontFamily: "Lora",
      businessNameFontSize: 26,
      taglineFontSize: 13,
      businessNameAlign: "center",
      headerStyle: "bio",
      titleColor: "#1A0F2E",
      taglineColor: "#7C6B99",
      entryAnimation: "fade-up",
      buttons: [
        {
          id: "l1", label: "Agendar Sessão Gratuita", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#7C3AED:#7C3AED",
          linkType: "whatsapp", linkValue: "",
          buttonStyle: "flat" as const, titleSize: 14, buttonBorderRadius: 24,
        },
        {
          id: "l2", label: "Programas de Mentoria", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#7C3AED:#7C3AED",
          linkType: "external", linkValue: "",
          buttonStyle: "soft" as const, titleSize: 14, buttonBorderRadius: 24,
        },
        {
          id: "l3", label: "Podcast — Despertando", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#7C3AED:#7C3AED",
          linkType: "external", linkValue: "",
          buttonStyle: "soft" as const, titleSize: 14, buttonBorderRadius: 24,
        },
        {
          id: "l4", label: "LinkedIn", subtitle: "", url: "", icon: "",
          gradientColor: "custom:#7C3AED:#7C3AED",
          linkType: "external", linkValue: "",
          buttonStyle: "minimal" as const, titleSize: 14,
        },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "lb1", type: "testimonial", order: 0, content: "A Fernanda transformou minha visão sobre carreira. Em 3 meses, mudei de emprego e tripliquei minha renda.", testimonialName: "Ricardo M.", testimonialRole: "Gerente de Produto", testimonialRating: 5 },
      ],
      pages: [],
    },
  },
];
