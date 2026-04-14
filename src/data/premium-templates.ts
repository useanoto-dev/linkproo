/**
 * Premium templates — LinkPro redesign.
 * 10 templates radicalmente distintos: backgrounds únicos, tipografia variada,
 * 6 com animações CSS bgHtml, composições diferentes, zero emojis como ícones.
 *
 * Backgrounds (todos únicos):
 *  1. MONO       #0A0A0A  pure noir
 *  2. PAPER      #FFFEF9  warm white editorial
 *  3. BISTRO     #FAF7F2  terracotta cream
 *  4. CLINICAL   #F0F9FF  icy medical blue
 *  5. NEO        #FEF08A  electric yellow
 *  6. GLOW       #0D0818  deep purple (animated orbs)
 *  7. PULSE      #050D07  deep green (animated scanlines)
 *  8. INK        #140E08  deep warm brown (grain+glow)
 *  9. GARDEN     #F0FDF4  bright mint
 * 10. LAVENDER   #1A0C3E  deep indigo (animated orbs)
 */
import type { LinkTemplate } from "./templates";

export const premiumTemplates: LinkTemplate[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. MONO — Ultra-minimal noir com grain sutil
  // Composição: sem hero, título gigante, grain bg, só text-links
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-mono",
    category: "premium",
    categoryEmoji: "✦",
    name: "Mono",
    description: "Ultra-minimalista noir. Tipografia dominante, sem distrações.",
    template: {
      slug: "",
      businessName: "STUDIO NOIR",
      tagline: "Design & Direção Criativa",
      heroImage: "",
      logoUrl: "",
      backgroundColor: "custom:#0A0A0A",
      textColor: "text-white",
      accentColor: "#FAFAFA",
      fontFamily: "Clash Display",
      businessNameFontSize: 36,
      taglineFontSize: 11,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#FAFAFA",
      taglineColor: "#525252",
      entryAnimation: "none",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}.g{position:fixed;inset:0;opacity:.038;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:160px}</style><div class="g"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "m1", label: "Portfolio", subtitle: "", url: "", icon: "", gradientColor: "custom:#FAFAFA:#FAFAFA", linkType: "external", linkValue: "", buttonStyle: "minimal" as const, titleSize: 15 },
        { id: "m2", label: "Serviços", subtitle: "", url: "", icon: "", gradientColor: "custom:#FAFAFA:#FAFAFA", linkType: "external", linkValue: "", buttonStyle: "minimal" as const, titleSize: 15 },
        { id: "m3", label: "Contato", subtitle: "", url: "", icon: "", gradientColor: "custom:#FAFAFA:#FAFAFA", linkType: "email", linkValue: "", buttonStyle: "minimal" as const, titleSize: 15 },
        { id: "m4", label: "Instagram", subtitle: "", url: "", icon: "", gradientColor: "custom:#FAFAFA:#FAFAFA", linkType: "instagram", linkValue: "", buttonStyle: "minimal" as const, titleSize: 15 },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "mb1", type: "separator", order: 0 },
        { id: "mb2", type: "text", order: 1, content: "Transformamos marcas em experiências memoráveis.", blockTextColor: "#404040", blockTextAlign: "center" },
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PAPER — Editorial magazine, Cormorant gigante
  // Composição: sem hero, título 42px, linha editorial HTML, outline buttons
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-paper",
    category: "premium",
    categoryEmoji: "✦",
    name: "Paper",
    description: "Editorial e atemporal. Serif gigante, estilo revista literária.",
    template: {
      slug: "",
      businessName: "Ana Beatriz",
      tagline: "Escritora · Mentora de Criatividade",
      heroImage: "",
      logoUrl: "",
      backgroundColor: "custom:#FFFEF9",
      textColor: "text-gray-900",
      accentColor: "#5B7C5E",
      fontFamily: "Cormorant Garamond",
      businessNameFontSize: 42,
      taglineFontSize: 13,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#1A1A18",
      taglineColor: "#8C7E6A",
      entryAnimation: "fade-up",
      buttons: [
        { id: "p1", label: "Meu Livro Mais Recente", subtitle: "", url: "", icon: "", gradientColor: "custom:#5B7C5E:#5B7C5E", linkType: "external", linkValue: "", buttonStyle: "outline" as const, titleSize: 14, buttonBorderRadius: 4 },
        { id: "p2", label: "Newsletter Semanal", subtitle: "", url: "", icon: "", gradientColor: "custom:#5B7C5E:#5B7C5E", linkType: "external", linkValue: "", buttonStyle: "outline" as const, titleSize: 14, buttonBorderRadius: 4 },
        { id: "p3", label: "Mentoria Individual", subtitle: "", url: "", icon: "", gradientColor: "custom:#5B7C5E:#5B7C5E", linkType: "whatsapp", linkValue: "", buttonStyle: "soft" as const, titleSize: 14, buttonBorderRadius: 4 },
        { id: "p4", label: "Sobre Mim", subtitle: "", url: "", icon: "", gradientColor: "custom:#5B7C5E:#5B7C5E", linkType: "external", linkValue: "", buttonStyle: "minimal" as const, titleSize: 14 },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "pb0", type: "html", order: 0, htmlContent: `<div style="display:flex;align-items:center;gap:12px;padding:0 20px"><div style="height:1px;flex:1;background:#C8C0B0"></div><div style="width:5px;height:5px;border-radius:50%;background:#5B7C5E"></div><div style="height:1px;flex:1;background:#C8C0B0"></div></div>`, htmlHeight: 24 },
        { id: "pb1", type: "text", order: 1, content: "\"A escrita é a forma mais generosa de existir.\"", blockTextColor: "#8C7E6A", blockTextAlign: "center" },
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. BISTRO — Italiano quente, terracotta, hero cinematográfico
  // Composição: hero + stats + separador + texto horário
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-bistro",
    category: "premium",
    categoryEmoji: "✦",
    name: "Bistro",
    description: "Elegância italiana. Terracotta quente, DM Serif, vibe de osteria.",
    template: {
      slug: "",
      businessName: "Osteria del Porto",
      tagline: "Cozinha italiana autoral · Est. 2019",
      heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=75",
      heroImageHeightPx: 240,
      heroOverlayOpacity: 35,
      heroOverlayColor: "dark",
      bannerCurve: true,
      bannerCurveIntensity: 40,
      logoUrl: "",
      backgroundColor: "custom:#FAF7F2",
      textColor: "text-gray-900",
      accentColor: "#C45D3E",
      fontFamily: "DM Serif Display",
      businessNameFontSize: 28,
      taglineFontSize: 12,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#2C2418",
      taglineColor: "#8C7E6A",
      entryAnimation: "fade-up",
      buttons: [
        { id: "b1", label: "Ver Cardápio", subtitle: "", url: "", icon: "", gradientColor: "custom:#C45D3E:#C45D3E", linkType: "external", linkValue: "", buttonStyle: "flat" as const, titleSize: 14, buttonBorderRadius: 10 },
        { id: "b2", label: "Reservar Mesa", subtitle: "", url: "", icon: "", gradientColor: "custom:#C45D3E:#C45D3E", linkType: "whatsapp", linkValue: "", buttonStyle: "outline" as const, titleSize: 14, buttonBorderRadius: 10 },
        { id: "b3", label: "Delivery", subtitle: "", url: "", icon: "", gradientColor: "custom:#C45D3E:#C45D3E", linkType: "whatsapp", linkValue: "", buttonStyle: "soft" as const, titleSize: 14, buttonBorderRadius: 10 },
        { id: "b4", label: "Nossa Localização", subtitle: "", url: "", icon: "", gradientColor: "custom:#C45D3E:#C45D3E", linkType: "external", linkValue: "", buttonStyle: "minimal" as const, titleSize: 14 },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "bb1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "4.9", label: "Avaliação" },
          { id: "s2", value: "6 Anos", label: "de história" },
          { id: "s3", value: "200+", label: "Pratos" },
        ]},
        { id: "bb2", type: "separator", order: 1 },
        { id: "bb3", type: "text", order: 2, content: "Aberto ter–dom, das 18h às 23h.", blockTextColor: "#8C7E6A", blockTextAlign: "center" },
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. CLINICAL — Médico imaculado, icy blue, bio mode
  // Composição: sem hero, bio avatar, stats, flat+soft buttons
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-clinical",
    category: "premium",
    categoryEmoji: "✦",
    name: "Clinical",
    description: "Confiança médica. Azul gelado, Plus Jakarta Sans, bio mode.",
    template: {
      slug: "",
      businessName: "Dra. Camila Lopes",
      tagline: "Dermatologista · CRM 48.291",
      heroImage: "",
      logoUrl: "",
      backgroundColor: "custom:#F0F9FF",
      textColor: "text-gray-900",
      accentColor: "#0891B2",
      fontFamily: "Plus Jakarta Sans",
      businessNameFontSize: 22,
      taglineFontSize: 12,
      businessNameAlign: "center",
      headerStyle: "bio",
      titleColor: "#0C2D3E",
      taglineColor: "#5A7B8F",
      entryAnimation: "fade-up",
      buttons: [
        { id: "c1", label: "Agendar Consulta", subtitle: "", url: "", icon: "", gradientColor: "custom:#0891B2:#0891B2", linkType: "whatsapp", linkValue: "", buttonStyle: "flat" as const, titleSize: 14, buttonBorderRadius: 10 },
        { id: "c2", label: "Especialidades", subtitle: "", url: "", icon: "", gradientColor: "custom:#0891B2:#0891B2", linkType: "external", linkValue: "", buttonStyle: "soft" as const, titleSize: 14, buttonBorderRadius: 10 },
        { id: "c3", label: "Resultados de Exames", subtitle: "", url: "", icon: "", gradientColor: "custom:#0891B2:#0891B2", linkType: "external", linkValue: "", buttonStyle: "soft" as const, titleSize: 14, buttonBorderRadius: 10 },
        { id: "c4", label: "Como Chegar", subtitle: "", url: "", icon: "", gradientColor: "custom:#0891B2:#0891B2", linkType: "external", linkValue: "", buttonStyle: "minimal" as const, titleSize: 14 },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "cb1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "12+", label: "Anos" },
          { id: "s2", value: "5.000+", label: "Pacientes" },
          { id: "s3", value: "98%", label: "Satisfação" },
        ]},
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. NEO — Neubrutalism explodindo, amarelo + grid CSS
  // Composição: sem hero, grid bg animado, título 34px, todos neubrutalism
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-neo",
    category: "premium",
    categoryEmoji: "✦",
    name: "Neo",
    description: "Neubrutalism explosivo. Amarelo + grid, máximo contraste, Gen-Z.",
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
      businessNameFontSize: 34,
      taglineFontSize: 13,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#000000",
      taglineColor: "#44403C",
      entryAnimation: "bounce",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}.g{position:fixed;inset:0;background-image:linear-gradient(rgba(0,0,0,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.1) 1px,transparent 1px);background-size:44px 44px}</style><div class="g"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "n1", label: "YouTube", subtitle: "120k inscritos", url: "", icon: "", gradientColor: "custom:#EF4444:#EF4444", linkType: "youtube", linkValue: "", buttonStyle: "neubrutalism" as const, titleSize: 14, buttonBorderRadius: 6 },
        { id: "n2", label: "GitHub", subtitle: "Open source", url: "", icon: "", gradientColor: "custom:#1F2937:#1F2937", linkType: "external", linkValue: "", buttonStyle: "neubrutalism" as const, titleSize: 14, buttonBorderRadius: 6 },
        { id: "n3", label: "Curso de React", subtitle: "", url: "", icon: "", gradientColor: "custom:#3B82F6:#3B82F6", linkType: "external", linkValue: "", buttonStyle: "neubrutalism" as const, titleSize: 14, buttonBorderRadius: 6, badgeLabel: "NEW", badgeColor: "#EF4444" },
        { id: "n4", label: "Twitter / X", subtitle: "", url: "", icon: "", gradientColor: "custom:#000000:#000000", linkType: "external", linkValue: "", buttonStyle: "neubrutalism" as const, titleSize: 14, buttonBorderRadius: 6 },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "nb1", type: "html", order: 0, htmlContent: `<div style="margin:4px 16px;padding:10px 14px;border:2.5px solid #000;box-shadow:4px 4px 0 #000;font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;background:#fff">LINKS PRINCIPAIS</div>`, htmlHeight: 52 },
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. GLOW — Luxury beauty, roxo escuro + orbs animados + glass buttons
  // Composição: hero dark, deep purple bg, orbs CSS, glass buttons
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-glow",
    category: "premium",
    categoryEmoji: "✦",
    name: "Glow",
    description: "Luxo e sofisticação. Roxo profundo, orbs animados, glass buttons.",
    template: {
      slug: "",
      businessName: "Atelier Beleza",
      tagline: "Estética avançada & bem-estar",
      heroImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=75",
      heroImageHeightPx: 220,
      heroOverlayOpacity: 70,
      heroOverlayColor: "#0D0818",
      logoUrl: "",
      backgroundColor: "custom:#0D0818",
      textColor: "text-white",
      accentColor: "#E879F9",
      fontFamily: "Playfair Display",
      businessNameFontSize: 28,
      taglineFontSize: 12,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#F5E8FF",
      taglineColor: "#C084FC",
      entryAnimation: "scale",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}@keyframes f{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.25);opacity:.85}}.o{position:fixed;border-radius:50%;filter:blur(85px);animation:f ease-in-out infinite}</style><div class="o" style="width:280px;height:280px;background:radial-gradient(circle,rgba(168,85,247,.6),transparent);top:-80px;left:-70px;animation-duration:8s"></div><div class="o" style="width:260px;height:260px;background:radial-gradient(circle,rgba(236,72,153,.5),transparent);bottom:-70px;right:-60px;animation-duration:10s;animation-delay:-4s"></div><div class="o" style="width:180px;height:180px;background:radial-gradient(circle,rgba(99,102,241,.4),transparent);top:45%;right:5%;animation-duration:7s;animation-delay:-2s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "g1", label: "Agendar Horário", subtitle: "", url: "", icon: "", gradientColor: "custom:#E879F9:#E879F9", linkType: "whatsapp", linkValue: "", buttonStyle: "glass" as const, titleSize: 14 },
        { id: "g2", label: "Tratamentos", subtitle: "", url: "", icon: "", gradientColor: "custom:#E879F9:#E879F9", linkType: "external", linkValue: "", buttonStyle: "glass" as const, titleSize: 14 },
        { id: "g3", label: "Antes & Depois", subtitle: "", url: "", icon: "", gradientColor: "custom:#E879F9:#E879F9", linkType: "instagram", linkValue: "", buttonStyle: "glass" as const, titleSize: 14 },
        { id: "g4", label: "Promoções do Mês", subtitle: "", url: "", icon: "", gradientColor: "custom:#E879F9:#E879F9", linkType: "external", linkValue: "", buttonStyle: "glass" as const, titleSize: 14 },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "gb1", type: "testimonial", order: 0, content: "Melhor experiência que já tive. Resultado impecável.", testimonialName: "Maria F.", testimonialRole: "Cliente há 2 anos", testimonialRating: 5 },
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. PULSE — Cyberpunk fitness, verde abissal + scanlines
  // Composição: hero dark, scanlines CSS, stats, flat+outline buttons
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-pulse",
    category: "premium",
    categoryEmoji: "✦",
    name: "Pulse",
    description: "Cyberpunk fitness. Verde neon no abismo, scanlines animados.",
    template: {
      slug: "",
      businessName: "APEX FITNESS",
      tagline: "Treinamento de alta performance",
      heroImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=75",
      heroImageHeightPx: 240,
      heroOverlayOpacity: 60,
      heroOverlayColor: "#050D07",
      logoUrl: "",
      backgroundColor: "custom:#050D07",
      textColor: "text-white",
      accentColor: "#00FF94",
      fontFamily: "Sora",
      businessNameFontSize: 30,
      taglineFontSize: 11,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#E8FFF2",
      taglineColor: "#4ADE80",
      entryAnimation: "slide-left",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}@keyframes s{0%{top:-2px}100%{top:100vh}}@keyframes p{0%,100%{opacity:.05}50%{opacity:.18}}.sl{position:fixed;width:100%;height:2px;background:linear-gradient(90deg,transparent 0%,rgba(0,255,148,.22) 50%,transparent 100%);animation:s 5s linear infinite;left:0}.gl{position:fixed;border-radius:50%;filter:blur(90px);animation:p ease-in-out infinite}</style><div class="sl"></div><div class="sl" style="animation-delay:-2.5s"></div><div class="gl" style="width:340px;height:200px;background:radial-gradient(ellipse,rgba(0,255,148,.1),transparent);bottom:-80px;left:50%;transform:translateX(-50%);animation-duration:5s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "f1", label: "AULA EXPERIMENTAL GRÁTIS", subtitle: "", url: "", icon: "", gradientColor: "custom:#00FF94:#00FF94", linkType: "whatsapp", linkValue: "", buttonStyle: "flat" as const, titleSize: 13, buttonBorderRadius: 6 },
        { id: "f2", label: "Planos e Preços", subtitle: "", url: "", icon: "", gradientColor: "custom:#00FF94:#00FF94", linkType: "external", linkValue: "", buttonStyle: "outline" as const, titleSize: 13, buttonBorderRadius: 6 },
        { id: "f3", label: "Horários das Aulas", subtitle: "", url: "", icon: "", gradientColor: "custom:#00FF94:#00FF94", linkType: "external", linkValue: "", buttonStyle: "outline" as const, titleSize: 13, buttonBorderRadius: 6 },
        { id: "f4", label: "Instagram", subtitle: "", url: "", icon: "", gradientColor: "custom:#00FF94:#00FF94", linkType: "instagram", linkValue: "", buttonStyle: "minimal" as const, titleSize: 13 },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "fb1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "500+", label: "Alunos" },
          { id: "s2", value: "15", label: "Modalidades" },
          { id: "s3", value: "5h–23h", label: "Horário" },
        ]},
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. INK — Barbearia dark premium, marrom quente + grain + glow dourado
  // Composição: hero cinematic, grain+amber CSS, Bebas Neue 40px, ouro
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-ink",
    category: "premium",
    categoryEmoji: "✦",
    name: "Ink",
    description: "Masculino e sofisticado. Marrom escuro, grain, ouro, Bebas Neue.",
    template: {
      slug: "",
      businessName: "THE GENTLEMAN'S CUT",
      tagline: "Barbearia & Grooming · Desde 2018",
      heroImage: "https://images.unsplash.com/photo-1503951914875-452cb81ae0ec?w=800&q=75",
      heroImageHeightPx: 220,
      heroOverlayOpacity: 55,
      heroOverlayColor: "#140E08",
      logoUrl: "",
      backgroundColor: "custom:#140E08",
      textColor: "text-white",
      accentColor: "#C5A55A",
      fontFamily: "Bebas Neue",
      businessNameFontSize: 38,
      taglineFontSize: 11,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#FAF6EE",
      taglineColor: "#C5A55A",
      entryAnimation: "fade-up",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}@keyframes fl{0%,100%{opacity:.07}50%{opacity:.14}}.gn{position:fixed;inset:0;opacity:.032;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:180px}.am{position:fixed;border-radius:50%;filter:blur(100px);animation:fl ease-in-out infinite}</style><div class="gn"></div><div class="am" style="width:360px;height:180px;background:radial-gradient(ellipse,rgba(197,165,90,.15),transparent);bottom:-60px;left:-60px;animation-duration:6s"></div><div class="am" style="width:260px;height:130px;background:radial-gradient(ellipse,rgba(197,165,90,.08),transparent);bottom:-40px;right:-50px;animation-duration:8s;animation-delay:-3s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "i1", label: "AGENDAR HORÁRIO", subtitle: "", url: "", icon: "", gradientColor: "custom:#C5A55A:#C5A55A", linkType: "whatsapp", linkValue: "", buttonStyle: "flat" as const, titleSize: 14, buttonBorderRadius: 4 },
        { id: "i2", label: "SERVIÇOS & PREÇOS", subtitle: "", url: "", icon: "", gradientColor: "custom:#C5A55A:#C5A55A", linkType: "external", linkValue: "", buttonStyle: "outline" as const, titleSize: 14, buttonBorderRadius: 4 },
        { id: "i3", label: "NOSSO TRABALHO", subtitle: "", url: "", icon: "", gradientColor: "custom:#C5A55A:#C5A55A", linkType: "instagram", linkValue: "", buttonStyle: "outline" as const, titleSize: 14, buttonBorderRadius: 4 },
        { id: "i4", label: "COMO CHEGAR", subtitle: "", url: "", icon: "", gradientColor: "custom:#C5A55A:#C5A55A", linkType: "external", linkValue: "", buttonStyle: "minimal" as const, titleSize: 14 },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. GARDEN — Pet shop, verde menta fresco, Outfit, soft buttons
  // Composição: hero claro, menta brilhante, very rounded, stats
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-garden",
    category: "premium",
    categoryEmoji: "✦",
    name: "Garden",
    description: "Fresco e acolhedor. Verde menta, bordas suaves, pet-friendly.",
    template: {
      slug: "",
      businessName: "Patinhas & Cia",
      tagline: "Cuidamos do seu melhor amigo",
      heroImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=75",
      heroImageHeightPx: 200,
      heroOverlayOpacity: 15,
      heroOverlayColor: "light",
      bannerCurve: true,
      bannerCurveIntensity: 50,
      logoUrl: "",
      backgroundColor: "custom:#F0FDF4",
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
        { id: "gd1", label: "Agendar Banho & Tosa", subtitle: "", url: "", icon: "", gradientColor: "custom:#16A34A:#16A34A", linkType: "whatsapp", linkValue: "", buttonStyle: "soft" as const, titleSize: 14, buttonBorderRadius: 24 },
        { id: "gd2", label: "Consulta Veterinária", subtitle: "", url: "", icon: "", gradientColor: "custom:#16A34A:#16A34A", linkType: "whatsapp", linkValue: "", buttonStyle: "soft" as const, titleSize: 14, buttonBorderRadius: 24 },
        { id: "gd3", label: "Pet Shop Online", subtitle: "", url: "", icon: "", gradientColor: "custom:#16A34A:#16A34A", linkType: "external", linkValue: "", buttonStyle: "flat" as const, titleSize: 14, buttonBorderRadius: 24 },
        { id: "gd4", label: "Nossos Peludos no Insta", subtitle: "", url: "", icon: "", gradientColor: "custom:#16A34A:#16A34A", linkType: "instagram", linkValue: "", buttonStyle: "minimal" as const, titleSize: 14 },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "gdb1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "2.000+", label: "Pets" },
          { id: "s2", value: "4.9", label: "Google" },
          { id: "s3", value: "8", label: "Vets" },
        ]},
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. LAVENDER — Coach etéreo, índigo profundo + orbs roxos animados
  // Composição: sem hero, bio mode, deep indigo, orbs CSS, Lora serif
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-lavender",
    category: "premium",
    categoryEmoji: "✦",
    name: "Lavender",
    description: "Etéreo e transformador. Índigo profundo, orbs animados, Lora.",
    template: {
      slug: "",
      businessName: "Fernanda Costa",
      tagline: "Coach de Carreira & Desenvolvimento Pessoal",
      heroImage: "",
      logoUrl: "",
      backgroundColor: "custom:#1A0C3E",
      textColor: "text-white",
      accentColor: "#A78BFA",
      fontFamily: "Lora",
      businessNameFontSize: 26,
      taglineFontSize: 13,
      businessNameAlign: "center",
      headerStyle: "bio",
      titleColor: "#EDE9FE",
      taglineColor: "#A78BFA",
      entryAnimation: "fade-up",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}@keyframes d{0%,100%{transform:translate(0,0);opacity:.4}50%{transform:translate(18px,-28px);opacity:.65}}.ob{position:fixed;border-radius:50%;filter:blur(72px)}</style><div class="ob" style="width:260px;height:260px;background:radial-gradient(circle,rgba(167,139,250,.55),transparent);top:-50px;right:-50px;animation:d 9s ease-in-out infinite"></div><div class="ob" style="width:210px;height:210px;background:radial-gradient(circle,rgba(192,132,252,.42),transparent);bottom:20%;left:-55px;animation:d 11s ease-in-out infinite;animation-delay:-5s"></div><div class="ob" style="width:160px;height:160px;background:radial-gradient(circle,rgba(236,72,153,.22),transparent);bottom:0;right:15%;animation:d 8s ease-in-out infinite;animation-delay:-3s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "l1", label: "Sessão Gratuita", subtitle: "", url: "", icon: "", gradientColor: "custom:#A78BFA:#A78BFA", linkType: "whatsapp", linkValue: "", buttonStyle: "flat" as const, titleSize: 14, buttonBorderRadius: 22 },
        { id: "l2", label: "Programas de Mentoria", subtitle: "", url: "", icon: "", gradientColor: "custom:#A78BFA:#A78BFA", linkType: "external", linkValue: "", buttonStyle: "soft" as const, titleSize: 14, buttonBorderRadius: 22 },
        { id: "l3", label: "Podcast — Despertando", subtitle: "", url: "", icon: "", gradientColor: "custom:#A78BFA:#A78BFA", linkType: "external", linkValue: "", buttonStyle: "soft" as const, titleSize: 14, buttonBorderRadius: 22 },
        { id: "l4", label: "LinkedIn", subtitle: "", url: "", icon: "", gradientColor: "custom:#A78BFA:#A78BFA", linkType: "external", linkValue: "", buttonStyle: "minimal" as const, titleSize: 14 },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "lb1", type: "testimonial", order: 0, content: "Em 3 meses, mudei de emprego e tripliquei minha renda.", testimonialName: "Ricardo M.", testimonialRole: "Gerente de Produto", testimonialRating: 5 },
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. MESH — Gradient mesh animado CSS puro
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-mesh",
    category: "premium",
    categoryEmoji: "✦",
    name: "Mesh",
    description: "Gradient mesh líquido e hipnótico. Cores que fluem em looping infinito.",
    styleTag: ["animados", "escuros"],
    template: {
      slug: "",
      businessName: "Creative Studio",
      tagline: "Design · Motion · Branding",
      heroImage: "",
      logoUrl: "",
      backgroundColor: "custom:#0d0d1a",
      textColor: "text-white",
      accentColor: "#a78bfa",
      fontFamily: "Inter",
      businessNameFontSize: 28,
      taglineFontSize: 12,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#f1f0ff",
      taglineColor: "#a0a0c0",
      entryAnimation: "fade-up",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}@keyframes mesh{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}@media(prefers-reduced-motion:reduce){*{animation-duration:.001ms!important}}.m{position:fixed;inset:0;background:linear-gradient(-45deg,#0d0d1a,#1e0a3c,#0a1628,#130d2e,#1a0835,#0d1a2e);background-size:400% 400%;animation:mesh 18s ease infinite;opacity:.98}</style><div class="m"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "me1", label: "Portfólio", subtitle: "", url: "", icon: "", gradientColor: "custom:#a78bfa:#a78bfa", linkType: "external", linkValue: "", buttonStyle: "glass" as const, titleSize: 14 },
        { id: "me2", label: "Serviços", subtitle: "", url: "", icon: "", gradientColor: "custom:#a78bfa:#a78bfa", linkType: "external", linkValue: "", buttonStyle: "glass" as const, titleSize: 14 },
        { id: "me3", label: "Orçamento", subtitle: "", url: "", icon: "", gradientColor: "custom:#a78bfa:#a78bfa", linkType: "whatsapp", linkValue: "", buttonStyle: "flat" as const, titleSize: 14, buttonBorderRadius: 20 },
        { id: "me4", label: "Instagram", subtitle: "", url: "", icon: "", gradientColor: "custom:#a78bfa:#a78bfa", linkType: "instagram", linkValue: "", buttonStyle: "minimal" as const, titleSize: 14 },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. AURORA — Auroras boreais nórdicas
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-aurora",
    category: "premium",
    categoryEmoji: "✦",
    name: "Aurora",
    description: "Auroras boreais dançando no fundo. Elegância nórdica e mística.",
    styleTag: ["animados", "escuros"],
    template: {
      slug: "",
      businessName: "Astrid Berg",
      tagline: "Fotógrafa de Viagens · Escandinávia",
      heroImage: "",
      logoUrl: "",
      backgroundColor: "custom:#010b14",
      textColor: "text-white",
      accentColor: "#34d399",
      fontFamily: "Montserrat",
      businessNameFontSize: 26,
      taglineFontSize: 12,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#e0fff4",
      taglineColor: "#6ee7b7",
      entryAnimation: "fade-up",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}@keyframes aurora1{0%,100%{transform:translateY(0) scaleX(1);opacity:.55}50%{transform:translateY(-30px) scaleX(1.1);opacity:.75}}@keyframes aurora2{0%,100%{transform:translateY(0) scaleX(1) rotate(-2deg);opacity:.4}60%{transform:translateY(20px) scaleX(.95) rotate(2deg);opacity:.65}}@keyframes aurora3{0%,100%{transform:translateY(0) scaleX(1);opacity:.3}40%{transform:translateY(-20px) scaleX(1.05);opacity:.5}}@media(prefers-reduced-motion:reduce){*{animation-duration:.001ms!important}}.a{position:fixed;border-radius:50%;filter:blur(60px);mix-blend-mode:screen}</style><div class="a" style="width:320px;height:80px;background:linear-gradient(90deg,#00c896,#00ffb3,#00ddd0);top:35%;left:-60px;animation:aurora1 9s ease-in-out infinite"></div><div class="a" style="width:280px;height:60px;background:linear-gradient(90deg,#6ee7b7,#a78bfa,#67e8f9);top:42%;right:-50px;animation:aurora2 13s ease-in-out infinite;animation-delay:-4s"></div><div class="a" style="width:240px;height:50px;background:linear-gradient(90deg,#34d399,#60a5fa,#818cf8);top:55%;left:10%;animation:aurora3 11s ease-in-out infinite;animation-delay:-7s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "au1", label: "Galeria de Fotos", subtitle: "", url: "", icon: "", gradientColor: "custom:#34d399:#34d399", linkType: "external", linkValue: "", buttonStyle: "glass" as const, titleSize: 14 },
        { id: "au2", label: "Viagens Guiadas", subtitle: "", url: "", icon: "", gradientColor: "custom:#34d399:#34d399", linkType: "external", linkValue: "", buttonStyle: "glass" as const, titleSize: 14 },
        { id: "au3", label: "Contato", subtitle: "", url: "", icon: "", gradientColor: "custom:#34d399:#34d399", linkType: "email", linkValue: "", buttonStyle: "outline" as const, titleSize: 14, buttonBorderRadius: 12 },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "aub1", type: "text", order: 0, content: "Cada imagem é uma janela para o infinito.", blockTextColor: "#6ee7b7", blockTextAlign: "center" },
      ],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 13. PARTICLES — Partículas CSS puras (sem canvas, sem JS)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-particles",
    category: "premium",
    categoryEmoji: "✦",
    name: "Particles",
    description: "Partículas de luz flutuando em fundo escuro. CSS puro, zero canvas.",
    styleTag: ["animados", "escuros"],
    template: {
      slug: "",
      businessName: "Luna Dev",
      tagline: "Desenvolvimento Web · UX Design",
      heroImage: "",
      logoUrl: "",
      backgroundColor: "custom:#050510",
      textColor: "text-white",
      accentColor: "#818cf8",
      fontFamily: "Inter",
      businessNameFontSize: 28,
      taglineFontSize: 12,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#e0e7ff",
      taglineColor: "#818cf8",
      entryAnimation: "fade-up",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}@keyframes float{0%{transform:translateY(100vh) translateX(0);opacity:0}10%{opacity:1}90%{opacity:.6}100%{transform:translateY(-10vh) translateX(var(--tx));opacity:0}}@media(prefers-reduced-motion:reduce){*{animation-duration:.001ms!important}}.p{position:fixed;border-radius:50%;background:radial-gradient(circle,#818cf8,#6366f1);animation:float linear infinite;pointer-events:none}</style><div class="p" style="width:3px;height:3px;left:8%;bottom:0;--tx:15px;animation-duration:12s;animation-delay:0s;opacity:.8"></div><div class="p" style="width:2px;height:2px;left:16%;bottom:0;--tx:-20px;animation-duration:15s;animation-delay:-3s;opacity:.6"></div><div class="p" style="width:4px;height:4px;left:25%;bottom:0;--tx:25px;animation-duration:11s;animation-delay:-6s;opacity:.7"></div><div class="p" style="width:2px;height:2px;left:34%;bottom:0;--tx:-15px;animation-duration:14s;animation-delay:-1s;opacity:.5"></div><div class="p" style="width:3px;height:3px;left:44%;bottom:0;--tx:18px;animation-duration:13s;animation-delay:-8s;opacity:.8"></div><div class="p" style="width:2px;height:2px;left:55%;bottom:0;--tx:-22px;animation-duration:16s;animation-delay:-4s;opacity:.6"></div><div class="p" style="width:4px;height:4px;left:64%;bottom:0;--tx:20px;animation-duration:10s;animation-delay:-2s;opacity:.9"></div><div class="p" style="width:2px;height:2px;left:75%;bottom:0;--tx:-18px;animation-duration:17s;animation-delay:-7s;opacity:.5"></div><div class="p" style="width:3px;height:3px;left:84%;bottom:0;--tx:12px;animation-duration:12s;animation-delay:-5s;opacity:.7"></div><div class="p" style="width:2px;height:2px;left:92%;bottom:0;--tx:-14px;animation-duration:14s;animation-delay:-9s;opacity:.6"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "pa1", label: "Ver Projetos", subtitle: "", url: "", icon: "", gradientColor: "custom:#818cf8:#818cf8", linkType: "external", linkValue: "", buttonStyle: "flat" as const, titleSize: 14, buttonBorderRadius: 18 },
        { id: "pa2", label: "Stack Técnica", subtitle: "", url: "", icon: "", gradientColor: "custom:#818cf8:#818cf8", linkType: "external", linkValue: "", buttonStyle: "soft" as const, titleSize: 14, buttonBorderRadius: 18 },
        { id: "pa3", label: "Contratar", subtitle: "", url: "", icon: "", gradientColor: "custom:#818cf8:#818cf8", linkType: "whatsapp", linkValue: "", buttonStyle: "glass" as const, titleSize: 14 },
        { id: "pa4", label: "GitHub", subtitle: "", url: "", icon: "", gradientColor: "custom:#818cf8:#818cf8", linkType: "external", linkValue: "", buttonStyle: "minimal" as const, titleSize: 14 },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [],
      pages: [],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 14. MATRIX — Chuva digital matrix
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tpl-premium-matrix",
    category: "premium",
    categoryEmoji: "✦",
    name: "Matrix",
    description: "Chuva de código digital. Para hackers, devs e criadores tech.",
    styleTag: ["animados", "escuros"],
    template: {
      slug: "",
      businessName: "h4x0r.dev",
      tagline: "Security Researcher · CTF Player",
      heroImage: "",
      logoUrl: "",
      backgroundColor: "custom:#000000",
      textColor: "text-white",
      accentColor: "#00ff41",
      fontFamily: "Inter",
      businessNameFontSize: 26,
      taglineFontSize: 12,
      businessNameAlign: "center",
      headerStyle: "classic",
      titleColor: "#00ff41",
      taglineColor: "#008f11",
      entryAnimation: "none",
      matrixEffect: { enabled: true, speed: 3, color: "#00ff41" },
      buttons: [
        { id: "mx1", label: "writeups", subtitle: "", url: "", icon: "", gradientColor: "custom:#00ff41:#00ff41", linkType: "external", linkValue: "", buttonStyle: "outline" as const, titleSize: 14, buttonBorderRadius: 4 },
        { id: "mx2", label: "projetos", subtitle: "", url: "", icon: "", gradientColor: "custom:#00ff41:#00ff41", linkType: "external", linkValue: "", buttonStyle: "outline" as const, titleSize: 14, buttonBorderRadius: 4 },
        { id: "mx3", label: "contato", subtitle: "", url: "", icon: "", gradientColor: "custom:#00ff41:#00ff41", linkType: "email", linkValue: "", buttonStyle: "outline" as const, titleSize: 14, buttonBorderRadius: 4 },
        { id: "mx4", label: "github", subtitle: "", url: "", icon: "", gradientColor: "custom:#00ff41:#00ff41", linkType: "external", linkValue: "", buttonStyle: "minimal" as const, titleSize: 14 },
      ],
      badges: [],
      floatingEmojis: [],
      blocks: [
        { id: "mxb1", type: "text", order: 0, content: "// curiosity is the root of all hacking", blockTextColor: "#005f16", blockTextAlign: "center" },
      ],
      pages: [],
    },
  },
];
