import { SmartLink, SubPage } from "@/types/smart-link";
import { premiumTemplates } from "./premium-templates";

export interface LinkTemplate {
  id: string;
  category: string;
  categoryEmoji: string;
  name: string;
  description: string;
  /** Visual style tags for cross-cutting style filters */
  styleTag?: string[];
  /** Thumbnail URL for gallery preview. Falls back to dynamic CSS mini-preview when absent. */
  previewImage?: string;
  template: Omit<SmartLink, "id" | "createdAt" | "views" | "clicks" | "isActive" | "pages"> & { pages?: SmartLink["pages"] };
}

export const templateCategories = [
  { id: "premium",  label: "✦ Premium",             emoji: "✦",  description: "Templates profissionais com design único",     color: "bg-gradient-to-r from-violet-600 to-indigo-600" },
  { id: "delivery",  label: "Delivery",              emoji: "🍕", description: "Pizzarias, hamburguerias, restaurantes",  color: "bg-orange-500" },
  { id: "saude",     label: "Saúde",                  emoji: "🏥", description: "Clínicas, consultórios, odontologia",     color: "bg-emerald-500" },
  { id: "acaiteria", label: "Açaíteria & Sorvetes",   emoji: "🍦", description: "Açaí, sorveterias, frozen",               color: "bg-purple-500" },
  { id: "advocacia", label: "Advocacia",               emoji: "⚖️", description: "Escritórios de advocacia, jurídico",      color: "bg-slate-700" },
  { id: "beleza",    label: "Beleza & Estética",       emoji: "💇", description: "Salões, barbearias, estética",            color: "bg-pink-500" },
  { id: "fitness",   label: "Fitness & Academia",      emoji: "💪", description: "Academias, personal trainers",            color: "bg-red-500" },
  { id: "petshop",   label: "Pet Shop",                emoji: "🐾", description: "Pet shops, clínicas veterinárias",        color: "bg-amber-500" },
  { id: "educacao",  label: "Educação",                emoji: "📚", description: "Cursos, escolas, professores",            color: "bg-blue-500" },
  { id: "imobiliaria", label: "Imobiliária",           emoji: "🏠", description: "Corretores, imobiliárias",               color: "bg-cyan-500" },
  { id: "automotivo", label: "Automotivo",             emoji: "🚗", description: "Oficinas, lava-jatos, concessionárias",  color: "bg-zinc-600" },
  { id: "creator",   label: "Creator & Influencer",    emoji: "🎬", description: "Criadores de conteúdo, influenciadores",  color: "bg-violet-600" },
  { id: "japones",   label: "Restaurante Japonês",     emoji: "🍱", description: "Sushi, temakeria, culinária japonesa",    color: "bg-red-700" },
  { id: "estetica",  label: "Clínica Estética",        emoji: "💆", description: "Estética avançada, spa, tratamentos",    color: "bg-rose-400" },
  { id: "foto",      label: "Fotógrafo",               emoji: "📸", description: "Fotografia profissional, ensaios",       color: "bg-neutral-700" },
  { id: "musica",    label: "Músico & DJ",             emoji: "🎵", description: "Artistas, DJs, produtores musicais",     color: "bg-fuchsia-600" },
  { id: "saas",      label: "Startup SaaS",            emoji: "🚀", description: "Software, apps, plataformas digitais",   color: "bg-indigo-600" },
  { id: "trainer",   label: "Personal Trainer",        emoji: "🏋️", description: "Treinamento personalizado, coaching",   color: "bg-orange-600" },
  { id: "moda",      label: "Loja de Roupas",          emoji: "👗", description: "Moda, boutiques, ateliês",               color: "bg-stone-500" },
  { id: "design",    label: "Arquiteto & Designer",    emoji: "✏️", description: "Arquitetura, design de interiores",      color: "bg-gray-700" },
  { id: "coach",     label: "Coach & Mentor",          emoji: "🎯", description: "Coaching, mentoria, desenvolvimento",    color: "bg-amber-600" },
  { id: "padaria",   label: "Padaria & Confeitaria",   emoji: "🥐", description: "Padarias, confeitarias, bolos",          color: "bg-yellow-600" },
  { id: "vet",       label: "Clínica Veterinária",     emoji: "🐾", description: "Veterinários, clínicas, cuidados pet",   color: "bg-teal-600" },
  { id: "contabilidade", label: "Contabilidade",          emoji: "📊", description: "Escritórios contábeis, contadores, BPO financeiro",   color: "bg-blue-700" },
  { id: "juristas",   label: "Juristas & Direito",        emoji: "⚖️", description: "Advogados, juristas, escritórios jurídicos",           color: "bg-amber-800" },
  { id: "animados",   label: "✨ Efeitos Animados",      emoji: "🎨", description: "Templates com fundos HTML/CSS animados exclusivos", color: "bg-violet-600" },
  { id: "mini-sites", label: "🌐 Mini Sites",             emoji: "🌐", description: "Templates estilo site completo com múltiplas seções",  color: "bg-indigo-600" },
  { id: "entretenimento", label: "🎮 Entretenimento",      emoji: "🎮", description: "Games, streamers, eventos, baladas",                   color: "bg-fuchsia-600" },
  { id: "gastronomia", label: "🍷 Gastronomia",           emoji: "🍷", description: "Restaurantes gourmet, chefs, sommeliers",              color: "bg-amber-700" },
  { id: "hospedagem", label: "Hotel & Hospedagem",    emoji: "🏨", description: "Hotéis, pousadas, resorts, turismo",          color: "bg-amber-700" },
  // ── Style filters (cross-cutting) ────────────────────────────────────────
  { id: "minimalistas", label: "◻ Minimalistas",   emoji: "◻", description: "Limpo, espaço negativo, tipografia dominante",    color: "bg-zinc-800" },
  { id: "escuros",      label: "◼ Dark Mode",       emoji: "◼", description: "Fundos escuros sofisticados",                    color: "bg-gray-900" },
  { id: "claros",       label: "☀ Light & Clean",   emoji: "☀", description: "Fundos claros, profissionais",                   color: "bg-sky-100 text-sky-900" },
];

export const templates: LinkTemplate[] = [
  // ─────────────────────────── PREMIUM (design único) ──────────────────────
  ...premiumTemplates,

  // ─────────────────────────── DELIVERY ──────────────────────────────
  {
    id: "tpl-pizzaria",
    category: "delivery",
    categoryEmoji: "🍕",
    name: "Pizzaria",
    description: "Modelo completo para pizzarias com cardápio e delivery",
    template: {
      slug: "",
      businessName: "Pizzaria Bella Napoli",
      tagline: "A autêntica pizza napolitana da cidade",
      heroImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-red-950 to-orange-950",
      bgHtml: { enabled: true, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent;overflow:hidden}@keyframes ember{0%{transform:translateY(0) translateX(0) scale(1);opacity:0}8%{opacity:.9}40%{opacity:.75}85%{opacity:.2}100%{transform:translateY(-110vh) translateX(var(--dx)) scale(.3);opacity:0}}@keyframes spark{0%{transform:translateY(0) translateX(0) scale(1);opacity:0}5%{opacity:1}30%{opacity:.8}70%{opacity:.3}100%{transform:translateY(-70vh) translateX(var(--dx)) scale(.1);opacity:0}}@keyframes glow{0%,100%{opacity:.1;transform:scale(1)}50%{opacity:.28;transform:scale(1.12)}}.em{position:fixed;border-radius:50%;background:radial-gradient(circle,#fff7ed 20%,#fb923c 55%,#dc2626 100%);filter:blur(.8px);animation:ember linear infinite;box-shadow:0 0 6px 2px rgba(249,115,22,.7)}.sk{position:fixed;border-radius:50%;background:radial-gradient(circle,#ffffff 15%,#fbbf24 60%,#f97316 100%);filter:blur(.4px);animation:spark linear infinite;box-shadow:0 0 4px 1px rgba(251,191,36,.9)}.gl{position:fixed;border-radius:50%;filter:blur(70px);animation:glow ease-in-out infinite}</style><div class="gl" style="width:280px;height:280px;background:radial-gradient(circle,rgba(249,115,22,.18),transparent);bottom:-80px;left:-60px;animation-duration:6s"></div><div class="gl" style="width:220px;height:220px;background:radial-gradient(circle,rgba(220,38,38,.15),transparent);bottom:-60px;right:-50px;animation-duration:8s;animation-delay:-3s"></div><div class="gl" style="width:160px;height:160px;background:radial-gradient(circle,rgba(251,191,36,.12),transparent);top:20%;left:40%;animation-duration:10s;animation-delay:-5s"></div><div class="em" style="width:3px;height:3px;left:7%;bottom:0;--dx:-18px;animation-duration:4.6s;animation-delay:0s"></div><div class="em" style="width:4px;height:4px;left:14%;bottom:0;--dx:22px;animation-duration:6.2s;animation-delay:-1.3s"></div><div class="em" style="width:2px;height:2px;left:22%;bottom:0;--dx:-12px;animation-duration:5.1s;animation-delay:-2.8s"></div><div class="em" style="width:4px;height:4px;left:31%;bottom:0;--dx:28px;animation-duration:7.4s;animation-delay:-0.7s"></div><div class="em" style="width:3px;height:3px;left:42%;bottom:0;--dx:-20px;animation-duration:5.8s;animation-delay:-3.9s"></div><div class="em" style="width:2px;height:2px;left:54%;bottom:0;--dx:15px;animation-duration:4.3s;animation-delay:-1.6s"></div><div class="em" style="width:4px;height:4px;left:63%;bottom:0;--dx:-25px;animation-duration:6.7s;animation-delay:-0.4s"></div><div class="em" style="width:3px;height:3px;left:74%;bottom:0;--dx:19px;animation-duration:5.4s;animation-delay:-2.2s"></div><div class="em" style="width:2px;height:2px;left:83%;bottom:0;--dx:-14px;animation-duration:7.1s;animation-delay:-4.5s"></div><div class="em" style="width:4px;height:4px;left:91%;bottom:0;--dx:24px;animation-duration:4.9s;animation-delay:-1.1s"></div><div class="sk" style="width:2px;height:2px;left:10%;bottom:0;--dx:35px;animation-duration:3.2s;animation-delay:-0.5s"></div><div class="sk" style="width:1px;height:1px;left:27%;bottom:0;--dx:-30px;animation-duration:2.8s;animation-delay:-1.8s"></div><div class="sk" style="width:2px;height:2px;left:48%;bottom:0;--dx:28px;animation-duration:3.6s;animation-delay:-3.1s"></div><div class="sk" style="width:1px;height:1px;left:69%;bottom:0;--dx:-22px;animation-duration:2.5s;animation-delay:-0.9s"></div><div class="sk" style="width:2px;height:2px;left:87%;bottom:0;--dx:18px;animation-duration:3.9s;animation-delay:-2.4s"></div>`, overlay: 0 },
      heroOverlayOpacity: 30,
      heroOverlayColor: "dark",
      textColor: "text-white",
      accentColor: "#f97316",
      fontFamily: "Inter",
      buttons: [
        { id: "1", label: "Cardápio Completo", subtitle: "Mais de 40 sabores 🍕", url: "", icon: "", gradientColor: "from-orange-500 to-orange-700", iconEmoji: "📋", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80", imagePosition: "right" as const, imageOpacity: 80, imageSize: 45 },
        { id: "2", label: "Pedir Delivery", subtitle: "Entrega em até 45 min 🛵", url: "", icon: "", gradientColor: "from-red-600 to-red-800", iconEmoji: "🛵", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 40 },
        { id: "3", label: "iFood / Rappi", subtitle: "Peça pelos apps 📱", url: "", icon: "", gradientColor: "from-red-500 to-pink-600", iconEmoji: "📲", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Reservar Mesa", subtitle: "Jantar especial 🕯️", url: "", icon: "", gradientColor: "from-amber-600 to-amber-800", iconEmoji: "🍷", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "5", label: "Nossa Localização", subtitle: "R. das Flores, 120 📍", url: "", icon: "", gradientColor: "from-blue-600 to-blue-800", iconEmoji: "📍", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
      ],
      badges: [],
      floatingEmojis: ["🍕", "🧀", "🍅", "🌿"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Forno a Lenha", emoji: "🔥", color: "bg-orange-500" },
          { id: "2", label: "Ingredientes Frescos", emoji: "🌿", color: "bg-green-500" },
          { id: "3", label: "Delivery Rápido", emoji: "🛵", color: "bg-blue-500" },
          { id: "4", label: "Opção Vegana", emoji: "🥗", color: "bg-emerald-500" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🔥 Promoção de Terça!", subtitle: "2 pizzas grandes + refrigerante por R$89,90" },
        { id: "b3", type: "testimonial", order: 2, content: "Melhor pizza que já comi! A massa é perfeita e o molho é incrível.", testimonialName: "Carla M.", testimonialRole: "Cliente fiel há 3 anos", testimonialRating: 5 },
      ],
      pages: [],
    },
  },
  {
    id: "tpl-hamburgueria",
    category: "delivery",
    categoryEmoji: "🍔",
    name: "Hamburgueria",
    description: "Modelo para hamburguerias artesanais",
    template: {
      slug: "",
      businessName: "Smash Burguer Co.",
      tagline: "Hambúrgueres artesanais que vão além",
      heroImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-stone-950 to-amber-950",
      bgHtml: { enabled: true, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent;overflow:hidden}@keyframes splat{0%{transform:translate(0,0) scale(1);opacity:0}6%{opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(.05);opacity:0}}@keyframes heatwave{0%,100%{opacity:.08;transform:scaleY(1)}50%{opacity:.2;transform:scaleY(1.06)}}@keyframes flicker{0%,100%{opacity:.12}25%{opacity:.25}75%{opacity:.18}}.sp{position:fixed;border-radius:50%;background:radial-gradient(circle,#fef3c7 20%,#f59e0b 55%,#b45309 100%);filter:blur(.5px);box-shadow:0 0 5px 2px rgba(245,158,11,.8);animation:splat ease-out infinite}.hw{position:fixed;bottom:0;filter:blur(28px);animation:heatwave ease-in-out infinite}.hg{position:fixed;border-radius:50%;filter:blur(65px);animation:flicker ease-in-out infinite}</style><div class="hg" style="width:340px;height:120px;background:radial-gradient(ellipse,rgba(217,119,6,.2),transparent);bottom:0;left:-20px;animation-duration:4s"></div><div class="hg" style="width:260px;height:100px;background:radial-gradient(ellipse,rgba(180,83,9,.18),transparent);bottom:0;right:-10px;animation-duration:5s;animation-delay:-2s"></div><div class="hw" style="width:100%;height:60px;background:linear-gradient(to top,rgba(245,158,11,.07),transparent);left:0;animation-duration:3s"></div><div class="sp" style="width:3px;height:3px;left:12%;bottom:8%;--tx:-40px;--ty:-120px;animation-duration:1.4s;animation-delay:0s"></div><div class="sp" style="width:2px;height:2px;left:12%;bottom:8%;--tx:55px;--ty:-95px;animation-duration:1.2s;animation-delay:-0.3s"></div><div class="sp" style="width:4px;height:4px;left:28%;bottom:6%;--tx:-30px;--ty:-140px;animation-duration:1.6s;animation-delay:-0.7s"></div><div class="sp" style="width:2px;height:2px;left:28%;bottom:6%;--tx:45px;--ty:-110px;animation-duration:1.1s;animation-delay:-1.2s"></div><div class="sp" style="width:3px;height:3px;left:45%;bottom:9%;--tx:-60px;--ty:-125px;animation-duration:1.5s;animation-delay:-0.4s"></div><div class="sp" style="width:2px;height:2px;left:45%;bottom:9%;--tx:38px;--ty:-150px;animation-duration:1.3s;animation-delay:-1.8s"></div><div class="sp" style="width:4px;height:4px;left:62%;bottom:5%;--tx:50px;--ty:-130px;animation-duration:1.7s;animation-delay:-0.9s"></div><div class="sp" style="width:2px;height:2px;left:62%;bottom:5%;--tx:-42px;--ty:-100px;animation-duration:1.2s;animation-delay:-0.2s"></div><div class="sp" style="width:3px;height:3px;left:78%;bottom:7%;--tx:-55px;--ty:-115px;animation-duration:1.4s;animation-delay:-1.4s"></div><div class="sp" style="width:2px;height:2px;left:78%;bottom:7%;--tx:35px;--ty:-145px;animation-duration:1.6s;animation-delay:-0.6s"></div><div class="sp" style="width:3px;height:3px;left:90%;bottom:6%;--tx:-28px;--ty:-120px;animation-duration:1.3s;animation-delay:-1.1s"></div><div class="sp" style="width:4px;height:4px;left:35%;bottom:12%;--tx:70px;--ty:-80px;animation-duration:1.1s;animation-delay:-0.8s"></div><div class="sp" style="width:2px;height:2px;left:55%;bottom:10%;--tx:-65px;--ty:-90px;animation-duration:1.5s;animation-delay:-1.6s"></div>`, overlay: 0 },
      heroOverlayOpacity: 30,
      heroOverlayColor: "dark",
      textColor: "text-white",
      accentColor: "#d97706",
      fontFamily: "Poppins",
      buttons: [
        { id: "1", label: "Ver Cardápio", subtitle: "Smash, clássico e veggie 🍔", url: "", icon: "", gradientColor: "from-amber-500 to-amber-700", iconEmoji: "🍔", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", imagePosition: "right" as const, imageOpacity: 80, imageSize: 45 },
        { id: "2", label: "Pedir Agora", subtitle: "Entrega em 30 min 🛵", url: "", icon: "", gradientColor: "from-red-600 to-red-800", iconEmoji: "🛵", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "3", label: "iFood", subtitle: "Peça pelo app 📱", url: "", icon: "", gradientColor: "from-red-500 to-orange-500", iconEmoji: "📲", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Instagram", subtitle: "Veja nossos burgers 😍", url: "", icon: "", gradientColor: "from-purple-600 to-pink-600", iconEmoji: "📸", linkType: "instagram", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1619881590738-a111d176d906?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
      ],
      badges: [],
      floatingEmojis: ["🍔", "🍟", "🥤", "🔥"],
      blocks: [
        { id: "b1", type: "cta", order: 0, content: "Smash Burger Angus 🔥", subtitle: "Carne 100% Angus, pão brioche artesanal e molhos especiais da casa" },
        { id: "b2", type: "badges", order: 1, badges: [
          { id: "1", label: "Carne 100% Angus", emoji: "🥩", color: "bg-red-700" },
          { id: "2", label: "Pão Artesanal", emoji: "🍞", color: "bg-amber-600" },
          { id: "3", label: "Sem Conservantes", emoji: "✅", color: "bg-green-600" },
        ]},
        { id: "b3", type: "stats", order: 2, statItems: [
          { id: "s1", value: "40+", label: "Opções no cardápio" },
          { id: "s2", value: "4.9★", label: "Avaliação iFood" },
          { id: "s3", value: "30min", label: "Tempo de entrega" },
        ]},
      ],
      pages: [],
    },
  },

  // ─────────────────────────── SAÚDE ──────────────────────────────
  {
    id: "tpl-clinica",
    category: "saude",
    categoryEmoji: "🏥",
    name: "Clínica Médica",
    description: "Modelo para clínicas e consultórios médicos",
    template: {
      slug: "",
      businessName: "Clínica Saúde & Vida",
      tagline: "Cuidando de você com excelência e carinho",
      heroImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-sky-50 to-blue-100",
      bgHtml: { enabled: false, html: `<style>*{margin:0;padding:0;box-sizing:border-box}@keyframes float{0%,100%{transform:translateY(0) scale(1);opacity:.18}50%{transform:translateY(-18px) scale(1.04);opacity:.42}}@keyframes ring{0%,100%{transform:scale(1);opacity:.12}50%{transform:scale(1.08);opacity:.28}}.o{position:fixed;border-radius:50%;filter:blur(42px);animation:float ease-in-out infinite}.r{position:fixed;border-radius:50%;border:1.5px solid;animation:ring ease-in-out infinite}</style><div class="o" style="width:170px;height:170px;background:radial-gradient(circle,rgba(14,165,233,.22),transparent);top:4%;right:6%;animation-duration:8s"></div><div class="o" style="width:120px;height:120px;background:radial-gradient(circle,rgba(99,102,241,.16),transparent);top:52%;left:3%;animation-duration:11s;animation-delay:-4s"></div><div class="o" style="width:100px;height:100px;background:radial-gradient(circle,rgba(16,185,129,.14),transparent);bottom:8%;right:10%;animation-duration:9s;animation-delay:-2s"></div><div class="r" style="width:200px;height:200px;border-color:rgba(14,165,233,.14);top:20%;right:-48px;animation-duration:6s"></div><div class="r" style="width:140px;height:140px;border-color:rgba(99,102,241,.11);bottom:10%;left:-28px;animation-duration:8s;animation-delay:-3s"></div>`, overlay: 0 },
      heroOverlayOpacity: 15,
      heroOverlayColor: "light",
      textColor: "text-slate-900",
      accentColor: "#0ea5e9",
      fontFamily: "Inter",
      buttons: [
        { id: "1", label: "Agendar Consulta", subtitle: "Horários disponíveis ✅", url: "", icon: "", gradientColor: "from-cyan-500 to-teal-700", iconEmoji: "📅", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40, buttonStyle: "pill" as const },
        { id: "2", label: "Especialidades", subtitle: "Mais de 15 especialidades 🏥", url: "", icon: "", gradientColor: "from-blue-600 to-blue-800", iconEmoji: "🩺", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Resultados de Exames", subtitle: "Acesse online 📋", url: "", icon: "", gradientColor: "from-indigo-500 to-indigo-700", iconEmoji: "📊", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "WhatsApp", subtitle: "Tire suas dúvidas 📲", url: "", icon: "", gradientColor: "from-green-600 to-green-800", iconEmoji: "💬", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "5", label: "Como Chegar", subtitle: "Av. Central, 800 📍", url: "", icon: "", gradientColor: "from-slate-500 to-slate-700", iconEmoji: "📍", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["💙", "🩺", "⚕️"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Atendimento Humanizado", emoji: "💙", color: "bg-blue-500" },
          { id: "2", label: "Profissionais Qualificados", emoji: "⭐", color: "bg-cyan-500" },
          { id: "3", label: "Convênios Aceitos", emoji: "✅", color: "bg-green-500" },
          { id: "4", label: "Urgência 24h", emoji: "🚨", color: "bg-red-500" },
        ]},
        { id: "b2", type: "stats", order: 1, statItems: [
          { id: "s1", value: "15+", label: "Especialidades" },
          { id: "s2", value: "10k+", label: "Pacientes atendidos" },
          { id: "s3", value: "98%", label: "Satisfação" },
        ]},
      ],
      pages: [],
    },
  },
  {
    id: "tpl-odonto",
    category: "saude",
    categoryEmoji: "🦷",
    name: "Odontologia",
    description: "Modelo para consultórios odontológicos",
    template: {
      slug: "",
      businessName: "Odonto Sorriso Premium",
      tagline: "Seu sorriso perfeito começa aqui",
      heroImage: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-blue-50 to-sky-100",
      bgHtml: { enabled: false, html: `<style>*{margin:0;padding:0;box-sizing:border-box}@keyframes sparkle{0%,100%{transform:scale(0) rotate(0deg);opacity:0}50%{transform:scale(1) rotate(180deg);opacity:.78}}@keyframes drift{0%,100%{transform:translateY(0) translateX(0);opacity:.16}50%{transform:translateY(-15px) translateX(5px);opacity:.38}}.s{position:fixed;border-radius:50%;animation:sparkle ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(50px);animation:drift ease-in-out infinite}</style><div class="o" style="width:180px;height:180px;background:radial-gradient(circle,rgba(14,165,233,.2),transparent);top:3%;right:5%;animation-duration:9s"></div><div class="o" style="width:130px;height:130px;background:radial-gradient(circle,rgba(52,211,153,.16),transparent);bottom:10%;left:4%;animation-duration:11s;animation-delay:-4s"></div><div class="o" style="width:110px;height:110px;background:radial-gradient(circle,rgba(99,102,241,.13),transparent);top:50%;right:15%;animation-duration:13s;animation-delay:-6s"></div><div class="s" style="width:5px;height:5px;background:rgba(14,165,233,.55);top:20%;left:15%;animation-duration:3.2s"></div><div class="s" style="width:4px;height:4px;background:rgba(52,211,153,.5);top:42%;right:20%;animation-duration:4.1s;animation-delay:-1s"></div><div class="s" style="width:6px;height:6px;background:rgba(14,165,233,.45);top:65%;left:30%;animation-duration:3.6s;animation-delay:-2s"></div><div class="s" style="width:3px;height:3px;background:rgba(99,102,241,.6);top:80%;right:15%;animation-duration:4.8s;animation-delay:-0.5s"></div><div class="s" style="width:4px;height:4px;background:rgba(52,211,153,.5);top:28%;left:55%;animation-duration:3.9s;animation-delay:-1.8s"></div>`, overlay: 0 },
      heroOverlayOpacity: 15,
      heroOverlayColor: "light",
      textColor: "text-slate-900",
      accentColor: "#0284c7",
      fontFamily: "Inter",
      buttons: [
        { id: "1", label: "Avaliação Gratuita", subtitle: "Sem compromisso 🎉", url: "", icon: "", gradientColor: "from-sky-500 to-sky-700", iconEmoji: "😁", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40, buttonStyle: "pill" as const },
        { id: "2", label: "Tratamentos", subtitle: "Implante, clareamento e mais 💎", url: "", icon: "", gradientColor: "from-blue-600 to-blue-800", iconEmoji: "🦷", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Antes & Depois", subtitle: "Resultados reais 🌟", url: "", icon: "", gradientColor: "from-purple-600 to-pink-600", iconEmoji: "📸", linkType: "instagram", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Parcelamento 12x", subtitle: "Facilidade no pagamento 💳", url: "", icon: "", gradientColor: "from-green-600 to-emerald-700", iconEmoji: "💳", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["😁", "🦷", "✨"],
      blocks: [
        { id: "b1", type: "cta", order: 0, content: "✨ Avaliação 100% Gratuita", subtitle: "Agende agora e transforme seu sorriso" },
        { id: "b2", type: "badges", order: 1, badges: [
          { id: "1", label: "Implante Dentário", emoji: "🦷", color: "bg-sky-600" },
          { id: "2", label: "Clareamento LED", emoji: "✨", color: "bg-blue-500" },
          { id: "3", label: "Ortodontia", emoji: "😁", color: "bg-indigo-500" },
          { id: "4", label: "Lentes de Contato", emoji: "💎", color: "bg-purple-500" },
        ]},
      ],
      pages: [],
    },
  },

  // ─────────────────────────── AÇAÍTERIA ──────────────────────────
  {
    id: "tpl-acaiteria",
    category: "acaiteria",
    categoryEmoji: "🫐",
    name: "Açaíteria",
    description: "Modelo para açaíterias e açaí delivery",
    template: {
      slug: "",
      businessName: "Açaí da Casa",
      tagline: "O melhor açaí da cidade, com amor",
      heroImage: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-purple-900 to-violet-950",
      bgHtml: { enabled: false, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0d0710}@keyframes bubble{0%{transform:translateY(0) scale(.8);opacity:0}20%{opacity:.5}80%{opacity:.28}100%{transform:translateY(-115vh) scale(1.2);opacity:0}}@keyframes glow{0%,100%{opacity:.15;transform:scale(1)}50%{opacity:.35;transform:scale(1.06)}}.b{position:fixed;border-radius:50%;filter:blur(4px);animation:bubble ease-in-out infinite}.g{position:fixed;border-radius:50%;filter:blur(60px);animation:glow ease-in-out infinite}</style><div class="g" style="width:280px;height:280px;background:radial-gradient(circle,rgba(168,85,247,.2),transparent);top:-50px;right:-40px;animation-duration:7s"></div><div class="g" style="width:200px;height:200px;background:radial-gradient(circle,rgba(236,72,153,.15),transparent);bottom:-30px;left:-30px;animation-duration:9s;animation-delay:-3s"></div><div class="b" style="width:13px;height:13px;background:rgba(168,85,247,.32);bottom:0;left:12%;animation-duration:6s"></div><div class="b" style="width:9px;height:9px;background:rgba(236,72,153,.26);bottom:0;left:28%;animation-duration:8.2s;animation-delay:-2s"></div><div class="b" style="width:11px;height:11px;background:rgba(139,92,246,.3);bottom:0;left:50%;animation-duration:7.1s;animation-delay:-4s"></div><div class="b" style="width:7px;height:7px;background:rgba(168,85,247,.22);bottom:0;left:68%;animation-duration:9.3s;animation-delay:-1s"></div><div class="b" style="width:10px;height:10px;background:rgba(196,68,250,.28);bottom:0;left:85%;animation-duration:6.8s;animation-delay:-3s"></div>`, overlay: 0 },
      heroOverlayOpacity: 30,
      heroOverlayColor: "dark",
      textColor: "text-white",
      accentColor: "#a855f7",
      fontFamily: "Nunito",
      buttons: [
        { id: "1", label: "Monte Seu Açaí", subtitle: "+30 complementos 🍓", url: "", icon: "", gradientColor: "from-purple-500 to-purple-700", iconEmoji: "🫐", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80", imagePosition: "right" as const, imageOpacity: 80, imageSize: 45 },
        { id: "2", label: "Delivery", subtitle: "Receba em casa 📦", url: "", icon: "", gradientColor: "from-violet-600 to-violet-800", iconEmoji: "🛵", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1615478503562-ec2d8aa0a24a?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "3", label: "Cardápio", subtitle: "Tigelas e combos 🥣", url: "", icon: "", gradientColor: "from-fuchsia-500 to-fuchsia-700", iconEmoji: "📋", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Instagram", subtitle: "Inspire-se 📸", url: "", icon: "", gradientColor: "from-pink-500 to-pink-700", iconEmoji: "📸", linkType: "instagram", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
      ],
      badges: [],
      floatingEmojis: ["🫐", "🍓", "🍌", "🥣"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "100% Natural", emoji: "🌿", color: "bg-green-500" },
          { id: "2", label: "Sem Conservantes", emoji: "✅", color: "bg-purple-500" },
          { id: "3", label: "+30 Complementos", emoji: "🍓", color: "bg-pink-500" },
          { id: "4", label: "Proteínas Disponíveis", emoji: "💪", color: "bg-violet-500" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🫐 Combo Família", subtitle: "4 tigelas grandes por R$69,90 — só pelo WhatsApp!" },
      ],
      pages: [],
    },
  },
  {
    id: "tpl-sorveteria",
    category: "acaiteria",
    categoryEmoji: "🍦",
    name: "Sorveteria",
    description: "Modelo para sorveterias artesanais",
    template: {
      slug: "",
      businessName: "Gelato Artesanal",
      tagline: "Sorvetes italianos feitos com amor",
      heroImage: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-pink-50 to-rose-100",
      bgHtml: { enabled: false, html: `<style>*{margin:0;padding:0;box-sizing:border-box}@keyframes sparkle{0%,100%{transform:scale(0) rotate(0deg);opacity:0}50%{transform:scale(1) rotate(180deg);opacity:.78}}@keyframes drift{0%,100%{transform:translateY(0) translateX(0);opacity:.16}50%{transform:translateY(-15px) translateX(8px);opacity:.38}}.s{position:fixed;border-radius:50%;animation:sparkle ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(48px);animation:drift ease-in-out infinite}</style><div class="o" style="width:200px;height:200px;background:radial-gradient(circle,rgba(244,114,182,.18),transparent);top:3%;right:3%;animation-duration:8s"></div><div class="o" style="width:155px;height:155px;background:radial-gradient(circle,rgba(192,132,252,.13),transparent);bottom:8%;left:4%;animation-duration:10s;animation-delay:-3s"></div><div class="o" style="width:125px;height:125px;background:radial-gradient(circle,rgba(251,207,232,.14),transparent);top:48%;left:58%;animation-duration:12s;animation-delay:-5s"></div><div class="s" style="width:6px;height:6px;background:rgba(244,114,182,.55);top:18%;left:12%;animation-duration:3s"></div><div class="s" style="width:4px;height:4px;background:rgba(236,72,153,.45);top:38%;right:18%;animation-duration:4s;animation-delay:-1s"></div><div class="s" style="width:5px;height:5px;background:rgba(192,132,252,.5);top:62%;left:26%;animation-duration:3.5s;animation-delay:-2s"></div><div class="s" style="width:3px;height:3px;background:rgba(244,114,182,.6);top:78%;right:12%;animation-duration:4.5s;animation-delay:-0.5s"></div><div class="s" style="width:5px;height:5px;background:rgba(251,207,232,.7);top:25%;left:48%;animation-duration:3.8s;animation-delay:-1.5s"></div>`, overlay: 0 },
      heroOverlayOpacity: 15,
      heroOverlayColor: "light",
      textColor: "text-rose-900",
      accentColor: "#ec4899",
      fontFamily: "Nunito",
      buttons: [
        { id: "1", label: "Cardápio de Sabores", subtitle: "+50 opções 😋", url: "", icon: "", gradientColor: "from-pink-500 to-pink-700", iconEmoji: "🍦", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80", imagePosition: "right" as const, imageOpacity: 80, imageSize: 45, buttonStyle: "pill" as const },
        { id: "2", label: "Encomendas Especiais", subtitle: "Tortinhas e bolos de sorvete 🎂", url: "", icon: "", gradientColor: "from-rose-500 to-rose-700", iconEmoji: "🎂", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1570197571499-166b36435e9f?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "3", label: "Visite-nos", subtitle: "Rua das Palmeiras, 45 📍", url: "", icon: "", gradientColor: "from-blue-600 to-blue-800", iconEmoji: "📍", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
      ],
      badges: [],
      floatingEmojis: ["🍦", "🍨", "🍧", "🌸"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Gelato Italiano", emoji: "🇮🇹", color: "bg-green-600" },
          { id: "2", label: "Vegano Disponível", emoji: "🌿", color: "bg-emerald-500" },
          { id: "3", label: "Sem Lactose", emoji: "✅", color: "bg-pink-500" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🍦 Casquinha por R$8,90", subtitle: "Qualquer sabor do dia — experimente!" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── ADVOCACIA ──────────────────────────
  {
    id: "tpl-advocacia",
    category: "advocacia",
    categoryEmoji: "⚖️",
    name: "Escritório de Advocacia",
    description: "Modelo para advogados e escritórios jurídicos",
    template: {
      slug: "",
      businessName: "Silva & Associados Advogados",
      tagline: "Excelência jurídica ao seu alcance",
      heroImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-slate-900 to-gray-950",
      bgHtml: { enabled: false, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#080b0f}@keyframes drift{0%{transform:translateY(0) translateX(0) rotate(0deg);opacity:.22}50%{transform:translateY(-20px) translateX(7px) rotate(180deg);opacity:.5}100%{transform:translateY(0) translateX(0) rotate(360deg);opacity:.22}}@keyframes glow{0%,100%{opacity:.06}50%{opacity:.18}}.p{position:fixed;width:2px;height:2px;border-radius:50%;background:#c9a227;animation:drift ease-in-out infinite}.g{position:fixed;border-radius:50%;filter:blur(90px);animation:glow ease-in-out infinite}</style><div class="g" style="width:450px;height:450px;background:radial-gradient(circle,rgba(201,162,39,.08),transparent);top:-120px;left:-120px;animation-duration:10s"></div><div class="g" style="width:320px;height:320px;background:radial-gradient(circle,rgba(180,140,10,.07),transparent);bottom:-60px;right:-60px;animation-duration:12s;animation-delay:-5s"></div><div class="p" style="top:12%;left:8%;animation-duration:8s"></div><div class="p" style="top:28%;right:12%;animation-duration:10s;animation-delay:-2s"></div><div class="p" style="top:52%;left:18%;animation-duration:9s;animation-delay:-4s"></div><div class="p" style="top:68%;right:22%;animation-duration:11s;animation-delay:-1s"></div><div class="p" style="top:82%;left:55%;animation-duration:8.5s;animation-delay:-3s"></div><div class="p" style="top:42%;left:72%;animation-duration:12s;animation-delay:-5s"></div><div class="p" style="top:35%;left:42%;animation-duration:7.5s;animation-delay:-2.5s"></div><div class="p" style="top:75%;left:30%;animation-duration:9.5s;animation-delay:-0.8s"></div>`, overlay: 0 },
      heroOverlayOpacity: 30,
      heroOverlayColor: "dark",
      textColor: "text-white",
      accentColor: "#3b82f6",
      fontFamily: "Raleway",
      buttons: [
        { id: "1", label: "Áreas de Atuação", subtitle: "Civil, trabalhista e mais ⚖️", url: "", icon: "", gradientColor: "from-slate-600 to-slate-800", iconEmoji: "⚖️", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 40 },
        { id: "2", label: "Consulta Online", subtitle: "Agende sua consulta 📅", url: "", icon: "", gradientColor: "from-blue-600 to-blue-800", iconEmoji: "📅", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 40 },
        { id: "3", label: "WhatsApp", subtitle: "Resposta em minutos ⚡", url: "", icon: "", gradientColor: "from-green-600 to-green-800", iconEmoji: "💬", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
        { id: "4", label: "E-mail", subtitle: "Envie sua demanda ✉️", url: "", icon: "", gradientColor: "from-indigo-500 to-indigo-800", iconEmoji: "📧", linkType: "email", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
        { id: "5", label: "LinkedIn", subtitle: "Nossa equipe 👔", url: "", icon: "", gradientColor: "from-blue-700 to-blue-900", iconEmoji: "🔗", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&q=80", imagePosition: "right" as const, imageOpacity: 60, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["⚖️", "📜", "🏛️"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Direito Civil", emoji: "📋", color: "bg-slate-500" },
          { id: "2", label: "Direito Trabalhista", emoji: "👷", color: "bg-blue-500" },
          { id: "3", label: "Direito Empresarial", emoji: "🏢", color: "bg-gray-500" },
          { id: "4", label: "Direito de Família", emoji: "👨‍👩‍👧", color: "bg-rose-700" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "Consulta Jurídica Inicial", subtitle: "Primeira consulta com condições especiais para novos clientes" },
        { id: "b3", type: "stats", order: 2, statItems: [
          { id: "s1", value: "15+", label: "Anos de experiência" },
          { id: "s2", value: "2.000+", label: "Casos resolvidos" },
          { id: "s3", value: "98%", label: "Clientes satisfeitos" },
        ]},
      ],
      pages: [],
    },
  },

  // ─────────────────────────── BELEZA ──────────────────────────────
  {
    id: "tpl-salao",
    category: "beleza",
    categoryEmoji: "💇",
    name: "Salão de Beleza",
    description: "Modelo para salões e estúdios de beleza",
    template: {
      slug: "",
      businessName: "Studio Beleza & Arte",
      tagline: "Transforme seu visual, eleve sua autoestima",
      heroImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-rose-50 to-pink-100",
      bgHtml: { enabled: false, html: `<style>*{margin:0;padding:0;box-sizing:border-box}@keyframes sparkle{0%,100%{transform:scale(0) rotate(0deg);opacity:0}50%{transform:scale(1) rotate(180deg);opacity:.78}}@keyframes drift{0%,100%{transform:translateY(0) translateX(0);opacity:.16}50%{transform:translateY(-14px) translateX(6px);opacity:.38}}.s{position:fixed;border-radius:50%;animation:sparkle ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(48px);animation:drift ease-in-out infinite}</style><div class="o" style="width:200px;height:200px;background:radial-gradient(circle,rgba(253,186,116,.16),transparent);top:3%;right:4%;animation-duration:8s"></div><div class="o" style="width:160px;height:160px;background:radial-gradient(circle,rgba(244,114,182,.13),transparent);bottom:9%;left:4%;animation-duration:10s;animation-delay:-3s"></div><div class="o" style="width:130px;height:130px;background:radial-gradient(circle,rgba(252,165,165,.12),transparent);top:50%;left:55%;animation-duration:12s;animation-delay:-5s"></div><div class="s" style="width:6px;height:6px;background:rgba(251,146,60,.55);top:16%;left:10%;animation-duration:3.1s"></div><div class="s" style="width:4px;height:4px;background:rgba(244,114,182,.5);top:36%;right:16%;animation-duration:4.2s;animation-delay:-1s"></div><div class="s" style="width:5px;height:5px;background:rgba(253,186,116,.55);top:60%;left:24%;animation-duration:3.7s;animation-delay:-2s"></div><div class="s" style="width:3px;height:3px;background:rgba(244,114,182,.6);top:77%;right:14%;animation-duration:4.6s;animation-delay:-0.5s"></div><div class="s" style="width:5px;height:5px;background:rgba(251,146,60,.5);top:22%;left:52%;animation-duration:3.9s;animation-delay:-1.7s"></div>`, overlay: 0 },
      heroOverlayOpacity: 15,
      heroOverlayColor: "light",
      textColor: "text-rose-900",
      accentColor: "#e11d48",
      fontFamily: "Outfit",
      buttons: [
        { id: "1", label: "Agendar Horário", subtitle: "Online ou WhatsApp 📲", url: "", icon: "", gradientColor: "from-rose-500 to-rose-700", iconEmoji: "💇", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40, buttonStyle: "pill" as const },
        { id: "2", label: "Lista de Serviços", subtitle: "Preços e tratamentos 💅", url: "", icon: "", gradientColor: "from-pink-600 to-pink-800", iconEmoji: "💅", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Portfólio", subtitle: "Transformações reais 🌟", url: "", icon: "", gradientColor: "from-purple-600 to-pink-600", iconEmoji: "📸", linkType: "instagram", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Pacotes Especiais", subtitle: "Noivas e debutantes 👰", url: "", icon: "", gradientColor: "from-fuchsia-600 to-fuchsia-800", iconEmoji: "💍", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["💇", "💅", "✨", "💄"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Corte & Coloração", emoji: "✂️", color: "bg-rose-500" },
          { id: "2", label: "Manicure & Pedicure", emoji: "💅", color: "bg-pink-500" },
          { id: "3", label: "Design de Sobrancelha", emoji: "👁️", color: "bg-purple-500" },
          { id: "4", label: "Tratamentos Capilares", emoji: "💆", color: "bg-fuchsia-500" },
        ]},
        { id: "b2", type: "testimonial", order: 1, content: "Melhor salão da cidade! Saio sempre renovada e super satisfeita com o atendimento.", testimonialName: "Ana Paula R.", testimonialRole: "Cliente há 2 anos", testimonialRating: 5 },
      ],
      pages: [],
    },
  },
  {
    id: "tpl-barbearia",
    category: "beleza",
    categoryEmoji: "💈",
    name: "Barbearia",
    description: "Modelo para barbearias premium",
    template: {
      slug: "",
      businessName: "The Barber Club",
      tagline: "Estilo, tradição e cuidado masculino",
      heroImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-stone-950 to-neutral-900",
      bgHtml: { enabled: false, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0908}@keyframes smoke{0%{transform:translateY(0) scale(.65) rotate(0deg);opacity:0}30%{opacity:.22}72%{opacity:.08}100%{transform:translateY(-90px) scale(2) rotate(14deg);opacity:0}}@keyframes pulse{0%,100%{opacity:.08}50%{opacity:.18}}.s{position:fixed;border-radius:50%;filter:blur(24px);background:rgba(120,113,108,.22);animation:smoke ease-in-out infinite}.g{position:fixed;border-radius:50%;filter:blur(90px);animation:pulse ease-in-out infinite}</style><div class="g" style="width:400px;height:400px;background:radial-gradient(circle,rgba(168,148,120,.08),transparent);bottom:-60px;left:-60px;animation-duration:9s"></div><div class="g" style="width:280px;height:280px;background:radial-gradient(circle,rgba(217,179,104,.06),transparent);top:-40px;right:-40px;animation-duration:11s;animation-delay:-4s"></div><div class="s" style="width:95px;height:95px;bottom:6%;left:16%;animation-duration:6.2s"></div><div class="s" style="width:75px;height:75px;bottom:10%;left:46%;animation-duration:8s;animation-delay:-2s"></div><div class="s" style="width:85px;height:85px;bottom:7%;right:16%;animation-duration:7.1s;animation-delay:-4s"></div>`, overlay: 0 },
      heroOverlayOpacity: 30,
      heroOverlayColor: "dark",
      textColor: "text-white",
      accentColor: "#78716c",
      fontFamily: "Space Grotesk",
      buttons: [
        { id: "1", label: "Agendar Online", subtitle: "Escolha seu horário ⏰", url: "", icon: "", gradientColor: "from-stone-600 to-stone-800", iconEmoji: "✂️", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Serviços & Preços", subtitle: "Corte, barba e mais 💈", url: "", icon: "", gradientColor: "from-amber-700 to-amber-900", iconEmoji: "💈", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80", imagePosition: "right" as const, imageOpacity: 72, imageSize: 40 },
        { id: "3", label: "Instagram", subtitle: "Nossos cortes 🔥", url: "", icon: "", gradientColor: "from-purple-600 to-pink-600", iconEmoji: "📸", linkType: "instagram", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Como Chegar", subtitle: "Rua XV de Novembro, 200 📍", url: "", icon: "", gradientColor: "from-blue-600 to-blue-800", iconEmoji: "📍", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1585747860019-f3876c62d2c0?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["✂️", "💈", "🧔", "🔥"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Corte Masculino", emoji: "✂️", color: "bg-stone-600" },
          { id: "2", label: "Barba & Design", emoji: "🧔", color: "bg-amber-700" },
          { id: "3", label: "Pigmentação", emoji: "🎨", color: "bg-gray-600" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "Primeira Visita com 20% OFF", subtitle: "Mostre essa tela na recepção e garanta seu desconto" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── FITNESS ────────────────────────────
  {
    id: "tpl-academia",
    category: "fitness",
    categoryEmoji: "💪",
    name: "Academia",
    description: "Modelo para academias completas",
    template: {
      slug: "",
      businessName: "Power Gym",
      tagline: "Supere seus limites todos os dias",
      heroImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-zinc-950 to-neutral-900",
      bgHtml: { enabled: true, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent!important}@keyframes flicker{0%{opacity:0}5%{opacity:.9}10%{opacity:.2}15%{opacity:1}20%{opacity:.3}25%{opacity:.85}30%{opacity:0}100%{opacity:0}}@keyframes flickerB{0%{opacity:0}8%{opacity:.75}18%{opacity:.15}26%{opacity:.9}34%{opacity:0}100%{opacity:0}}@keyframes flickerC{0%{opacity:0}12%{opacity:.8}22%{opacity:.1}30%{opacity:.95}40%{opacity:0}100%{opacity:0}}@keyframes glowPulse{0%,100%{opacity:.18;transform:scale(1)}50%{opacity:.38;transform:scale(1.12)}}@keyframes glowPulse2{0%,100%{opacity:.12;transform:scale(1)}50%{opacity:.28;transform:scale(1.08)}}.bolt{position:fixed;animation:linear infinite}.glow{position:fixed;border-radius:50%;filter:blur(80px);animation:ease-in-out infinite}</style><div class="glow" style="width:420px;height:420px;background:radial-gradient(circle,rgba(249,115,22,.22),transparent 70%);top:-80px;left:50%;transform:translateX(-50%);animation-name:glowPulse;animation-duration:4s"></div><div class="glow" style="width:280px;height:280px;background:radial-gradient(circle,rgba(249,115,22,.16),transparent 70%);bottom:-60px;left:10%;animation-name:glowPulse2;animation-duration:6s;animation-delay:-2s"></div><div class="glow" style="width:200px;height:200px;background:radial-gradient(circle,rgba(251,146,60,.14),transparent 70%);top:40%;right:5%;animation-name:glowPulse2;animation-duration:5s;animation-delay:-1s"></div><svg class="bolt" style="top:18%;left:8%;width:22px;height:54px;animation-name:flicker;animation-duration:3.2s;animation-delay:0s" viewBox="0 0 22 54" fill="none"><polygon points="13,0 2,30 10,30 9,54 20,22 12,22" fill="#f97316" opacity="1"/><polygon points="13,0 2,30 10,30 9,54 20,22 12,22" fill="#fb923c" opacity=".5" style="filter:blur(3px)"/></svg><svg class="bolt" style="top:55%;right:12%;width:18px;height:44px;animation-name:flickerB;animation-duration:4.1s;animation-delay:-1.5s" viewBox="0 0 18 44" fill="none"><polygon points="11,0 1,25 8,25 7,44 17,18 10,18" fill="#f97316" opacity="1"/><polygon points="11,0 1,25 8,25 7,44 17,18 10,18" fill="#fdba74" opacity=".5" style="filter:blur(2px)"/></svg><svg class="bolt" style="top:72%;left:22%;width:26px;height:64px;animation-name:flickerC;animation-duration:2.8s;animation-delay:-0.7s" viewBox="0 0 26 64" fill="none"><polygon points="16,0 2,36 12,36 10,64 24,26 14,26" fill="#ea580c" opacity="1"/><polygon points="16,0 2,36 12,36 10,64 24,26 14,26" fill="#f97316" opacity=".6" style="filter:blur(4px)"/></svg><svg class="bolt" style="top:30%;right:5%;width:14px;height:36px;animation-name:flicker;animation-duration:3.7s;animation-delay:-2.1s" viewBox="0 0 14 36" fill="none"><polygon points="8,0 1,20 6,20 5,36 13,14 8,14" fill="#fb923c" opacity="1"/></svg><svg class="bolt" style="top:8%;right:25%;width:20px;height:50px;animation-name:flickerB;animation-duration:5.3s;animation-delay:-3.4s" viewBox="0 0 20 50" fill="none"><polygon points="12,0 1,28 9,28 8,50 19,20 11,20" fill="#f97316" opacity="1"/><polygon points="12,0 1,28 9,28 8,50 19,20 11,20" fill="#fbbf24" opacity=".4" style="filter:blur(3px)"/></svg>`, overlay: 0 },
      heroOverlayOpacity: 30,
      heroOverlayColor: "dark",
      textColor: "text-white",
      accentColor: "#f97316",
      fontFamily: "Montserrat",
      buttons: [
        { id: "1", label: "Ver Planos", subtitle: "A partir de R$89/mês 🎯", url: "", icon: "", gradientColor: "from-red-600 to-red-800", iconEmoji: "💪", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Aula Experimental", subtitle: "Grátis, sem compromisso 🎉", url: "", icon: "", gradientColor: "from-orange-500 to-orange-700", iconEmoji: "📅", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Modalidades", subtitle: "Musculação, cardio, lutas 🥊", url: "", icon: "", gradientColor: "from-amber-600 to-amber-800", iconEmoji: "🏋️", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Instagram", subtitle: "Motivação diária 🔥", url: "", icon: "", gradientColor: "from-purple-600 to-pink-600", iconEmoji: "📸", linkType: "instagram", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
      ],
      badges: [],
      floatingEmojis: ["💪", "🏋️", "🔥", "⚡"],
      blocks: [
        { id: "b1", type: "cta", order: 0, content: "🎉 Primeira Semana Grátis!", subtitle: "Venha conhecer nossa estrutura e equipe sem pagar nada" },
        { id: "b2", type: "stats", order: 1, statItems: [
          { id: "s1", value: "500+", label: "Alunos ativos" },
          { id: "s2", value: "15+", label: "Modalidades" },
          { id: "s3", value: "24h", label: "Funcionamento" },
        ]},
      ],
      pages: [],
    },
  },

  // ─────────────────────────── PET SHOP ───────────────────────────
  {
    id: "tpl-petshop",
    category: "petshop",
    categoryEmoji: "🐾",
    name: "Pet Shop",
    description: "Modelo para pet shops completos",
    template: {
      slug: "",
      businessName: "Pet & Cia",
      tagline: "Amor e cuidado para o seu melhor amigo",
      heroImage: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-amber-50 to-yellow-100",
      bgHtml: { enabled: false, html: `<style>*{margin:0;padding:0;box-sizing:border-box}@keyframes paw{0%,100%{transform:translateY(0) rotate(-5deg);opacity:.15}50%{transform:translateY(-13px) rotate(5deg);opacity:.35}}@keyframes blob{0%,100%{transform:scale(1);opacity:.12}50%{transform:scale(1.08);opacity:.26}}.p{position:fixed;font-size:18px;line-height:1;animation:paw ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(42px);animation:blob ease-in-out infinite}</style><div class="o" style="width:190px;height:190px;background:radial-gradient(circle,rgba(245,158,11,.15),transparent);top:4%;right:5%;animation-duration:8s"></div><div class="o" style="width:140px;height:140px;background:radial-gradient(circle,rgba(16,185,129,.12),transparent);bottom:10%;left:5%;animation-duration:10s;animation-delay:-3s"></div><div class="p" style="top:14%;left:5%;animation-duration:4s">🐾</div><div class="p" style="top:33%;right:7%;animation-duration:5.1s;animation-delay:-1.5s">🐾</div><div class="p" style="top:58%;left:10%;animation-duration:4.6s;animation-delay:-2.5s">🐾</div><div class="p" style="top:79%;right:9%;animation-duration:6.1s;animation-delay:-1s">🐾</div>`, overlay: 0 },
      heroOverlayOpacity: 15,
      heroOverlayColor: "light",
      textColor: "text-amber-950",
      accentColor: "#f59e0b",
      fontFamily: "Nunito",
      buttons: [
        { id: "1", label: "Banho & Tosa", subtitle: "Agende pelo WhatsApp 🛁", url: "", icon: "", gradientColor: "from-amber-500 to-amber-700", iconEmoji: "🐾", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42, buttonStyle: "pill" as const },
        { id: "2", label: "Loja de Produtos", subtitle: "Ração, brinquedos e mais 🛒", url: "", icon: "", gradientColor: "from-yellow-600 to-yellow-800", iconEmoji: "🛒", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Consulta Veterinária", subtitle: "Dr. Paulo atende 🩺", url: "", icon: "", gradientColor: "from-blue-600 to-blue-800", iconEmoji: "🩺", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Hotel para Pets", subtitle: "Cuidado 24h 🏠", url: "", icon: "", gradientColor: "from-green-600 to-green-800", iconEmoji: "🏠", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🐾", "🐕", "🐈", "❤️"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Banho & Tosa", emoji: "🛁", color: "bg-amber-500" },
          { id: "2", label: "Veterinário", emoji: "🩺", color: "bg-blue-500" },
          { id: "3", label: "Hotel Pet", emoji: "🏠", color: "bg-green-500" },
          { id: "4", label: "Loja Completa", emoji: "🛒", color: "bg-yellow-600" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "Primeiro Banho com 30% OFF", subtitle: "Válido para novos clientes — agende pelo WhatsApp" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── EDUCAÇÃO ───────────────────────────
  {
    id: "tpl-curso",
    category: "educacao",
    categoryEmoji: "📚",
    name: "Curso / Escola",
    description: "Modelo para cursos e instituições de ensino",
    template: {
      slug: "",
      businessName: "Escola Aprenda Mais",
      tagline: "Transforme sua carreira com conhecimento",
      heroImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-blue-50 to-indigo-100",
      bgHtml: { enabled: false, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent;overflow:hidden}@keyframes rise{0%{transform:translateY(12px) scale(0);opacity:0}40%{opacity:.75}80%{opacity:.28}100%{transform:translateY(-100vh) scale(1.5);opacity:0}}@keyframes float{0%,100%{transform:translateY(0);opacity:.15}50%{transform:translateY(-14px);opacity:.35}}.s{position:fixed;animation:rise ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(42px);animation:float ease-in-out infinite}</style><div class="o" style="width:180px;height:180px;background:radial-gradient(circle,rgba(99,102,241,.14),transparent);top:3%;right:5%;animation-duration:8s"></div><div class="o" style="width:130px;height:130px;background:radial-gradient(circle,rgba(59,130,246,.11),transparent);bottom:6%;left:4%;animation-duration:11s;animation-delay:-4s"></div><div class="s" style="top:18%;left:7%;font-size:14px;animation-duration:4s">⭐</div><div class="s" style="top:38%;right:9%;font-size:10px;animation-duration:5.5s;animation-delay:-1.2s">✨</div><div class="s" style="top:60%;left:16%;font-size:12px;animation-duration:6s;animation-delay:-2.5s">⭐</div><div class="s" style="top:74%;right:14%;font-size:9px;animation-duration:7s;animation-delay:-0.8s">✨</div><div class="s" style="top:85%;left:38%;font-size:11px;animation-duration:8s;animation-delay:-3.5s">⭐</div>`, overlay: 0 },
      heroOverlayOpacity: 15,
      heroOverlayColor: "light",
      textColor: "text-slate-900",
      accentColor: "#6366f1",
      fontFamily: "Poppins",
      buttons: [
        { id: "1", label: "Ver Cursos", subtitle: "Presencial e online 🎓", url: "", icon: "", gradientColor: "from-indigo-500 to-indigo-700", iconEmoji: "📚", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 42, buttonStyle: "pill" as const },
        { id: "2", label: "Matrícula Online", subtitle: "Vagas limitadas! Inscreva-se ✅", url: "", icon: "", gradientColor: "from-blue-600 to-blue-800", iconEmoji: "📝", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Falar com Consultor", subtitle: "Tire suas dúvidas 📲", url: "", icon: "", gradientColor: "from-green-600 to-green-800", iconEmoji: "💬", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
        { id: "4", label: "YouTube", subtitle: "Aulas gratuitas 🎬", url: "", icon: "", gradientColor: "from-red-600 to-red-800", iconEmoji: "▶️", linkType: "youtube", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["📚", "🎓", "✏️", "🏆"],
      blocks: [
        { id: "b1", type: "cta", order: 0, content: "🎓 Matricule-se Hoje!", subtitle: "Turmas com início imediato — vagas limitadas" },
        { id: "b2", type: "stats", order: 1, statItems: [
          { id: "s1", value: "5.000+", label: "Alunos formados" },
          { id: "s2", value: "95%", label: "Empregabilidade" },
          { id: "s3", value: "20+", label: "Cursos disponíveis" },
        ]},
      ],
      pages: [],
    },
  },

  // ─────────────────────────── IMOBILIÁRIA ────────────────────────
  {
    id: "tpl-imobiliaria",
    category: "imobiliaria",
    categoryEmoji: "🏠",
    name: "Imobiliária / Corretor",
    description: "Modelo para corretores e imobiliárias",
    template: {
      slug: "",
      businessName: "Imóveis Prime",
      tagline: "Encontre o imóvel dos seus sonhos",
      heroImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-emerald-50 to-teal-100",
      bgHtml: { enabled: false, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent;overflow:hidden}@keyframes grid{0%,100%{opacity:.04}50%{opacity:.1}}@keyframes float{0%,100%{transform:translateY(0) scale(1);opacity:.12}50%{transform:translateY(-15px) scale(1.04);opacity:.28}}.gd{position:fixed;inset:0;background-image:linear-gradient(rgba(16,185,129,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.06) 1px,transparent 1px);background-size:40px 40px;animation:grid 7s ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(50px);animation:float ease-in-out infinite}</style><div class="gd"></div><div class="o" style="width:210px;height:210px;background:radial-gradient(circle,rgba(16,185,129,.15),transparent);top:4%;right:5%;animation-duration:9s"></div><div class="o" style="width:150px;height:150px;background:radial-gradient(circle,rgba(6,182,212,.12),transparent);bottom:7%;left:5%;animation-duration:12s;animation-delay:-4.5s"></div><div class="o" style="width:100px;height:100px;background:radial-gradient(circle,rgba(5,150,105,.1),transparent);top:48%;left:42%;animation-duration:10s;animation-delay:-2s"></div>`, overlay: 0 },
      heroOverlayOpacity: 15,
      heroOverlayColor: "light",
      textColor: "text-slate-900",
      accentColor: "#0d9488",
      fontFamily: "DM Sans",
      buttons: [
        { id: "1", label: "Ver Imóveis", subtitle: "Apartamentos e casas 🏠", url: "", icon: "", gradientColor: "from-emerald-500 to-emerald-700", iconEmoji: "🏠", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42, buttonStyle: "pill" as const },
        { id: "2", label: "Agendar Visita", subtitle: "Conheça pessoalmente 🗓️", url: "", icon: "", gradientColor: "from-teal-600 to-teal-800", iconEmoji: "📅", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Simulação de Financiamento", subtitle: "Calcule seu crédito 💰", url: "", icon: "", gradientColor: "from-cyan-600 to-cyan-800", iconEmoji: "🏦", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
        { id: "4", label: "Falar com Corretor", subtitle: "Atendimento exclusivo ⭐", url: "", icon: "", gradientColor: "from-green-600 to-green-800", iconEmoji: "💬", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🏠", "🔑", "🏡", "💰"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Compra", emoji: "🏠", color: "bg-emerald-500" },
          { id: "2", label: "Venda", emoji: "💰", color: "bg-teal-500" },
          { id: "3", label: "Aluguel", emoji: "🔑", color: "bg-green-500" },
          { id: "4", label: "Lançamentos", emoji: "🏗️", color: "bg-cyan-600" },
        ]},
        { id: "b2", type: "testimonial", order: 1, content: "Encontrei meu apartamento em menos de 2 semanas. Atendimento impecável!", testimonialName: "Marcos T.", testimonialRole: "Comprador satisfeito", testimonialRating: 5 },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── AUTOMOTIVO ─────────────────────────
  {
    id: "tpl-oficina",
    category: "automotivo",
    categoryEmoji: "🔧",
    name: "Oficina Mecânica",
    description: "Modelo para oficinas e centros automotivos",
    template: {
      slug: "",
      businessName: "Auto Center Premium",
      tagline: "Seu carro em boas mãos, sempre",
      heroImage: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-gray-950 to-zinc-900",
      bgHtml: { enabled: true, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent!important}@keyframes spark{0%{transform:translate(0,0) scale(1) rotate(var(--rot));opacity:1}100%{transform:translate(var(--sx),var(--sy)) scale(0) rotate(var(--rot));opacity:0}}@keyframes flashBurst{0%,100%{opacity:0}3%{opacity:.8}8%{opacity:0}11%{opacity:.6}16%{opacity:0}}@keyframes gridFade{0%,100%{opacity:.07}50%{opacity:.11}}.spark{position:fixed;width:2px;height:2px;background:#fff;border-radius:50%;animation:spark ease-out infinite}.long{width:1px;height:6px;border-radius:1px}.burst{position:fixed;width:18px;height:18px;border-radius:50%;filter:blur(6px);animation:flashBurst ease-out infinite}</style><svg style="position:fixed;top:0;left:0;width:100%;height:100%;animation:gridFade ease-in-out 8s infinite" viewBox="0 0 400 800" preserveAspectRatio="none"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(156,163,175,.6)" stroke-width=".8"/></pattern></defs><rect width="400" height="800" fill="url(#grid)"/></svg><div class="burst" style="background:rgba(255,220,100,.85);top:35%;left:25%;animation-duration:3.2s;animation-delay:0s"></div><div class="burst" style="background:rgba(255,200,80,.75);top:60%;right:20%;animation-duration:4.5s;animation-delay:-1.5s"></div><div class="burst" style="background:rgba(255,240,120,.7);top:20%;right:35%;animation-duration:3.8s;animation-delay:-2.8s"></div><div class="spark" style="top:35%;left:25%;--sx:-28px;--sy:-35px;--rot:20deg;animation-duration:1.1s;animation-delay:0s"></div><div class="spark long" style="top:35%;left:25%;--sx:35px;--sy:-22px;--rot:-35deg;animation-duration:.9s;animation-delay:-.2s"></div><div class="spark" style="top:35%;left:25%;--sx:-40px;--sy:18px;--rot:55deg;animation-duration:1.3s;animation-delay:-.5s"></div><div class="spark" style="top:35%;left:25%;--sx:22px;--sy:40px;--rot:-10deg;animation-duration:1.0s;animation-delay:-.8s"></div><div class="spark long" style="top:35%;left:25%;--sx:-15px;--sy:-50px;--rot:70deg;animation-duration:.8s;animation-delay:-.3s"></div><div class="spark" style="top:35%;left:25%;--sx:48px;--sy:12px;--rot:-60deg;animation-duration:1.2s;animation-delay:-.7s"></div><div class="spark" style="top:60%;right:20%;--sx:-32px;--sy:-28px;--rot:15deg;animation-duration:1.4s;animation-delay:-.6s"></div><div class="spark long" style="top:60%;right:20%;--sx:38px;--sy:-38px;--rot:-45deg;animation-duration:1.0s;animation-delay:-1.0s"></div><div class="spark" style="top:60%;right:20%;--sx:-20px;--sy:42px;--rot:80deg;animation-duration:.9s;animation-delay:-.2s"></div><div class="spark" style="top:60%;right:20%;--sx:45px;--sy:25px;--rot:-25deg;animation-duration:1.1s;animation-delay:-.9s"></div><div class="spark long" style="top:60%;right:20%;--sx:-50px;--sy:15px;--rot:40deg;animation-duration:1.3s;animation-delay:-.4s"></div><div class="spark" style="top:20%;right:35%;--sx:30px;--sy:-40px;--rot:-30deg;animation-duration:1.0s;animation-delay:-1.2s"></div><div class="spark long" style="top:20%;right:35%;--sx:-42px;--sy:-20px;--rot:65deg;animation-duration:.8s;animation-delay:-.7s"></div><div class="spark" style="top:20%;right:35%;--sx:18px;--sy:45px;--rot:-55deg;animation-duration:1.2s;animation-delay:-.3s"></div><div class="spark" style="top:20%;right:35%;--sx:-25px;--sy:30px;--rot:25deg;animation-duration:.95s;animation-delay:-1.0s"></div>`, overlay: 0 },
      heroOverlayOpacity: 30,
      heroOverlayColor: "dark",
      textColor: "text-white",
      accentColor: "#6b7280",
      fontFamily: "Rubik",
      buttons: [
        { id: "1", label: "Nossos Serviços", subtitle: "Tudo para seu veículo 🛠️", url: "", icon: "", gradientColor: "from-amber-500 to-amber-700", iconEmoji: "🔧", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Agendar Revisão", subtitle: "Horário disponível 📅", url: "", icon: "", gradientColor: "from-blue-600 to-blue-800", iconEmoji: "📅", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Pedir Orçamento", subtitle: "Resposta rápida 💬", url: "", icon: "", gradientColor: "from-green-600 to-green-800", iconEmoji: "💬", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
        { id: "4", label: "Como Chegar", subtitle: "Estrada das Indústrias, 500 📍", url: "", icon: "", gradientColor: "from-zinc-600 to-zinc-800", iconEmoji: "📍", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🔧", "🚗", "⚙️", "🔩"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Mecânica Geral", emoji: "🔧", color: "bg-amber-500" },
          { id: "2", label: "Elétrica Automotiva", emoji: "⚡", color: "bg-yellow-500" },
          { id: "3", label: "Funilaria & Pintura", emoji: "🎨", color: "bg-gray-500" },
          { id: "4", label: "Alinhamento", emoji: "🚗", color: "bg-blue-600" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "Revisão Completa com Laudo", subtitle: "Diagnóstico completo para seu veículo — agende agora" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── CREATOR ────────────────────────────
  {
    id: "tpl-creator",
    category: "creator",
    categoryEmoji: "🎬",
    name: "Creator & Influencer",
    description: "Dark glassmorphism com gradiente animado para criadores de conteúdo",
    template: {
      slug: "",
      businessName: "Lucas Vieira",
      tagline: "Criador de conteúdo • Lifestyle • Tech",
      heroImage: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-violet-950 to-purple-950",
      heroOverlayOpacity: 30,
      heroOverlayColor: "dark",
      textColor: "text-white",
      accentColor: "#a855f7",
      fontFamily: "Manrope",
      bgHtml: {
        enabled: false,
        html: `<style>*{margin:0;padding:0}body{width:100%;height:100%;background:transparent;overflow:hidden}@keyframes float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-28px) scale(1.06)}}@keyframes pulse{0%,100%{opacity:.12;transform:scale(1)}50%{opacity:.32;transform:scale(1.08)}}.o{position:fixed;border-radius:50%;filter:blur(75px);animation:pulse ease-in-out infinite}</style><div class="o" style="width:420px;height:420px;background:radial-gradient(circle,rgba(168,85,247,.3),transparent);top:-100px;left:-80px;animation-duration:8s"></div><div class="o" style="width:320px;height:320px;background:radial-gradient(circle,rgba(139,92,246,.22),transparent);bottom:-60px;right:-70px;animation-duration:10s;animation-delay:-4s"></div><div class="o" style="width:220px;height:220px;background:radial-gradient(circle,rgba(236,72,153,.18),transparent);top:38%;left:38%;animation-duration:12s;animation-delay:-2.5s"></div>`,
        overlay: 30,
      },
      buttons: [
        { id: "1", label: "YouTube", subtitle: "Inscreva-se no canal 🎬", url: "", icon: "", gradientColor: "from-red-600 to-red-800", iconEmoji: "▶️", linkType: "youtube", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "2", label: "Instagram", subtitle: "Siga meu dia a dia 📸", url: "", icon: "", gradientColor: "from-purple-500 to-pink-600", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "TikTok", subtitle: "Reels e vídeos curtos 🎵", url: "", icon: "", gradientColor: "from-zinc-700 to-zinc-900", iconEmoji: "🎵", linkType: "tiktok", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Parcerias & Publi", subtitle: "Me chama para colaborar 💼", url: "", icon: "", gradientColor: "from-violet-600 to-violet-800", iconEmoji: "💼", linkType: "email", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "5", label: "Loja Oficial", subtitle: "Produtos exclusivos 🛍️", url: "", icon: "", gradientColor: "from-fuchsia-600 to-fuchsia-800", iconEmoji: "🛍️", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
      ],
      badges: [],
      floatingEmojis: ["🎬", "✨", "🔥", "💜"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "500K+", label: "Seguidores" },
          { id: "s2", value: "2M+", label: "Views/mês" },
          { id: "s3", value: "98%", label: "Engajamento" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "💜 Novo vídeo toda semana", subtitle: "Ative o sininho para não perder nenhum conteúdo" },
        { id: "b3", type: "badges", order: 2, badges: [
          { id: "1", label: "Tecnologia", emoji: "💻", color: "bg-violet-600" },
          { id: "2", label: "Lifestyle", emoji: "✨", color: "bg-purple-500" },
          { id: "3", label: "Viagens", emoji: "✈️", color: "bg-fuchsia-600" },
        ]},
      ],
      pages: [],
    },
  },

  // ─────────────────────── RESTAURANTE JAPONÊS ────────────────────
  {
    id: "tpl-japones",
    category: "japones",
    categoryEmoji: "🍱",
    name: "Restaurante Japonês",
    description: "Minimal dark com partículas de sakura animadas",
    template: {
      slug: "",
      businessName: "Sakura Sushi",
      tagline: "Gastronomia japonesa autêntica",
      heroImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-stone-950 to-red-950",
      heroOverlayOpacity: 30,
      heroOverlayColor: "dark",
      textColor: "text-white",
      accentColor: "#dc2626",
      fontFamily: "Raleway",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent;overflow:hidden}@keyframes fall{0%{transform:translateY(-30px) translateX(0) rotate(0deg) rotateY(0deg) rotateX(20deg);opacity:0}8%{opacity:.9}90%{opacity:.65}100%{transform:translateY(110vh) translateX(var(--drift)) rotate(var(--spin)) rotateY(180deg) rotateX(-10deg);opacity:0}}@keyframes sway{0%,100%{margin-left:0}50%{margin-left:var(--sway)}}.p{position:fixed;top:0;border-radius:50% 0 50% 0;animation:fall ease-in infinite;filter:drop-shadow(0 2px 4px rgba(220,38,38,.3))}</style><div class="p" style="left:4%;width:10px;height:10px;background:rgba(255,160,160,.88);--drift:45px;--spin:540deg;--sway:20px;animation-duration:7s;animation-delay:0s"></div><div class="p" style="left:13%;width:14px;height:14px;background:rgba(220,38,38,.75);--drift:-38px;--spin:-360deg;animation-duration:9s;animation-delay:-1.5s"></div><div class="p" style="left:23%;width:9px;height:9px;background:rgba(255,180,180,.9);--drift:55px;--spin:720deg;animation-duration:6.5s;animation-delay:-3.2s"></div><div class="p" style="left:33%;width:12px;height:12px;background:rgba(200,30,30,.7);--drift:-50px;--spin:-540deg;animation-duration:8.5s;animation-delay:-0.8s"></div><div class="p" style="left:44%;width:8px;height:8px;background:rgba(255,150,150,.85);--drift:30px;--spin:360deg;animation-duration:7.8s;animation-delay:-4.1s"></div><div class="p" style="left:54%;width:15px;height:15px;background:rgba(220,38,38,.65);--drift:-60px;--spin:-720deg;animation-duration:10s;animation-delay:-2.0s"></div><div class="p" style="left:63%;width:11px;height:11px;background:rgba(255,170,170,.82);--drift:42px;--spin:480deg;animation-duration:7.2s;animation-delay:-5.3s"></div><div class="p" style="left:72%;width:9px;height:9px;background:rgba(200,50,50,.78);--drift:-35px;--spin:-420deg;animation-duration:8.1s;animation-delay:-1.2s"></div><div class="p" style="left:81%;width:13px;height:13px;background:rgba(255,155,155,.87);--drift:48px;--spin:600deg;animation-duration:6.8s;animation-delay:-3.7s"></div><div class="p" style="left:90%;width:10px;height:10px;background:rgba(220,38,38,.72);--drift:-40px;--spin:-480deg;animation-duration:9.3s;animation-delay:-0.5s"></div><div class="p" style="left:8%;width:7px;height:7px;background:rgba(255,190,190,.9);--drift:25px;--spin:300deg;animation-duration:5.9s;animation-delay:-6.0s"></div><div class="p" style="left:50%;width:12px;height:12px;background:rgba(210,40,40,.68);--drift:-52px;--spin:-300deg;animation-duration:11s;animation-delay:-2.8s"></div>`,
        overlay: 20,
      },
      buttons: [
        { id: "1", label: "Cardápio Digital", subtitle: "Sushi, temaki e mais 🍣", url: "", icon: "", gradientColor: "from-red-800 to-stone-800", iconEmoji: "🍱", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Reservar Mesa", subtitle: "Experiência completa 🥢", url: "", icon: "", gradientColor: "from-red-700 to-red-900", iconEmoji: "🥢", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Delivery", subtitle: "Entrega em até 50 min 🛵", url: "", icon: "", gradientColor: "from-stone-700 to-stone-900", iconEmoji: "🛵", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Instagram", subtitle: "Arte em cada prato 📸", url: "", icon: "", gradientColor: "from-rose-700 to-red-900", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🍣", "🌸", "🥢", "🍱"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Sushi Fresco", emoji: "🐟", color: "bg-red-700" },
          { id: "2", label: "Temakeria", emoji: "🍦", color: "bg-stone-600" },
          { id: "3", label: "Sake & Drinks", emoji: "🍶", color: "bg-red-800" },
          { id: "4", label: "Omakasê", emoji: "🌸", color: "bg-rose-700" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🌸 Rodízio Completo", subtitle: "R$89,90 por pessoa — reservas pelo WhatsApp" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── CLÍNICA ESTÉTICA ───────────────────
  {
    id: "tpl-estetica",
    category: "estetica",
    categoryEmoji: "💆",
    name: "Clínica Estética",
    description: "Rose gold clean minimal para clínicas de estética avançada",
    template: {
      slug: "",
      businessName: "Espaço Áurea",
      tagline: "Beleza, bem-estar e autoconfiança",
      heroImage: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-rose-50 to-stone-100",
      bgHtml: { enabled: false, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent;overflow:hidden}@keyframes sparkle{0%,100%{transform:scale(0) rotate(0deg);opacity:0}50%{transform:scale(1) rotate(180deg);opacity:.75}}@keyframes drift{0%,100%{transform:translateY(0);opacity:.16}50%{transform:translateY(-15px);opacity:.38}}.s{position:fixed;border-radius:50%;animation:sparkle ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(45px);animation:drift ease-in-out infinite}</style><div class="o" style="width:200px;height:200px;background:radial-gradient(circle,rgba(251,113,133,.18),transparent);top:3%;right:5%;animation-duration:9s"></div><div class="o" style="width:150px;height:150px;background:radial-gradient(circle,rgba(202,138,4,.12),transparent);top:48%;left:4%;animation-duration:12s;animation-delay:-4s"></div><div class="o" style="width:110px;height:110px;background:radial-gradient(circle,rgba(244,114,182,.12),transparent);bottom:7%;right:9%;animation-duration:10s;animation-delay:-2.5s"></div><div class="s" style="width:5px;height:5px;background:rgba(244,114,182,.55);top:21%;left:9%;animation-duration:3.5s"></div><div class="s" style="width:4px;height:4px;background:rgba(202,138,4,.5);top:43%;right:11%;animation-duration:4.2s;animation-delay:-1.5s"></div><div class="s" style="width:6px;height:6px;background:rgba(251,113,133,.45);top:68%;left:21%;animation-duration:3s;animation-delay:-2s"></div><div class="s" style="width:3px;height:3px;background:rgba(244,114,182,.6);top:82%;right:7%;animation-duration:5s;animation-delay:-.6s"></div><div class="s" style="width:5px;height:5px;background:rgba(202,138,4,.45);top:55%;left:52%;animation-duration:3.8s;animation-delay:-3s"></div>`, overlay: 0 },
      heroOverlayOpacity: 12,
      heroOverlayColor: "light",
      textColor: "text-rose-900",
      accentColor: "#f43f5e",
      fontFamily: "Raleway",
      buttons: [
        { id: "1", label: "Agendar Tratamento", subtitle: "Horários disponíveis 💆", url: "", icon: "", gradientColor: "from-rose-400 to-rose-600", iconEmoji: "💆", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "2", label: "Procedimentos", subtitle: "Estética facial e corporal ✨", url: "", icon: "", gradientColor: "from-stone-600 to-stone-800", iconEmoji: "✨", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80", imagePosition: "right" as const, imageOpacity: 68, imageSize: 40 },
        { id: "3", label: "Antes & Depois", subtitle: "Resultados reais 📸", url: "", icon: "", gradientColor: "from-pink-600 to-rose-700", iconEmoji: "📸", linkType: "instagram", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1619451683944-7428d1dc2c72?w=400&q=80", imagePosition: "right" as const, imageOpacity: 68, imageSize: 40 },
        { id: "4", label: "Pacote Noiva", subtitle: "Prepare-se para o grande dia 👰", url: "", icon: "", gradientColor: "from-rose-500 to-fuchsia-700", iconEmoji: "👰", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🌸", "✨", "💆", "🌿"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Harmonização Facial", emoji: "💉", color: "bg-rose-500" },
          { id: "2", label: "Peeling & Limpeza", emoji: "🧴", color: "bg-pink-500" },
          { id: "3", label: "Modelagem Corporal", emoji: "🌿", color: "bg-stone-500" },
          { id: "4", label: "Microagulhamento", emoji: "✨", color: "bg-rose-700" },
        ]},
        { id: "b2", type: "testimonial", order: 1, content: "Resultado incrível! Em 3 sessões minha pele estava totalmente transformada.", testimonialName: "Fernanda K.", testimonialRole: "Paciente há 1 ano", testimonialRating: 5 },
        { id: "b3", type: "cta", order: 2, content: "Avaliação Facial Gratuita", subtitle: "Agende uma consulta de avaliação sem custo" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── FOTÓGRAFO ──────────────────────────
  {
    id: "tpl-fotografo",
    category: "foto",
    categoryEmoji: "📸",
    name: "Fotógrafo Profissional",
    description: "Fundo preto com grain sutil para fotógrafos e ensaios",
    template: {
      slug: "",
      businessName: "André Luz Fotografia",
      tagline: "Momentos eternizados com arte e sensibilidade",
      heroImage: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-neutral-950 to-black",
      textColor: "text-white",
      accentColor: "#a3a3a3",
      fontFamily: "DM Sans",
      bgHtml: {
        enabled: false,
        html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent;overflow:hidden}@keyframes bokeh{0%,100%{transform:translateY(0) scale(1);opacity:.1}50%{transform:translateY(-22px) scale(1.09);opacity:.26}}@keyframes shimmer{0%{transform:translateX(-120%) rotate(-30deg)}100%{transform:translateX(340%) rotate(-30deg)}}@keyframes pulse{0%,100%{opacity:.08}50%{opacity:.18}}.b{position:fixed;border-radius:50%;filter:blur(30px);animation:bokeh ease-in-out infinite}.lg{position:fixed;width:40%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);animation:shimmer 11s ease-in-out infinite}.vg{position:fixed;inset:0;background:radial-gradient(ellipse at center,transparent 35%,rgba(0,0,0,.78) 100%)}</style><div class="b" style="width:120px;height:120px;background:rgba(255,255,255,.09);top:7%;left:11%;animation-duration:7s"></div><div class="b" style="width:85px;height:85px;background:rgba(255,255,255,.07);top:54%;right:9%;animation-duration:9.5s;animation-delay:-3s"></div><div class="b" style="width:65px;height:65px;background:rgba(200,180,160,.08);top:28%;right:24%;animation-duration:11s;animation-delay:-5.5s"></div><div class="b" style="width:45px;height:45px;background:rgba(255,255,255,.07);bottom:14%;left:29%;animation-duration:8s;animation-delay:-2s"></div><div class="b" style="width:95px;height:95px;background:rgba(180,160,140,.06);bottom:28%;right:39%;animation-duration:10s;animation-delay:-6s"></div><div class="lg" style="top:24%;animation-delay:0s"></div><div class="lg" style="top:58%;animation-delay:-3.7s"></div><div class="lg" style="top:79%;animation-delay:-7.2s"></div><div class="vg"></div>`,
        overlay: 15,
      },
      buttons: [
        { id: "1", label: "Portfólio", subtitle: "Veja meu trabalho 🖼️", url: "", icon: "", gradientColor: "from-neutral-700 to-neutral-900", iconEmoji: "🖼️", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400&q=80", imagePosition: "right" as const, imageOpacity: 72, imageSize: 42 },
        { id: "2", label: "Agendar Ensaio", subtitle: "Ensaio externo ou estúdio 📅", url: "", icon: "", gradientColor: "from-zinc-600 to-zinc-800", iconEmoji: "📅", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Instagram", subtitle: "Meu feed de inspiração 📸", url: "", icon: "", gradientColor: "from-stone-600 to-stone-800", iconEmoji: "📸", linkType: "instagram", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=80", imagePosition: "right" as const, imageOpacity: 68, imageSize: 40 },
        { id: "4", label: "Orçamento", subtitle: "Casamento, família, evento 💌", url: "", icon: "", gradientColor: "from-gray-700 to-gray-900", iconEmoji: "💌", linkType: "email", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["📷", "🖤", "✨"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Ensaios de Casal", emoji: "💑", color: "bg-neutral-700" },
          { id: "2", label: "Casamentos", emoji: "💍", color: "bg-stone-700" },
          { id: "3", label: "Gestante", emoji: "🤰", color: "bg-zinc-600" },
          { id: "4", label: "Corporativo", emoji: "👔", color: "bg-gray-700" },
        ]},
        { id: "b2", type: "stats", order: 1, statItems: [
          { id: "s1", value: "500+", label: "Ensaios realizados" },
          { id: "s2", value: "8 anos", label: "De experiência" },
          { id: "s3", value: "4.9★", label: "Avaliação média" },
        ]},
      ],
      pages: [],
    },
  },

  // ─────────────────────────── MÚSICO / DJ ────────────────────────
  {
    id: "tpl-musico",
    category: "musica",
    categoryEmoji: "🎵",
    name: "Músico & DJ",
    description: "Dark neon com onda de áudio animada para artistas e DJs",
    template: {
      slug: "",
      businessName: "DJ Nexus",
      tagline: "A música que move multidões",
      heroImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-fuchsia-950 to-slate-950",
      textColor: "text-white",
      accentColor: "#e879f9",
      fontFamily: "Sora",
      bgHtml: {
        enabled: true,
        html: `<canvas id="eq" style="position:fixed;top:0;left:0;width:100%;height:100%;"></canvas><div id="scan" style="position:fixed;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(232,121,249,0.9),transparent);animation:scanMove 3s linear infinite;pointer-events:none;"></div><style>@keyframes scanMove{0%{top:-2px;}100%{top:100vh;}}</style><script>
(function(){
  var c=document.getElementById('eq');
  var ctx=c.getContext('2d');
  c.width=window.innerWidth;
  c.height=window.innerHeight;
  var barCount=55;
  var bars=[];
  var beat=0;
  var beatDir=1;
  for(var i=0;i<barCount;i++){
    bars.push({
      height:Math.random()*0.4+0.05,
      target:Math.random()*0.55+0.05,
      speed:Math.random()*0.06+0.02,
      phase:Math.random()*Math.PI*2
    });
  }
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    beat+=0.035;
    var beatMul=0.7+Math.abs(Math.sin(beat))*0.6+Math.abs(Math.sin(beat*2.3))*0.3;
    var W=c.width;
    var H=c.height;
    var barW=W/barCount;
    for(var i=0;i<barCount;i++){
      var b=bars[i];
      b.phase+=0.04+Math.random()*0.02;
      b.target=Math.min(0.85,Math.max(0.04,(Math.sin(b.phase)*0.3+0.35)*beatMul));
      b.height+=(b.target-b.height)*b.speed;
      var bh=b.height*H;
      var x=i*barW;
      var grad=ctx.createLinearGradient(x,H,x,H-bh);
      grad.addColorStop(0,'rgba(232,121,249,0.9)');
      grad.addColorStop(0.6,'rgba(240,100,255,0.75)');
      grad.addColorStop(1,'rgba(255,255,255,0.85)');
      ctx.fillStyle=grad;
      var gap=barW*0.15;
      ctx.fillRect(x+gap/2,H-bh,barW-gap,bh);
      if(b.height>0.65){
        ctx.fillStyle='rgba(255,255,255,0.9)';
        ctx.fillRect(x+gap/2,H-bh-3,barW-gap,3);
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize',function(){c.width=window.innerWidth;c.height=window.innerHeight;});
})();
</script>`,
        overlay: 35,
      },
      buttons: [
        { id: "1", label: "Ouvir no Spotify", subtitle: "Minhas músicas 🎧", url: "", icon: "", gradientColor: "from-green-600 to-green-800", iconEmoji: "🎧", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Shows & Agenda", subtitle: "Próximas datas 🎤", url: "", icon: "", gradientColor: "from-fuchsia-600 to-purple-700", iconEmoji: "🎤", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Contrato para Eventos", subtitle: "Casamentos, festas e mais 💼", url: "", icon: "", gradientColor: "from-violet-600 to-indigo-700", iconEmoji: "💼", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Instagram", subtitle: "Bastidores e clipes 📸", url: "", icon: "", gradientColor: "from-pink-600 to-fuchsia-700", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
        { id: "5", label: "YouTube", subtitle: "Clipes e sets completos ▶️", url: "", icon: "", gradientColor: "from-red-700 to-red-900", iconEmoji: "▶️", linkType: "youtube", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🎵", "🎧", "🔊", "💜"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "200+", label: "Shows realizados" },
          { id: "s2", value: "50K+", label: "Ouvintes mensais" },
          { id: "s3", value: "8 anos", label: "De carreira" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🎤 Disponível para Eventos", subtitle: "Casamentos, corporativos e festas — faça seu orçamento" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── STARTUP SAAS ───────────────────────
  {
    id: "tpl-saas",
    category: "saas",
    categoryEmoji: "🚀",
    name: "Startup SaaS",
    description: "Gradiente moderno purple-to-blue para plataformas digitais",
    template: {
      slug: "",
      businessName: "FlowAI",
      tagline: "Automatize seu negócio com inteligência artificial",
      heroImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-indigo-50 to-blue-100",
      textColor: "text-indigo-900",
      accentColor: "#6366f1",
      fontFamily: "Space Grotesk",
      bgHtml: {
        enabled: true,
        html: `<canvas id="nn" style="position:fixed;top:0;left:0;width:100%;height:100%;"></canvas><script>
(function(){
  var c=document.getElementById('nn');
  var ctx=c.getContext('2d');
  c.width=window.innerWidth;
  c.height=window.innerHeight;
  var nodeCount=70;
  var nodes=[];
  var maxDist=130;
  for(var i=0;i<nodeCount;i++){
    nodes.push({
      x:Math.random()*c.width,
      y:Math.random()*c.height,
      r:Math.random()*2.5+2,
      vx:(Math.random()-0.5)*0.6,
      vy:(Math.random()-0.5)*0.6,
      pulse:Math.random()*Math.PI*2
    });
  }
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    for(var i=0;i<nodes.length;i++){
      var n=nodes[i];
      n.pulse+=0.02;
      n.x+=n.vx;
      n.y+=n.vy;
      if(n.x<0||n.x>c.width)n.vx*=-1;
      if(n.y<0||n.y>c.height)n.vy*=-1;
      var pulseAlpha=0.5+Math.sin(n.pulse)*0.3;
      ctx.beginPath();
      ctx.arc(n.x,n.y,n.r+(Math.sin(n.pulse)*1),0,Math.PI*2);
      ctx.fillStyle='rgba(99,102,241,'+pulseAlpha+')';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(n.x,n.y,n.r*2.5,0,Math.PI*2);
      ctx.fillStyle='rgba(99,102,241,0.08)';
      ctx.fill();
    }
    for(var i=0;i<nodes.length;i++){
      for(var j=i+1;j<nodes.length;j++){
        var dx=nodes[i].x-nodes[j].x;
        var dy=nodes[i].y-nodes[j].y;
        var dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<maxDist){
          var alpha=0.25*(1-dist/maxDist);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x,nodes[i].y);
          ctx.lineTo(nodes[j].x,nodes[j].y);
          ctx.strokeStyle='rgba(99,102,241,'+alpha+')';
          ctx.lineWidth=1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize',function(){c.width=window.innerWidth;c.height=window.innerHeight;});
})();
</script>`,
        overlay: 20,
      },
      buttons: [
        { id: "1", label: "Começar Grátis", subtitle: "14 dias sem cartão 🚀", url: "", icon: "", gradientColor: "from-indigo-500 to-violet-600", iconEmoji: "🚀", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Ver Demonstração", subtitle: "Veja como funciona 👀", url: "", icon: "", gradientColor: "from-purple-600 to-purple-800", iconEmoji: "👀", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Planos e Preços", subtitle: "A partir de R$49/mês 💳", url: "", icon: "", gradientColor: "from-violet-500 to-indigo-600", iconEmoji: "💳", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Falar com Vendas", subtitle: "Plano enterprise 💼", url: "", icon: "", gradientColor: "from-blue-600 to-indigo-700", iconEmoji: "💼", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🚀", "🤖", "⚡", "💎"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "10k+", label: "Empresas ativas" },
          { id: "s2", value: "99.9%", label: "Uptime garantido" },
          { id: "s3", value: "3x", label: "Mais produtividade" },
        ]},
        { id: "b2", type: "badges", order: 1, badges: [
          { id: "1", label: "IA Integrada", emoji: "🤖", color: "bg-violet-600" },
          { id: "2", label: "API Aberta", emoji: "🔌", color: "bg-indigo-600" },
          { id: "3", label: "LGPD Compliant", emoji: "🛡️", color: "bg-blue-700" },
          { id: "4", label: "Suporte 24/7", emoji: "⚡", color: "bg-purple-700" },
        ]},
        { id: "b3", type: "cta", order: 2, content: "🤖 Experimente 14 dias grátis", subtitle: "Sem cartão de crédito, cancele quando quiser" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── PERSONAL TRAINER ───────────────────
  {
    id: "tpl-trainer",
    category: "trainer",
    categoryEmoji: "🏋️",
    name: "Personal Trainer",
    description: "Dark high-energy para personal trainers e coaches fitness",
    template: {
      slug: "",
      businessName: "Rafael Costa PT",
      tagline: "Treinamento personalizado para resultados reais",
      heroImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-orange-950 to-red-950",
      bgHtml: { enabled: true, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent!important}@keyframes ecgMove{0%{stroke-dashoffset:900}100%{stroke-dashoffset:-900}}@keyframes ecgFade{0%,100%{opacity:0}20%,80%{opacity:.85}}@keyframes particle{0%{transform:translate(0,0) scale(1);opacity:.9}100%{transform:translate(var(--px),var(--py)) scale(0);opacity:0}}@keyframes glowPulse{0%,100%{opacity:.15;transform:translate(-50%,-50%) scale(1)}50%{opacity:.35;transform:translate(-50%,-50%) scale(1.15)}}@keyframes ring{0%{transform:translate(-50%,-50%) scale(.3);opacity:.7}100%{transform:translate(-50%,-50%) scale(2.2);opacity:0}}.p{position:fixed;border-radius:50%;animation:particle ease-out infinite}.glow{position:fixed;border-radius:50%;filter:blur(70px);animation:glowPulse ease-in-out infinite}.ring{position:fixed;border-radius:50%;border:2px solid rgba(249,115,22,.6);animation:ring ease-out infinite}</style><div class="glow" style="width:380px;height:380px;background:radial-gradient(circle,rgba(249,115,22,.2),transparent 70%);top:50%;left:50%;animation-duration:3.5s"></div><div class="ring" style="width:120px;height:120px;top:50%;left:50%;animation-duration:2.4s;animation-delay:0s"></div><div class="ring" style="width:120px;height:120px;top:50%;left:50%;animation-duration:2.4s;animation-delay:-.8s"></div><div class="ring" style="width:120px;height:120px;top:50%;left:50%;animation-duration:2.4s;animation-delay:-1.6s"></div><svg style="position:fixed;top:50%;left:0;transform:translateY(-50%);width:100%;height:80px;overflow:visible" viewBox="0 0 400 80" preserveAspectRatio="none"><path d="M0,40 L60,40 L80,40 L90,10 L100,70 L110,5 L125,75 L135,40 L155,40 L165,40 L175,40 L340,40 L400,40" stroke="rgba(249,115,22,.85)" stroke-width="2.5" fill="none" stroke-dasharray="900" stroke-dashoffset="900" style="animation:ecgMove 2.4s linear infinite,ecgFade 2.4s ease-in-out infinite"/><path d="M0,40 L60,40 L80,40 L90,10 L100,70 L110,5 L125,75 L135,40 L155,40 L165,40 L175,40 L340,40 L400,40" stroke="rgba(251,146,60,.35)" stroke-width="6" fill="none" stroke-dasharray="900" stroke-dashoffset="900" style="animation:ecgMove 2.4s linear infinite,ecgFade 2.4s ease-in-out infinite;filter:blur(5px)"/></svg><div class="p" style="width:5px;height:5px;background:#f97316;top:50%;left:50%;--px:-80px;--py:-60px;animation-duration:2.0s;animation-delay:0s"></div><div class="p" style="width:4px;height:4px;background:#fb923c;top:50%;left:50%;--px:90px;--py:-45px;animation-duration:2.3s;animation-delay:-.4s"></div><div class="p" style="width:6px;height:6px;background:#dc2626;top:50%;left:50%;--px:-60px;--py:80px;animation-duration:1.8s;animation-delay:-.8s"></div><div class="p" style="width:3px;height:3px;background:#fff;top:50%;left:50%;--px:110px;--py:50px;animation-duration:2.5s;animation-delay:-.2s"></div><div class="p" style="width:5px;height:5px;background:#f97316;top:50%;left:50%;--px:-120px;--py:20px;animation-duration:2.1s;animation-delay:-1.0s"></div><div class="p" style="width:4px;height:4px;background:#fbbf24;top:50%;left:50%;--px:70px;--py:90px;animation-duration:1.9s;animation-delay:-.6s"></div><div class="p" style="width:3px;height:3px;background:#fb923c;top:50%;left:50%;--px:-40px;--py:-110px;animation-duration:2.2s;animation-delay:-1.4s"></div><div class="p" style="width:4px;height:4px;background:#dc2626;top:50%;left:50%;--px:130px;--py:-20px;animation-duration:2.6s;animation-delay:-.9s"></div><div class="p" style="width:5px;height:5px;background:#f97316;top:50%;left:50%;--px:30px;--py:-130px;animation-duration:1.7s;animation-delay:-.3s"></div><div class="p" style="width:3px;height:3px;background:#fff;top:50%;left:50%;--px:-100px;--py:-80px;animation-duration:2.4s;animation-delay:-1.2s"></div>`, overlay: 0 },
      heroOverlayOpacity: 30,
      heroOverlayColor: "dark",
      textColor: "text-white",
      accentColor: "#f97316",
      fontFamily: "Montserrat",
      buttons: [
        { id: "1", label: "Quero Treinar", subtitle: "Consultoria gratuita 💪", url: "", icon: "", gradientColor: "from-orange-500 to-orange-700", iconEmoji: "💪", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80", imagePosition: "right" as const, imageOpacity: 78, imageSize: 42 },
        { id: "2", label: "Planos Online", subtitle: "Treino + dieta 📱", url: "", icon: "", gradientColor: "from-red-600 to-red-800", iconEmoji: "📱", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80", imagePosition: "right" as const, imageOpacity: 74, imageSize: 40 },
        { id: "3", label: "Transformações", subtitle: "Resultados dos alunos 🏆", url: "", icon: "", gradientColor: "from-amber-600 to-amber-800", iconEmoji: "🏆", linkType: "instagram", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "YouTube", subtitle: "Treinos gratuitos ▶️", url: "", icon: "", gradientColor: "from-red-700 to-red-900", iconEmoji: "▶️", linkType: "youtube", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🏋️", "🔥", "💪", "⚡"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "300+", label: "Alunos transformados" },
          { id: "s2", value: "7 anos", label: "De experiência" },
          { id: "s3", value: "CREF", label: "Profissional certificado" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🔥 Consulta Gratuita", subtitle: "Avaliação física completa sem compromisso" },
        { id: "b3", type: "badges", order: 2, badges: [
          { id: "1", label: "Emagrecimento", emoji: "⚡", color: "bg-orange-600" },
          { id: "2", label: "Hipertrofia", emoji: "💪", color: "bg-red-700" },
          { id: "3", label: "Reabilitação", emoji: "🩺", color: "bg-amber-700" },
          { id: "4", label: "Online & Presencial", emoji: "📱", color: "bg-orange-700" },
        ]},
      ],
      pages: [],
    },
  },

  // ─────────────────────────── LOJA DE ROUPAS ─────────────────────
  {
    id: "tpl-moda",
    category: "moda",
    categoryEmoji: "👗",
    name: "Loja de Roupas",
    description: "Fashion minimal white para boutiques e lojas de moda",
    template: {
      slug: "",
      businessName: "Maison Élite",
      tagline: "Moda com elegância e personalidade",
      heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-stone-50 to-neutral-100",
      bgHtml: { enabled: true, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent;overflow:hidden}@keyframes scan{0%{transform:translateX(-100%);opacity:0}15%,85%{opacity:1}100%{transform:translateX(250%);opacity:0}}@keyframes float{0%,100%{transform:translateY(0) scale(1);opacity:.1}50%{transform:translateY(-14px) scale(1.03);opacity:.22}}.l{position:fixed;height:1px;background:linear-gradient(90deg,transparent,rgba(202,138,4,.3),transparent);animation:scan ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(55px);animation:float ease-in-out infinite}</style><div class="o" style="width:230px;height:230px;background:radial-gradient(circle,rgba(202,138,4,.1),transparent);top:-35px;right:-35px;animation-duration:10s"></div><div class="o" style="width:160px;height:160px;background:radial-gradient(circle,rgba(120,113,108,.08),transparent);bottom:-25px;left:-25px;animation-duration:13s;animation-delay:-5s"></div><div class="o" style="width:110px;height:110px;background:radial-gradient(circle,rgba(202,138,4,.07),transparent);top:44%;left:48%;animation-duration:11s;animation-delay:-3s"></div><div class="l" style="width:60%;top:27%;left:20%;animation-duration:8s"></div><div class="l" style="width:45%;top:55%;left:28%;animation-duration:10.5s;animation-delay:-4s"></div><div class="l" style="width:52%;top:76%;left:14%;animation-duration:9s;animation-delay:-2s"></div>`, overlay: 0 },
      heroOverlayOpacity: 10,
      heroOverlayColor: "light",
      textColor: "text-stone-900",
      accentColor: "#ca8a04",
      fontFamily: "Raleway",
      buttons: [
        { id: "1", label: "Nova Coleção", subtitle: "Verão 2025 chegou 👗", url: "", icon: "", gradientColor: "from-stone-800 to-stone-950", iconEmoji: "👗", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", imagePosition: "right" as const, imageOpacity: 80, imageSize: 45 },
        { id: "2", label: "Loja Online", subtitle: "Compre em casa 🛍️", url: "", icon: "", gradientColor: "from-zinc-700 to-zinc-900", iconEmoji: "🛍️", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80", imagePosition: "right" as const, imageOpacity: 78, imageSize: 42 },
        { id: "3", label: "WhatsApp", subtitle: "Consultoria de estilo 📲", url: "", icon: "", gradientColor: "from-green-700 to-green-900", iconEmoji: "💬", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Instagram", subtitle: "Looks & inspirações 📸", url: "", icon: "", gradientColor: "from-rose-500 to-pink-700", iconEmoji: "📸", linkType: "instagram", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
      ],
      badges: [],
      floatingEmojis: ["👗", "✨", "🌸", "💫"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Frete Grátis acima de R$199", emoji: "📦", color: "bg-stone-700" },
          { id: "2", label: "Troca em 30 dias", emoji: "✅", color: "bg-zinc-600" },
          { id: "3", label: "Parcelamento 6x", emoji: "💳", color: "bg-gray-700" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🌸 Sale até 50% OFF", subtitle: "Liquidação de inverno — peças selecionadas" },
      ],
      pages: [],
    },
  },

  // ─────────────────────── ARQUITETO / DESIGNER ───────────────────
  {
    id: "tpl-design",
    category: "design",
    categoryEmoji: "✏️",
    name: "Arquiteto & Designer de Interiores",
    description: "Brutalist minimal para arquitetos e designers",
    template: {
      slug: "",
      businessName: "Atelier Forma",
      tagline: "Espaços que inspiram, projetos que transformam",
      heroImage: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-neutral-950 to-stone-900",
      bgHtml: { enabled: false, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0908}@keyframes grid-pulse{0%,100%{opacity:.04}50%{opacity:.11}}@keyframes drift{0%,100%{transform:translateY(0) translateX(0);opacity:.18}50%{transform:translateY(-20px) translateX(6px);opacity:.42}}.gd{position:fixed;inset:0;background-image:linear-gradient(rgba(226,232,240,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(226,232,240,.05) 1px,transparent 1px);background-size:46px 46px;animation:grid-pulse 8s ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(80px);animation:drift ease-in-out infinite}</style><div class="gd"></div><div class="o" style="width:300px;height:300px;background:radial-gradient(circle,rgba(226,232,240,.07),transparent);top:-70px;right:-50px;animation-duration:10s"></div><div class="o" style="width:220px;height:220px;background:radial-gradient(circle,rgba(148,163,184,.05),transparent);bottom:-50px;left:-40px;animation-duration:13s;animation-delay:-6s"></div>`, overlay: 0 },
      heroOverlayOpacity: 30,
      heroOverlayColor: "dark",
      textColor: "text-white",
      accentColor: "#e2e8f0",
      fontFamily: "DM Sans",
      buttons: [
        { id: "1", label: "Portfólio", subtitle: "Projetos executados 🏛️", url: "", icon: "", gradientColor: "from-neutral-600 to-neutral-800", iconEmoji: "🏛️", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Solicitar Orçamento", subtitle: "Projeto personalizado 📐", url: "", icon: "", gradientColor: "from-stone-600 to-stone-800", iconEmoji: "📐", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80", imagePosition: "right" as const, imageOpacity: 72, imageSize: 40 },
        { id: "3", label: "Instagram", subtitle: "Projetos em andamento 📸", url: "", icon: "", gradientColor: "from-gray-600 to-gray-900", iconEmoji: "📸", linkType: "instagram", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80", imagePosition: "right" as const, imageOpacity: 68, imageSize: 40 },
        { id: "4", label: "Houzz / Pinterest", subtitle: "Moodboards e referências 🎨", url: "", icon: "", gradientColor: "from-zinc-700 to-zinc-900", iconEmoji: "🎨", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🏛️", "📐", "✏️", "🖤"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "80+", label: "Projetos entregues" },
          { id: "s2", value: "10 anos", label: "De experiência" },
          { id: "s3", value: "CAU", label: "Registrado" },
        ]},
        { id: "b2", type: "badges", order: 1, badges: [
          { id: "1", label: "Arquitetura Residencial", emoji: "🏠", color: "bg-neutral-600" },
          { id: "2", label: "Design de Interiores", emoji: "🛋️", color: "bg-stone-600" },
          { id: "3", label: "Reforma & Renovação", emoji: "🔨", color: "bg-zinc-600" },
          { id: "4", label: "Projetos Comerciais", emoji: "🏢", color: "bg-gray-700" },
        ]},
      ],
      pages: [],
    },
  },

  // ─────────────────────────── COACH / MENTOR ─────────────────────
  {
    id: "tpl-coach",
    category: "coach",
    categoryEmoji: "🎯",
    name: "Coach & Mentor",
    description: "Warm professional para coaches, mentores e consultores",
    template: {
      slug: "",
      businessName: "Camila Mendes Coaching",
      tagline: "Desperte seu potencial e alcance seus objetivos",
      heroImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-amber-50 to-orange-100",
      bgHtml: { enabled: false, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent}@keyframes rise{0%{transform:translateY(12px) scale(0);opacity:0}40%{opacity:.75}80%{opacity:.28}100%{transform:translateY(-100vh) scale(1.5);opacity:0}}@keyframes float{0%,100%{transform:translateY(0);opacity:.14}50%{transform:translateY(-14px);opacity:.34}}.s{position:fixed;animation:rise ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(44px);animation:float ease-in-out infinite}</style><div class="o" style="width:200px;height:200px;background:radial-gradient(circle,rgba(251,191,36,.17),transparent);top:3%;right:5%;animation-duration:8s"></div><div class="o" style="width:140px;height:140px;background:radial-gradient(circle,rgba(249,115,22,.13),transparent);bottom:8%;left:4%;animation-duration:11s;animation-delay:-4s"></div><div class="s" style="left:8%;bottom:0;font-size:10px;animation-duration:5s;animation-delay:0s">⭐</div><div class="s" style="left:22%;bottom:0;font-size:8px;animation-duration:7s;animation-delay:-2s">✨</div><div class="s" style="left:42%;bottom:0;font-size:11px;animation-duration:6s;animation-delay:-1s">⭐</div><div class="s" style="left:64%;bottom:0;font-size:8px;animation-duration:8s;animation-delay:-3.5s">✨</div><div class="s" style="left:84%;bottom:0;font-size:10px;animation-duration:5.5s;animation-delay:-4.5s">⭐</div>`, overlay: 0 },
      heroOverlayOpacity: 12,
      heroOverlayColor: "light",
      textColor: "text-amber-950",
      accentColor: "#d97706",
      fontFamily: "Outfit",
      buttons: [
        { id: "1", label: "Sessão Gratuita", subtitle: "Sessão estratégica de 30 min 🎯", url: "", icon: "", gradientColor: "from-amber-500 to-amber-700", iconEmoji: "🎯", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Programas", subtitle: "Individual e em grupo 📚", url: "", icon: "", gradientColor: "from-orange-600 to-orange-800", iconEmoji: "📚", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Podcast", subtitle: "Episódios toda semana 🎙️", url: "", icon: "", gradientColor: "from-yellow-700 to-amber-800", iconEmoji: "🎙️", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 40 },
        { id: "4", label: "Instagram", subtitle: "Conteúdo diário 📸", url: "", icon: "", gradientColor: "from-rose-600 to-pink-700", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🎯", "⭐", "🌟", "🔑"],
      blocks: [
        { id: "b1", type: "testimonial", order: 0, content: "Em 3 meses de mentoria consegui dobrar meu faturamento e finalmente ter clareza sobre meu negócio.", testimonialName: "Ricardo A.", testimonialRole: "Empresário, cliente 2024", testimonialRating: 5 },
        { id: "b2", type: "badges", order: 1, badges: [
          { id: "1", label: "Life Coaching", emoji: "🌟", color: "bg-amber-600" },
          { id: "2", label: "Business Mentoring", emoji: "🏢", color: "bg-orange-600" },
          { id: "3", label: "Liderança", emoji: "👑", color: "bg-yellow-700" },
          { id: "4", label: "Mindset", emoji: "🧠", color: "bg-amber-700" },
        ]},
        { id: "b3", type: "cta", order: 2, content: "🎯 Sessão Estratégica Grátis", subtitle: "Descubra o que está impedindo seu crescimento" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── PADARIA ────────────────────────────
  {
    id: "tpl-padaria",
    category: "padaria",
    categoryEmoji: "🥐",
    name: "Padaria & Confeitaria",
    description: "Warm cozy para padarias artesanais e confeitarias",
    template: {
      slug: "",
      businessName: "Pão & Arte",
      tagline: "Feito com carinho, sabor de lar",
      heroImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-amber-50 to-yellow-100",
      bgHtml: { enabled: true, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent;overflow:hidden}@keyframes steamUp{0%{transform:translateY(0) translateX(0) scaleX(1);opacity:0}18%{opacity:.45}60%{opacity:.3;transform:translateY(-55px) translateX(var(--sx)) scaleX(1.25)}88%{opacity:.08}100%{transform:translateY(-105px) translateX(calc(var(--sx) * -0.5)) scaleX(1.5);opacity:0}}@keyframes flourFloat{0%{transform:translateY(0) translateX(0) rotate(0deg);opacity:0}10%{opacity:.55}50%{transform:translateY(-40px) translateX(var(--fx)) rotate(180deg);opacity:.4}90%{opacity:.1}100%{transform:translateY(-85px) translateX(var(--fx2)) rotate(360deg);opacity:0}}@keyframes bgGlow{0%,100%{opacity:.09}50%{opacity:.2}}.sv{position:fixed;border-radius:50%;filter:blur(18px);animation:steamUp ease-in-out infinite}.fl{position:fixed;width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,.65);filter:blur(.5px);animation:flourFloat ease-in-out infinite}.gl{position:fixed;border-radius:50%;filter:blur(55px);animation:bgGlow ease-in-out infinite}</style><div class="gl" style="width:240px;height:180px;background:radial-gradient(ellipse,rgba(217,119,6,.12),transparent);top:5%;right:5%;animation-duration:10s"></div><div class="gl" style="width:200px;height:160px;background:radial-gradient(ellipse,rgba(245,158,11,.1),transparent);bottom:8%;left:5%;animation-duration:13s;animation-delay:-5s"></div><div class="sv" style="width:58px;height:72px;background:rgba(255,255,255,.32);bottom:9%;left:8%;--sx:10px;animation-duration:6s;animation-delay:0s"></div><div class="sv" style="width:48px;height:62px;background:rgba(255,255,255,.28);bottom:12%;left:24%;--sx:-14px;animation-duration:8s;animation-delay:-2s"></div><div class="sv" style="width:64px;height:78px;background:rgba(255,255,255,.3);bottom:7%;left:41%;--sx:12px;animation-duration:7s;animation-delay:-3.5s"></div><div class="sv" style="width:44px;height:58px;background:rgba(255,255,255,.26);bottom:10%;left:60%;--sx:-10px;animation-duration:9s;animation-delay:-1.5s"></div><div class="sv" style="width:54px;height:68px;background:rgba(255,255,255,.3);bottom:8%;left:77%;--sx:8px;animation-duration:6.5s;animation-delay:-4.5s"></div><div class="fl" style="left:15%;bottom:30%;--fx:25px;--fx2:-15px;animation-duration:7s;animation-delay:0s"></div><div class="fl" style="left:28%;bottom:45%;--fx:-20px;--fx2:12px;animation-duration:9s;animation-delay:-1.5s"></div><div class="fl" style="left:42%;bottom:25%;--fx:18px;--fx2:-22px;animation-duration:6s;animation-delay:-3s"></div><div class="fl" style="left:56%;bottom:55%;--fx:-15px;--fx2:20px;animation-duration:8s;animation-delay:-0.8s"></div><div class="fl" style="left:68%;bottom:35%;--fx:22px;--fx2:-18px;animation-duration:7.5s;animation-delay:-4s"></div><div class="fl" style="left:80%;bottom:48%;--fx:-18px;--fx2:14px;animation-duration:10s;animation-delay:-2.2s"></div><div class="fl" style="left:35%;bottom:62%;--fx:14px;--fx2:-10px;animation-duration:8.5s;animation-delay:-5s"></div><div class="fl" style="left:72%;bottom:20%;--fx:-24px;--fx2:16px;animation-duration:6.8s;animation-delay:-1.2s"></div>`, overlay: 0 },
      heroOverlayOpacity: 10,
      heroOverlayColor: "light",
      textColor: "text-stone-900",
      accentColor: "#d97706",
      fontFamily: "Nunito",
      buttons: [
        { id: "1", label: "Cardápio", subtitle: "Pães, bolos e doces 🥐", url: "", icon: "", gradientColor: "from-yellow-600 to-amber-700", iconEmoji: "🥐", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80", imagePosition: "right" as const, imageOpacity: 80, imageSize: 45 },
        { id: "2", label: "Encomendas", subtitle: "Bolos e festas especiais 🎂", url: "", icon: "", gradientColor: "from-orange-600 to-orange-800", iconEmoji: "🎂", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80", imagePosition: "right" as const, imageOpacity: 76, imageSize: 42 },
        { id: "3", label: "Café da Manhã", subtitle: "Delivery até às 10h ☕", url: "", icon: "", gradientColor: "from-amber-700 to-amber-900", iconEmoji: "☕", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80", imagePosition: "right" as const, imageOpacity: 72, imageSize: 40 },
        { id: "4", label: "Instagram", subtitle: "Receitas e novidades 📸", url: "", icon: "", gradientColor: "from-rose-600 to-pink-700", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🥐", "☕", "🍰", "🍞"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Pão Artesanal", emoji: "🍞", color: "bg-amber-700" },
          { id: "2", label: "Sem Conservantes", emoji: "🌿", color: "bg-green-700" },
          { id: "3", label: "Forno a Lenha", emoji: "🔥", color: "bg-orange-700" },
          { id: "4", label: "Glúten Free Disponível", emoji: "✅", color: "bg-yellow-700" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "☕ Assinatura Semanal", subtitle: "Pão fresquinho toda semana na sua porta — assine já!" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── CLÍNICA VETERINÁRIA ────────────────
  {
    id: "tpl-vet",
    category: "vet",
    categoryEmoji: "🐾",
    name: "Clínica Veterinária",
    description: "Fresh green para clínicas veterinárias e cuidados pet",
    template: {
      slug: "",
      businessName: "Clínica Vet Saúde Animal",
      tagline: "Cuidado especializado para seu melhor amigo",
      heroImage: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&q=80",
      bannerCurve: true,
      logoUrl: "",
      backgroundColor: "from-teal-50 to-emerald-100",
      bgHtml: { enabled: false, html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent}@keyframes paw{0%,100%{transform:translateY(0) rotate(-5deg);opacity:.15}50%{transform:translateY(-12px) rotate(5deg);opacity:.35}}@keyframes blob{0%,100%{transform:scale(1);opacity:.11}50%{transform:scale(1.08);opacity:.26}}.p{position:fixed;font-size:17px;animation:paw ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(42px);animation:blob ease-in-out infinite}</style><div class="o" style="width:190px;height:190px;background:radial-gradient(circle,rgba(13,148,136,.16),transparent);top:4%;right:6%;animation-duration:9s"></div><div class="o" style="width:130px;height:130px;background:radial-gradient(circle,rgba(16,185,129,.13),transparent);bottom:8%;left:4%;animation-duration:12s;animation-delay:-4s"></div><div class="p" style="top:14%;left:7%;animation-duration:4s">🐾</div><div class="p" style="top:36%;right:8%;animation-duration:5.5s;animation-delay:-1.5s">🐾</div><div class="p" style="top:60%;left:13%;animation-duration:4.8s;animation-delay:-2.8s">🐾</div><div class="p" style="top:80%;right:11%;animation-duration:6s;animation-delay:-1s">🐾</div>`, overlay: 0 },
      heroOverlayOpacity: 12,
      heroOverlayColor: "light",
      textColor: "text-teal-900",
      accentColor: "#0d9488",
      fontFamily: "Inter",
      buttons: [
        { id: "1", label: "Consulta Veterinária", subtitle: "Agende agora 🐾", url: "", icon: "", gradientColor: "from-teal-500 to-teal-700", iconEmoji: "🩺", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&q=80", imagePosition: "right" as const, imageOpacity: 78, imageSize: 42 },
        { id: "2", label: "Emergência 24h", subtitle: "Atendimento urgente 🚨", url: "", icon: "", gradientColor: "from-red-600 to-red-800", iconEmoji: "🚨", linkType: "phone", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 40 },
        { id: "3", label: "Serviços", subtitle: "Vacinas, cirurgia e mais 💊", url: "", icon: "", gradientColor: "from-emerald-600 to-emerald-800", iconEmoji: "💊", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "WhatsApp", subtitle: "Tire dúvidas 📲", url: "", icon: "", gradientColor: "from-green-600 to-green-800", iconEmoji: "💬", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
        { id: "5", label: "Como Chegar", subtitle: "Av. das Árvores, 300 📍", url: "", icon: "", gradientColor: "from-cyan-700 to-cyan-900", iconEmoji: "📍", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 62, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🐾", "🐕", "🐈", "💚"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Clínica Geral", emoji: "🩺", color: "bg-teal-600" },
          { id: "2", label: "Cirurgia", emoji: "🔬", color: "bg-emerald-600" },
          { id: "3", label: "Vacinação", emoji: "💉", color: "bg-green-600" },
          { id: "4", label: "Exames & Imagem", emoji: "📊", color: "bg-cyan-600" },
        ]},
        { id: "b2", type: "stats", order: 1, statItems: [
          { id: "s1", value: "5.000+", label: "Animais atendidos" },
          { id: "s2", value: "8 méd.", label: "Veterinários especializados" },
          { id: "s3", value: "24h", label: "Emergência disponível" },
        ]},
      ],
      pages: [],
    },
  },

  // ─────────────────────────── BARBEARIA VINTAGE ──────────────────
  {
    id: "tpl-barbearia-vintage",
    category: "beleza",
    categoryEmoji: "💈",
    name: "Barbearia Vintage",
    description: "Fundo listrado animado estilo barbearia clássica americana",
    template: {
      slug: "",
      businessName: "Old School Barber",
      tagline: "Tradição, estilo e navalha afiada desde 1985",
      heroImage: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-stone-950 to-red-950",
      textColor: "text-white",
      accentColor: "#b45309",
      fontFamily: "Space Grotesk",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}body{background:transparent}@keyframes scrollPole{0%{background-position:0 0}100%{background-position:0 90px}}@keyframes shimmerBg{0%{background-position:0 0}100%{background-position:60px 60px}}@keyframes razorGlow{0%,100%{opacity:0;transform:scale(.5) rotate(45deg)}45%,55%{opacity:.7;transform:scale(1.1) rotate(45deg)}}.pole{position:fixed;width:8px;top:0;bottom:0;background:repeating-linear-gradient(180deg,#c41230 0,#c41230 17px,rgba(245,245,245,.9) 17px,rgba(245,245,245,.9) 34px,#1a3a8c 34px,#1a3a8c 51px,rgba(245,245,245,.9) 51px,rgba(245,245,245,.9) 68px,#c41230 68px,#c41230 85px);animation:scrollPole 2.2s linear infinite;border-radius:4px}.diag{position:fixed;inset:0;background:repeating-linear-gradient(135deg,rgba(196,18,48,.06) 0,rgba(196,18,48,.06) 12px,transparent 12px,transparent 24px,rgba(245,245,245,.04) 24px,rgba(245,245,245,.04) 36px,transparent 36px,transparent 48px);animation:shimmerBg 8s linear infinite}.vignette{position:fixed;inset:0;background:radial-gradient(ellipse at 50% 50%,transparent 30%,rgba(0,0,0,.82) 100%)}.rz{position:fixed;width:3px;height:3px;background:radial-gradient(circle,#fef3c7,#f59e0b);border-radius:50%;box-shadow:0 0 8px 3px rgba(245,158,11,.6);animation:razorGlow ease-in-out infinite}</style><div class="diag"></div><div class="vignette"></div><div class="pole" style="left:18%;opacity:.28"></div><div class="pole" style="left:18%;opacity:.28"></div><div class="pole" style="right:18%;opacity:.22;animation-delay:-1.1s"></div><div class="pole" style="left:50%;margin-left:-4px;opacity:.14;animation-delay:-0.55s"></div><div class="rz" style="top:22%;left:28%;animation-duration:3.8s;animation-delay:0s"></div><div class="rz" style="top:45%;right:32%;animation-duration:5.2s;animation-delay:-1.4s"></div><div class="rz" style="top:68%;left:60%;animation-duration:4.1s;animation-delay:-2.8s"></div><div class="rz" style="top:35%;left:72%;animation-duration:6.0s;animation-delay:-0.7s"></div><div class="rz" style="top:78%;left:20%;animation-duration:3.5s;animation-delay:-3.5s"></div><div class="rz" style="top:15%;right:24%;animation-duration:4.7s;animation-delay:-1.9s"></div>`,
        overlay: 25,
      },
      buttons: [
        { id: "1", label: "Agendar Corte", subtitle: "Navalha e tesoura ✂️", url: "", icon: "", gradientColor: "from-red-800 to-stone-900", iconEmoji: "✂️", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "2", label: "Serviços & Preços", subtitle: "Corte, barba, pigmentação 💈", url: "", icon: "", gradientColor: "from-stone-700 to-stone-900", iconEmoji: "💈", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Instagram", subtitle: "Cortes exclusivos 🔥", url: "", icon: "", gradientColor: "from-purple-700 to-pink-700", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
        { id: "4", label: "Como Chegar", subtitle: "Rua das Palmeiras, 42 📍", url: "", icon: "", gradientColor: "from-blue-700 to-blue-900", iconEmoji: "📍", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 60, imageSize: 36 },
      ],
      badges: [],
      floatingEmojis: ["✂️", "💈", "🧔", "🔥"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Corte Clássico", emoji: "✂️", color: "bg-red-800" },
          { id: "2", label: "Barba Tradicional", emoji: "🧔", color: "bg-stone-700" },
          { id: "3", label: "Pigmentação", emoji: "🎨", color: "bg-blue-800" },
          { id: "4", label: "Navalha Reta", emoji: "🪒", color: "bg-gray-700" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "💈 Primeira Visita com 20% OFF", subtitle: "Mostre essa tela na recepção e garanta seu desconto" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── DJ BOATE ───────────────────────────
  {
    id: "tpl-dj-boate",
    category: "musica",
    categoryEmoji: "🎧",
    name: "DJ & Boate",
    description: "RGB neon scanlines com partículas coloridas para DJs e eventos noturnos",
    template: {
      slug: "",
      businessName: "DJ Vortex",
      tagline: "A noite começa quando eu ligo o som",
      heroImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-slate-950 to-purple-950",
      textColor: "text-white",
      accentColor: "#a855f7",
      fontFamily: "Sora",
      bgHtml: {
        enabled: true,
        html: `<style>
@keyframes spinVinyl{from{transform:translate(-50%,-50%) rotate(0deg);}to{transform:translate(-50%,-50%) rotate(360deg);}}
@keyframes laser1{0%{transform:translateX(-120%);}100%{transform:translateX(250vw);}}
@keyframes laser2{0%{transform:translateX(250vw);}100%{transform:translateX(-120%);}}
@keyframes laser3{0%{transform:translateX(-120%);}100%{transform:translateX(250vw);}}
@keyframes pulseGlow{0%,100%{opacity:0.4;}50%{opacity:0.85;}}
</style>
<div style="position:fixed;top:50%;left:50%;width:85vmin;height:85vmin;transform:translate(-50%,-50%);border-radius:50%;border:2px solid rgba(168,85,247,0.35);animation:spinVinyl 20s linear infinite;">
  <div style="position:absolute;inset:8%;border-radius:50%;border:1.5px solid rgba(168,85,247,0.25);"></div>
  <div style="position:absolute;inset:18%;border-radius:50%;border:1px solid rgba(168,85,247,0.2);"></div>
  <div style="position:absolute;inset:28%;border-radius:50%;border:1px solid rgba(168,85,247,0.18);"></div>
  <div style="position:absolute;inset:38%;border-radius:50%;border:1px solid rgba(168,85,247,0.15);"></div>
  <div style="position:absolute;inset:48%;border-radius:50%;border:1px solid rgba(168,85,247,0.12);"></div>
  <div style="position:absolute;inset:56%;border-radius:50%;background:rgba(168,85,247,0.08);border:2px solid rgba(168,85,247,0.3);border-radius:50%;"></div>
</div>
<div style="position:fixed;top:50%;left:50%;width:12vmin;height:12vmin;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(168,85,247,0.4),transparent 70%);animation:pulseGlow 2s ease-in-out infinite;"></div>
<div style="position:fixed;top:28%;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent 0%,rgba(168,85,247,0.0) 10%,rgba(168,85,247,0.85) 45%,rgba(255,255,255,0.9) 50%,rgba(168,85,247,0.85) 55%,rgba(168,85,247,0.0) 90%,transparent 100%);animation:laser1 4.5s linear infinite;"></div>
<div style="position:fixed;top:50%;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent 0%,rgba(168,85,247,0.0) 10%,rgba(200,120,255,0.8) 45%,rgba(255,255,255,0.9) 50%,rgba(200,120,255,0.8) 55%,rgba(168,85,247,0.0) 90%,transparent 100%);animation:laser2 6.2s linear infinite;"></div>
<div style="position:fixed;top:72%;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent 0%,rgba(168,85,247,0.0) 10%,rgba(168,85,247,0.75) 45%,rgba(255,255,255,0.85) 50%,rgba(168,85,247,0.75) 55%,rgba(168,85,247,0.0) 90%,transparent 100%);animation:laser3 5.1s linear infinite;"></div>`,
        overlay: 30,
      },
      buttons: [
        { id: "1", label: "Agenda de Shows", subtitle: "Próximas datas 🎤", url: "", icon: "", gradientColor: "from-violet-700 to-purple-900", iconEmoji: "🎤", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Contratar para Evento", subtitle: "Festas, formaturas e mais 💼", url: "", icon: "", gradientColor: "from-cyan-700 to-blue-900", iconEmoji: "💼", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "SoundCloud", subtitle: "Ouça meus sets 🎧", url: "", icon: "", gradientColor: "from-orange-600 to-orange-900", iconEmoji: "🎧", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Instagram", subtitle: "Bastidores e vídeos 📸", url: "", icon: "", gradientColor: "from-pink-700 to-fuchsia-900", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🎧", "🔊", "💜", "⚡"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "300+", label: "Eventos realizados" },
          { id: "s2", value: "10 anos", label: "De carreira" },
          { id: "s3", value: "5★", label: "Avaliação média" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🎧 Disponível para Eventos", subtitle: "Casamentos, corporativos, festas — solicite orçamento" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── CROSSFIT / FUNCIONAL ───────────────
  {
    id: "tpl-crossfit",
    category: "fitness",
    categoryEmoji: "🔥",
    name: "CrossFit & Funcional",
    description: "Partículas de fogo animadas para boxes de CrossFit e treino funcional",
    template: {
      slug: "",
      businessName: "Forge CrossFit",
      tagline: "Forje seu corpo. Quebre seus limites.",
      heroImage: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-orange-950 to-zinc-950",
      textColor: "text-white",
      accentColor: "#f97316",
      fontFamily: "Montserrat",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent!important}@keyframes flame{0%,100%{transform:scaleY(1) scaleX(1);opacity:.85}25%{transform:scaleY(1.18) scaleX(.9);opacity:1}50%{transform:scaleY(.88) scaleX(1.08);opacity:.9}75%{transform:scaleY(1.12) scaleX(.95);opacity:.95}}@keyframes flameInner{0%,100%{transform:scaleY(1) scaleX(1);opacity:.9}33%{transform:scaleY(1.22) scaleX(.85);opacity:1}66%{transform:scaleY(.9) scaleX(1.1);opacity:.8}}@keyframes spark{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--sx),var(--sy)) scale(0);opacity:0}}@keyframes glowFire{0%,100%{opacity:.25;transform:scale(1)}50%{opacity:.45;transform:scale(1.1)}}.flame{position:fixed;border-radius:50% 50% 20% 20%;transform-origin:bottom center;animation:flame ease-in-out infinite}.inner{position:fixed;border-radius:50% 50% 15% 15%;transform-origin:bottom center;animation:flameInner ease-in-out infinite}.spark{position:fixed;width:3px;height:3px;border-radius:50%;animation:spark ease-out infinite}.glow{position:fixed;border-radius:50%;filter:blur(60px);animation:glowFire ease-in-out infinite}</style><div class="glow" style="width:350px;height:250px;background:radial-gradient(ellipse,rgba(249,115,22,.28),transparent 70%);bottom:-80px;left:50%;transform:translateX(-50%);animation-duration:3.5s"></div><div class="flame" style="width:90px;height:160px;background:linear-gradient(to top,rgba(234,88,12,.95),rgba(249,115,22,.8),rgba(251,191,36,.6),transparent);bottom:0;left:calc(50% - 120px);animation-duration:2.1s;filter:blur(4px)"></div><div class="flame" style="width:130px;height:220px;background:linear-gradient(to top,rgba(220,38,38,.95),rgba(234,88,12,.85),rgba(249,115,22,.7),rgba(251,191,36,.5),transparent);bottom:0;left:calc(50% - 65px);animation-duration:1.8s;animation-delay:-.4s;filter:blur(3px)"></div><div class="flame" style="width:100px;height:175px;background:linear-gradient(to top,rgba(234,88,12,.9),rgba(249,115,22,.75),rgba(252,211,77,.5),transparent);bottom:0;left:calc(50% + 30px);animation-duration:2.4s;animation-delay:-.7s;filter:blur(4px)"></div><div class="inner" style="width:55px;height:110px;background:linear-gradient(to top,rgba(255,255,255,.6),rgba(253,230,138,.8),rgba(251,191,36,.7),transparent);bottom:0;left:calc(50% - 28px);animation-duration:1.4s;filter:blur(2px)"></div><div class="spark" style="bottom:180px;left:calc(50% - 20px);background:#fbbf24;--sx:-45px;--sy:-130px;animation-duration:1.6s;animation-delay:0s"></div><div class="spark" style="bottom:160px;left:50%;background:#fff;--sx:55px;--sy:-160px;animation-duration:2.0s;animation-delay:-.5s"></div><div class="spark" style="bottom:200px;left:calc(50% + 10px);background:#fb923c;--sx:-30px;--sy:-200px;animation-duration:1.8s;animation-delay:-1s"></div><div class="spark" style="bottom:140px;left:calc(50% - 30px);background:#fef08a;--sx:70px;--sy:-140px;animation-duration:2.3s;animation-delay:-.3s"></div><div class="spark" style="bottom:190px;left:calc(50% + 25px);background:#fff;--sx:-60px;--sy:-180px;animation-duration:1.5s;animation-delay:-.8s"></div><div class="spark" style="bottom:170px;left:calc(50% - 45px);background:#fdba74;--sx:40px;--sy:-220px;animation-duration:2.1s;animation-delay:-1.3s"></div><div class="spark" style="bottom:210px;left:calc(50% + 40px);background:#fbbf24;--sx:-80px;--sy:-160px;animation-duration:1.9s;animation-delay:-.6s"></div><div class="spark" style="width:2px;height:2px;bottom:150px;left:calc(50% + 55px);background:#fff;--sx:30px;--sy:-250px;animation-duration:2.4s;animation-delay:-1.7s"></div>`,
        overlay: 30,
      },
      buttons: [
        { id: "1", label: "Aula Experimental", subtitle: "Grátis, sem compromisso 🔥", url: "", icon: "", gradientColor: "from-orange-600 to-red-700", iconEmoji: "🔥", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Ver Planos", subtitle: "Mensalidades e pacotes 💪", url: "", icon: "", gradientColor: "from-zinc-700 to-zinc-900", iconEmoji: "💪", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Horários das Aulas", subtitle: "WOD do dia ⏰", url: "", icon: "", gradientColor: "from-amber-700 to-orange-800", iconEmoji: "⏰", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
        { id: "4", label: "Instagram", subtitle: "Treinos e resultados 📸", url: "", icon: "", gradientColor: "from-purple-700 to-pink-700", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🔥", "💪", "⚡", "🏆"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "200+", label: "Atletas no box" },
          { id: "s2", value: "6h-22h", label: "Horário de funcionamento" },
          { id: "s3", value: "8 anos", label: "De experiência" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🔥 Primeira Semana Grátis", subtitle: "Venha experimentar o método sem pagar nada" },
        { id: "b3", type: "badges", order: 2, badges: [
          { id: "1", label: "CrossFit", emoji: "🏋️", color: "bg-orange-700" },
          { id: "2", label: "Funcional", emoji: "⚡", color: "bg-red-700" },
          { id: "3", label: "Nutrição", emoji: "🥗", color: "bg-green-700" },
        ]},
      ],
      pages: [],
    },
  },

  // ─────────────────────────── DEV / FREELANCER ───────────────────
  {
    id: "tpl-dev",
    category: "saas",
    categoryEmoji: "💻",
    name: "Dev & Freelancer Tech",
    description: "Chuva de código Matrix verde para desenvolvedores e freelancers de tecnologia",
    template: {
      slug: "",
      businessName: "João Dev",
      tagline: "Transformando ideias em código. Full Stack & Mobile.",
      heroImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-green-950 to-slate-950",
      textColor: "text-white",
      accentColor: "#22c55e",
      fontFamily: "Space Grotesk",
      bgHtml: {
        enabled: true,
        html: `<canvas id="tc" style="position:fixed;top:0;left:0;width:100%;height:100%;"></canvas><script>
(function(){
  var c=document.getElementById('tc');
  var ctx=c.getContext('2d');
  c.width=window.innerWidth;
  c.height=window.innerHeight;
  var words=['const','function','return','async','await','import','export','class','interface','type','npm','git','push','pull','=>','{...}','[]','null','true','false','void','let','var','if','else','for','while','try','catch','new','this','super','extends','React','useState','useEffect','fetch','Promise','resolve','reject','map','filter','reduce','console.log'];
  var particles=[];
  for(var i=0;i<55;i++){
    particles.push({
      x:Math.random()*c.width,
      y:Math.random()*c.height,
      word:words[Math.floor(Math.random()*words.length)],
      opacity:Math.random()*0.7+0.1,
      size:Math.floor(Math.random()*6)+10,
      vx:(Math.random()-0.5)*0.4,
      vy:(Math.random()-0.5)*0.4,
      life:Math.random()*200+100,
      age:Math.floor(Math.random()*200)
    });
  }
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    for(var i=0;i<particles.length;i++){
      var p=particles[i];
      p.age++;
      var lifeRatio=p.age/p.life;
      var alpha=p.opacity*(lifeRatio<0.1?lifeRatio*10:(lifeRatio>0.8?(1-lifeRatio)*5:1));
      if(alpha<0)alpha=0;
      ctx.globalAlpha=alpha;
      ctx.fillStyle='rgba(34,197,94,1)';
      ctx.font='bold '+p.size+'px monospace';
      ctx.fillText(p.word,p.x,p.y);
      p.x+=p.vx;
      p.y+=p.vy;
      if(p.age>=p.life){
        p.x=Math.random()*c.width;
        p.y=Math.random()*c.height;
        p.word=words[Math.floor(Math.random()*words.length)];
        p.opacity=Math.random()*0.7+0.1;
        p.size=Math.floor(Math.random()*6)+10;
        p.vx=(Math.random()-0.5)*0.4;
        p.vy=(Math.random()-0.5)*0.4;
        p.life=Math.random()*200+100;
        p.age=0;
      }
    }
    ctx.globalAlpha=1;
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize',function(){c.width=window.innerWidth;c.height=window.innerHeight;});
})();
</script>`,
        overlay: 25,
      },
      buttons: [
        { id: "1", label: "Ver Portfólio", subtitle: "Projetos entregues 🖥️", url: "", icon: "", gradientColor: "from-green-700 to-emerald-900", iconEmoji: "🖥️", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Solicitar Orçamento", subtitle: "Resposta em 24h 💬", url: "", icon: "", gradientColor: "from-slate-700 to-slate-900", iconEmoji: "💬", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "GitHub", subtitle: "Projetos open source 🔗", url: "", icon: "", gradientColor: "from-zinc-700 to-zinc-900", iconEmoji: "🔗", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
        { id: "4", label: "LinkedIn", subtitle: "Currículo completo 💼", url: "", icon: "", gradientColor: "from-blue-700 to-blue-900", iconEmoji: "💼", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["💻", "⚡", "🔧", "🚀"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "React & Next.js", emoji: "⚛️", color: "bg-cyan-700" },
          { id: "2", label: "Node.js", emoji: "🟢", color: "bg-green-700" },
          { id: "3", label: "Mobile (Flutter)", emoji: "📱", color: "bg-blue-700" },
          { id: "4", label: "Banco de Dados", emoji: "🗄️", color: "bg-slate-700" },
        ]},
        { id: "b2", type: "stats", order: 1, statItems: [
          { id: "s1", value: "50+", label: "Projetos entregues" },
          { id: "s2", value: "5 anos", label: "De experiência" },
          { id: "s3", value: "100%", label: "Satisfação" },
        ]},
      ],
      pages: [],
    },
  },

  // ─────────────────────────── PODCAST / MEDIA ────────────────────
  {
    id: "tpl-podcast",
    category: "creator",
    categoryEmoji: "🎙️",
    name: "Podcast & Media",
    description: "Ondas sonoras animadas em tons vibrantes para podcasters e criadores de áudio",
    template: {
      slug: "",
      businessName: "Cast Infinito",
      tagline: "Conversas que inspiram, histórias que transformam",
      heroImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-indigo-950 to-fuchsia-950",
      textColor: "text-white",
      accentColor: "#d946ef",
      fontFamily: "Poppins",
      bgHtml: {
        enabled: true,
        html: `<canvas id="wv" style="position:fixed;top:0;left:0;width:100%;height:100%;"></canvas><script>
(function(){
  var c=document.getElementById('wv');
  var ctx=c.getContext('2d');
  c.width=window.innerWidth;
  c.height=window.innerHeight;
  var offset=0;
  var samples=220;
  var noiseArr=[];
  for(var i=0;i<samples+200;i++){noiseArr.push(Math.random());}
  function smoothNoise(t){
    var i=Math.floor(t)%noiseArr.length;
    var f=t-Math.floor(t);
    var a=noiseArr[i];
    var b=noiseArr[(i+1)%noiseArr.length];
    return a+(b-a)*(f*f*(3-2*f));
  }
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    var W=c.width;
    var H=c.height;
    var midY=H/2;
    var waveH=H*0.28;
    offset+=0.8;
    var grad=ctx.createLinearGradient(0,midY-waveH,0,midY+waveH);
    grad.addColorStop(0,'rgba(217,70,239,0.0)');
    grad.addColorStop(0.3,'rgba(217,70,239,0.6)');
    grad.addColorStop(0.5,'rgba(217,70,239,0.85)');
    grad.addColorStop(0.7,'rgba(217,70,239,0.6)');
    grad.addColorStop(1,'rgba(217,70,239,0.0)');
    ctx.strokeStyle='rgba(217,70,239,0.85)';
    ctx.lineWidth=2;
    ctx.beginPath();
    for(var x=0;x<=W;x+=2){
      var t=(x/W*samples+offset*0.08)%noiseArr.length;
      var n=smoothNoise(t);
      var sineA=Math.sin((x/W*Math.PI*6)+(offset*0.04))*0.3;
      var sineB=Math.sin((x/W*Math.PI*11)+(offset*0.07))*0.15;
      var amp=(n*2-1+sineA+sineB)*waveH;
      if(x===0){ctx.moveTo(x,midY+amp);}else{ctx.lineTo(x,midY+amp);}
    }
    ctx.stroke();
    ctx.strokeStyle='rgba(217,70,239,0.4)';
    ctx.lineWidth=1.5;
    ctx.beginPath();
    for(var x=0;x<=W;x+=2){
      var t=(x/W*samples+offset*0.08)%noiseArr.length;
      var n=smoothNoise(t);
      var sineA=Math.sin((x/W*Math.PI*6)+(offset*0.04))*0.3;
      var sineB=Math.sin((x/W*Math.PI*11)+(offset*0.07))*0.15;
      var amp=(n*2-1+sineA+sineB)*waveH;
      if(x===0){ctx.moveTo(x,midY-amp);}else{ctx.lineTo(x,midY-amp);}
    }
    ctx.stroke();
    ctx.fillStyle='rgba(217,70,239,0.06)';
    ctx.beginPath();
    ctx.moveTo(0,midY);
    for(var x=0;x<=W;x+=2){
      var t=(x/W*samples+offset*0.08)%noiseArr.length;
      var n=smoothNoise(t);
      var sineA=Math.sin((x/W*Math.PI*6)+(offset*0.04))*0.3;
      var sineB=Math.sin((x/W*Math.PI*11)+(offset*0.07))*0.15;
      var amp=(n*2-1+sineA+sineB)*waveH;
      ctx.lineTo(x,midY+amp);
    }
    ctx.lineTo(W,midY);
    ctx.closePath();
    ctx.fill();
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize',function(){c.width=window.innerWidth;c.height=window.innerHeight;});
})();
</script>`,
        overlay: 30,
      },
      buttons: [
        { id: "1", label: "Ouvir no Spotify", subtitle: "Todos os episódios 🎧", url: "", icon: "", gradientColor: "from-green-600 to-green-800", iconEmoji: "🎧", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "YouTube", subtitle: "Versão em vídeo ▶️", url: "", icon: "", gradientColor: "from-red-700 to-red-900", iconEmoji: "▶️", linkType: "youtube", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Seja Apoiador", subtitle: "Apoie o podcast 💜", url: "", icon: "", gradientColor: "from-violet-600 to-indigo-800", iconEmoji: "💜", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Instagram", subtitle: "Bastidores e clips 📸", url: "", icon: "", gradientColor: "from-fuchsia-700 to-pink-800", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🎙️", "🎧", "💜", "✨"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "150+", label: "Episódios" },
          { id: "s2", value: "80K+", label: "Ouvintes mensais" },
          { id: "s3", value: "Top 10", label: "Nas plataformas" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🎙️ Novo ep toda semana", subtitle: "Assine e ative as notificações para não perder" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── PET GOURMET ────────────────────────
  {
    id: "tpl-pet-gourmet",
    category: "petshop",
    categoryEmoji: "🐾",
    name: "Pet Gourmet & Spa",
    description: "Corações e patinhas flutuantes animados para pet shops premium",
    template: {
      slug: "",
      businessName: "Bicho Chique Pet Spa",
      tagline: "Luxo e carinho para quem você mais ama",
      heroImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-pink-50 to-amber-100",
      textColor: "text-rose-900",
      accentColor: "#f472b6",
      fontFamily: "Nunito",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent}@keyframes paw{0%,100%{transform:translateY(0) rotate(-5deg);opacity:.15}50%{transform:translateY(-12px) rotate(5deg);opacity:.35}}@keyframes sparkle{0%,100%{transform:scale(0) rotate(0deg);opacity:0}50%{transform:scale(1) rotate(180deg);opacity:.55}}@keyframes blob{0%,100%{transform:scale(1);opacity:.11}50%{transform:scale(1.08);opacity:.26}}.p{position:fixed;font-size:17px;animation:paw ease-in-out infinite}.sp{position:fixed;font-size:10px;animation:sparkle ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(42px);animation:blob ease-in-out infinite}</style><div class="o" style="width:200px;height:200px;background:radial-gradient(circle,rgba(244,114,182,.18),transparent);top:3%;right:5%;animation-duration:9s"></div><div class="o" style="width:150px;height:150px;background:radial-gradient(circle,rgba(251,191,36,.14),transparent);bottom:8%;left:4%;animation-duration:12s;animation-delay:-4s"></div><div class="p" style="top:14%;left:7%;animation-duration:4s">🐾</div><div class="p" style="top:38%;right:9%;animation-duration:5.5s;animation-delay:-1.5s">🐾</div><div class="p" style="top:62%;left:14%;animation-duration:4.8s;animation-delay:-2.8s">🐾</div><div class="p" style="top:80%;right:12%;animation-duration:6s;animation-delay:-1s">🐾</div><div class="sp" style="top:22%;left:30%;animation-duration:2.5s;animation-delay:0s">✨</div><div class="sp" style="top:48%;right:25%;animation-duration:3s;animation-delay:-.8s">🌸</div><div class="sp" style="top:68%;left:50%;animation-duration:2.8s;animation-delay:-1.5s">✨</div><div class="sp" style="top:10%;right:40%;animation-duration:3.5s;animation-delay:-.4s">🌸</div>`,
        overlay: 25,
      },
      buttons: [
        { id: "1", label: "Banho & Tosa Gourmet", subtitle: "Com produtos premium 🛁", url: "", icon: "", gradientColor: "from-pink-600 to-rose-800", iconEmoji: "🛁", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Spa para Pets", subtitle: "Massagem, aromaterapia 💆", url: "", icon: "", gradientColor: "from-amber-600 to-amber-800", iconEmoji: "💆", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Loja Premium", subtitle: "Rações e acessórios 🛒", url: "", icon: "", gradientColor: "from-purple-600 to-purple-800", iconEmoji: "🛒", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
        { id: "4", label: "Instagram", subtitle: "Fotos fofas 📸", url: "", icon: "", gradientColor: "from-rose-600 to-pink-800", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🐾", "🌸", "💖", "⭐"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Banho Aromaterapia", emoji: "🌸", color: "bg-pink-600" },
          { id: "2", label: "Tosa Artística", emoji: "✂️", color: "bg-rose-600" },
          { id: "3", label: "Spa Completo", emoji: "💆", color: "bg-amber-600" },
          { id: "4", label: "Hotel Boutique", emoji: "🏠", color: "bg-purple-600" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🐾 Pacote Spa Premium", subtitle: "Banho + tosa + perfume + laço — agende agora" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── RESTAURANTE GOURMET ────────────────
  {
    id: "tpl-gourmet",
    category: "delivery",
    categoryEmoji: "🍽️",
    name: "Restaurante Gourmet",
    description: "Partículas douradas flutuantes para restaurantes premium e alta gastronomia",
    template: {
      slug: "",
      businessName: "Bistrô Áurea",
      tagline: "Alta gastronomia com alma e sofisticação",
      heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-amber-50 to-stone-100",
      textColor: "text-stone-900",
      accentColor: "#ca8a04",
      fontFamily: "Raleway",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent;overflow:hidden}@keyframes steamRise{0%{transform:translateY(0) translateX(0) scaleX(1);opacity:0}15%{opacity:.32}55%{opacity:.22;transform:translateY(-45px) translateX(8px) scaleX(1.15)}85%{opacity:.08}100%{transform:translateY(-90px) translateX(-6px) scaleX(1.3);opacity:0}}@keyframes steamRise2{0%{transform:translateY(0) translateX(0) scaleX(1);opacity:0}15%{opacity:.28}55%{opacity:.18;transform:translateY(-50px) translateX(-10px) scaleX(1.2)}85%{opacity:.06}100%{transform:translateY(-100px) translateX(8px) scaleX(1.35);opacity:0}}@keyframes ambientGlow{0%,100%{opacity:.1;transform:scale(1)}50%{opacity:.22;transform:scale(1.08)}}.sv{position:fixed;border-radius:50%;filter:blur(22px);animation:steamRise ease-in-out infinite}.sv2{position:fixed;border-radius:50%;filter:blur(26px);animation:steamRise2 ease-in-out infinite}.ag{position:fixed;border-radius:50%;filter:blur(60px);animation:ambientGlow ease-in-out infinite}</style><div class="ag" style="width:280px;height:200px;background:radial-gradient(ellipse,rgba(202,138,4,.13),transparent);top:0;left:-40px;animation-duration:9s"></div><div class="ag" style="width:220px;height:180px;background:radial-gradient(ellipse,rgba(212,175,55,.11),transparent);top:10%;right:-30px;animation-duration:12s;animation-delay:-4s"></div><div class="ag" style="width:180px;height:150px;background:radial-gradient(ellipse,rgba(202,138,4,.09),transparent);bottom:10%;left:30%;animation-duration:11s;animation-delay:-6s"></div><div class="sv" style="width:55px;height:70px;background:rgba(202,138,4,.18);bottom:10%;left:10%;animation-duration:6.5s;animation-delay:0s"></div><div class="sv2" style="width:45px;height:60px;background:rgba(212,175,55,.15);bottom:13%;left:25%;animation-duration:8s;animation-delay:-1.8s"></div><div class="sv" style="width:60px;height:75px;background:rgba(202,138,4,.16);bottom:8%;left:42%;animation-duration:7.2s;animation-delay:-3.5s"></div><div class="sv2" style="width:42px;height:55px;background:rgba(180,120,10,.14);bottom:11%;left:60%;animation-duration:9s;animation-delay:-2.2s"></div><div class="sv" style="width:52px;height:68px;background:rgba(212,175,55,.17);bottom:9%;left:76%;animation-duration:6.8s;animation-delay:-4.8s"></div><div class="sv2" style="width:48px;height:62px;background:rgba(202,138,4,.15);bottom:14%;right:5%;animation-duration:7.8s;animation-delay:-1.1s"></div>`,
        overlay: 20,
      },
      buttons: [
        { id: "1", label: "Reservar Mesa", subtitle: "Jantar especial 🕯️", url: "", icon: "", gradientColor: "from-yellow-800 to-stone-900", iconEmoji: "🕯️", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Cardápio Degustação", subtitle: "Menu executivo 🍽️", url: "", icon: "", gradientColor: "from-stone-700 to-stone-900", iconEmoji: "🍽️", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Wine List", subtitle: "Carta de vinhos 🍷", url: "", icon: "", gradientColor: "from-red-800 to-red-950", iconEmoji: "🍷", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
        { id: "4", label: "Instagram", subtitle: "Arte em cada prato 📸", url: "", icon: "", gradientColor: "from-amber-700 to-amber-900", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🍽️", "🥂", "🌟", "🕯️"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Alta Gastronomia", emoji: "🍽️", color: "bg-yellow-800" },
          { id: "2", label: "Menu Degustação", emoji: "✨", color: "bg-stone-700" },
          { id: "3", label: "Carta de Vinhos", emoji: "🍷", color: "bg-red-800" },
          { id: "4", label: "Eventos Privados", emoji: "🎊", color: "bg-amber-800" },
        ]},
        { id: "b2", type: "testimonial", order: 1, content: "Uma experiência gastronômica inesquecível. Cada prato é uma obra de arte.", testimonialName: "Carolina M.", testimonialRole: "Crítica gastronômica", testimonialRating: 5 },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── EDUCAÇÃO DIGITAL ───────────────────
  {
    id: "tpl-edu-digital",
    category: "educacao",
    categoryEmoji: "🎓",
    name: "Educação Digital & EAD",
    description: "Rede neural animada para cursos online, EAD e criadores de conteúdo educativo",
    template: {
      slug: "",
      businessName: "EduTech Academy",
      tagline: "Aprenda no seu ritmo, evolua sem limites",
      heroImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-blue-50 to-indigo-100",
      textColor: "text-slate-900",
      accentColor: "#6366f1",
      fontFamily: "Poppins",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}body{width:100%;height:100%;background:transparent;overflow:hidden}canvas{position:absolute;inset:0}</style><canvas id="c"></canvas><script>(function(){var c=document.getElementById('c'),ctx=c.getContext('2d');c.width=window.innerWidth||400;c.height=window.innerHeight||700;var N=20,nodes=[];for(var i=0;i<N;i++)nodes.push({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:1.5+Math.random()*2});function draw(){ctx.clearRect(0,0,c.width,c.height);for(var i=0;i<N;i++){var n=nodes[i];n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>c.width)n.vx*=-1;if(n.y<0||n.y>c.height)n.vy*=-1;for(var j=i+1;j<N;j++){var m=nodes[j],dx=m.x-n.x,dy=m.y-n.y,d=Math.sqrt(dx*dx+dy*dy);if(d<130){ctx.strokeStyle='rgba(79,70,229,'+(1-d/130)*.2+')';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.lineTo(m.x,m.y);ctx.stroke()}}ctx.fillStyle='rgba(99,102,241,.5)';ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,6.28);ctx.fill()}requestAnimationFrame(draw)}draw()})()</script>`,
        overlay: 0,
      },
      buttons: [
        { id: "1", label: "Ver Cursos", subtitle: "Online e ao vivo 🎓", url: "", icon: "", gradientColor: "from-blue-600 to-blue-800", iconEmoji: "🎓", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Aula Gratuita", subtitle: "Experimente hoje mesmo 🎁", url: "", icon: "", gradientColor: "from-indigo-600 to-indigo-800", iconEmoji: "🎁", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Área do Aluno", subtitle: "Acesse sua conta 🔐", url: "", icon: "", gradientColor: "from-cyan-700 to-cyan-900", iconEmoji: "🔐", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
        { id: "4", label: "YouTube", subtitle: "Conteúdo gratuito ▶️", url: "", icon: "", gradientColor: "from-red-600 to-red-800", iconEmoji: "▶️", linkType: "youtube", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🎓", "💡", "📱", "🚀"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "30K+", label: "Alunos ativos" },
          { id: "s2", value: "50+", label: "Cursos disponíveis" },
          { id: "s3", value: "4.9★", label: "Avaliação média" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🎁 Primeira Aula Grátis", subtitle: "Sem cartão de crédito — comece hoje mesmo" },
        { id: "b3", type: "badges", order: 2, badges: [
          { id: "1", label: "Certificado Reconhecido", emoji: "📜", color: "bg-blue-700" },
          { id: "2", label: "Mentoria ao Vivo", emoji: "💬", color: "bg-indigo-700" },
          { id: "3", label: "Acesso Vitalício", emoji: "♾️", color: "bg-cyan-700" },
        ]},
      ],
      pages: [],
    },
  },

  // ══════════════════════ CATEGORIA: EFEITOS ANIMADOS ══════════════════════

  // ─── HACKER / MATRIX ────────────────────────────────────────────
  {
    id: "tpl-hacker",
    category: "animados",
    categoryEmoji: "💻",
    name: "Hacker & Matrix",
    description: "Chuva de código Matrix — letras verdes neon descendo numa tela de hacker cinematográfica",
    template: {
      slug: "",
      businessName: "0x4C756361732056",
      tagline: "> SYSTEM ONLINE — INITIALIZING SEQUENCE_",
      heroImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-green-950 to-slate-950",
      textColor: "text-white",
      accentColor: "#22c55e",
      fontFamily: "Space Grotesk",
      bgHtml: {
        enabled: true,
        html: `<canvas id="mc" style="position:fixed;top:0;left:0;width:100%;height:100%;"></canvas><script>
(function(){
  var c=document.getElementById('mc');
  var ctx=c.getContext('2d');
  var W=c.width=window.innerWidth;
  var H=c.height=window.innerHeight;
  var fontSize=13;
  var cols=Math.floor(W/fontSize);
  var drops=[];
  var chars='01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ';
  for(var i=0;i<cols;i++){drops[i]=Math.random()*-100;}
  function draw(){
    ctx.fillStyle='rgba(0,10,2,0.06)';
    ctx.fillRect(0,0,W,H);
    for(var i=0;i<drops.length;i++){
      var ch=chars[Math.floor(Math.random()*chars.length)];
      var yPos=drops[i]*fontSize;
      if(yPos>0&&yPos<H){
        ctx.fillStyle='rgba(255,255,255,0.95)';
        ctx.font='bold '+fontSize+'px monospace';
        ctx.fillText(ch,i*fontSize,yPos);
        if(drops[i]>1){
          ctx.fillStyle='rgba(34,197,94,0.85)';
          ctx.font=fontSize+'px monospace';
          ctx.fillText(chars[Math.floor(Math.random()*chars.length)],i*fontSize,yPos-fontSize);
        }
        if(drops[i]>2){
          ctx.fillStyle='rgba(34,197,94,0.55)';
          ctx.fillText(chars[Math.floor(Math.random()*chars.length)],i*fontSize,yPos-fontSize*2);
        }
        if(drops[i]>4){
          ctx.fillStyle='rgba(34,197,94,0.25)';
          ctx.fillText(chars[Math.floor(Math.random()*chars.length)],i*fontSize,yPos-fontSize*4);
        }
      }
      drops[i]+=0.5+Math.random()*0.5;
      if(drops[i]*fontSize>H&&Math.random()>0.975){drops[i]=0;}
    }
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize',function(){
    W=c.width=window.innerWidth;
    H=c.height=window.innerHeight;
    cols=Math.floor(W/fontSize);
    drops=[];
    for(var i=0;i<cols;i++){drops[i]=Math.random()*-100;}
  });
})();
</script>`,
        overlay: 15,
      },
      buttons: [
        { id: "1", label: "GitHub", subtitle: "// open source projects", url: "", icon: "", gradientColor: "from-green-900 to-black", iconEmoji: "💻", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "2", label: "Portfólio", subtitle: "// projetos e sistemas", url: "", icon: "", gradientColor: "from-emerald-900 to-black", iconEmoji: "🖥️", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "LinkedIn", subtitle: "// network protocols", url: "", icon: "", gradientColor: "from-cyan-900 to-black", iconEmoji: "🔗", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
        { id: "4", label: "Contato", subtitle: "// send_message()", url: "", icon: "", gradientColor: "from-teal-900 to-black", iconEmoji: "📡", linkType: "email", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["💻", "⚡", "🔒", "🛸"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Full Stack", emoji: "⚙️", color: "bg-green-900" },
          { id: "2", label: "DevSecOps", emoji: "🔒", color: "bg-emerald-900" },
          { id: "3", label: "IA & ML", emoji: "🤖", color: "bg-teal-900" },
          { id: "4", label: "Cloud Arch", emoji: "☁️", color: "bg-cyan-900" },
        ]},
        { id: "b2", type: "stats", order: 1, statItems: [
          { id: "s1", value: "100+", label: "Repositórios" },
          { id: "s2", value: "7 anos", label: "Escrevendo código" },
          { id: "s3", value: "99.9%", label: "Uptime dos projetos" },
        ]},
      ],
      pages: [],
    },
  },

  // ─── SPACE / COSMOS ─────────────────────────────────────────────
  {
    id: "tpl-cosmos",
    category: "animados",
    categoryEmoji: "🌌",
    name: "Cosmos & Espaço",
    description: "Campo de estrelas com nebulosa animada — para criadores de conteúdo de astronomia, ficção científica ou visual impactante",
    template: {
      slug: "",
      businessName: "Cosmos Studio",
      tagline: "Explorando o universo através da arte e da ciência",
      heroImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-indigo-950 to-slate-950",
      textColor: "text-white",
      accentColor: "#818cf8",
      fontFamily: "Raleway",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}body{background:transparent;overflow:hidden;width:100%;height:100%}canvas{position:fixed;inset:0;width:100%;height:100%}</style><canvas id="c"></canvas><script>(function(){var c=document.getElementById('c'),ctx=c.getContext('2d'),W,H;function resize(){W=c.width=window.innerWidth||400;H=c.height=window.innerHeight||700}resize();window.addEventListener('resize',resize);var stars=[];for(var i=0;i<160;i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.8+.3,t:Math.random()*Math.PI*2,sp:Math.random()*.02+.005});var shoots=[];var shootTimer=0;function addShoot(){shoots.push({x:Math.random()*W*.6,y:Math.random()*H*.4,vx:3+Math.random()*4,vy:1.5+Math.random()*2,len:0,maxLen:120+Math.random()*80,a:1})}function draw(){ctx.clearRect(0,0,W,H);var ng1=ctx.createRadialGradient(W*.15,H*.25,0,W*.15,H*.25,W*.35);ng1.addColorStop(0,'rgba(129,140,248,.07)');ng1.addColorStop(1,'transparent');ctx.fillStyle=ng1;ctx.fillRect(0,0,W,H);var ng2=ctx.createRadialGradient(W*.8,H*.65,0,W*.8,H*.65,W*.28);ng2.addColorStop(0,'rgba(167,139,250,.05)');ng2.addColorStop(1,'transparent');ctx.fillStyle=ng2;ctx.fillRect(0,0,W,H);var ng3=ctx.createRadialGradient(W*.5,H*.1,0,W*.5,H*.1,W*.22);ng3.addColorStop(0,'rgba(99,102,241,.04)');ng3.addColorStop(1,'transparent');ctx.fillStyle=ng3;ctx.fillRect(0,0,W,H);stars.forEach(function(s){s.t+=s.sp;var op=.45+.45*Math.sin(s.t);var r=s.r;ctx.fillStyle='rgba(255,255,255,'+op.toFixed(2)+')';ctx.beginPath();ctx.arc(s.x,s.y,r,0,6.2832);ctx.fill()});shootTimer++;if(shootTimer>180){shootTimer=0;addShoot()}shoots.forEach(function(sh,i){sh.len+=sh.vx;sh.a=Math.max(0,1-sh.len/sh.maxLen);var x2=sh.x+sh.vx*(sh.len/sh.vx),y2=sh.y+sh.vy*(sh.len/sh.vx);var grad=ctx.createLinearGradient(sh.x,sh.y,x2,y2);grad.addColorStop(0,'transparent');grad.addColorStop(.4,'rgba(255,255,255,'+sh.a.toFixed(2)+')');grad.addColorStop(1,'rgba(200,210,255,'+(sh.a*.8).toFixed(2)+')');ctx.strokeStyle=grad;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sh.x,sh.y);ctx.lineTo(x2,y2);ctx.stroke();sh.x+=sh.vx;sh.y+=sh.vy;if(sh.len>=sh.maxLen)shoots.splice(i,1)});requestAnimationFrame(draw)}draw()})()</script>`,
        overlay: 20,
      },
      buttons: [
        { id: "1", label: "YouTube", subtitle: "Documentários e vídeos 🔭", url: "", icon: "", gradientColor: "from-red-700 to-red-900", iconEmoji: "▶️", linkType: "youtube", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Instagram", subtitle: "Fotos do cosmos 📸", url: "", icon: "", gradientColor: "from-indigo-700 to-purple-900", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Loja de Prints", subtitle: "Arte espacial para sua parede 🖼️", url: "", icon: "", gradientColor: "from-violet-700 to-indigo-900", iconEmoji: "🖼️", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
        { id: "4", label: "Newsletter", subtitle: "Notícias do cosmos 📡", url: "", icon: "", gradientColor: "from-cyan-800 to-blue-950", iconEmoji: "📡", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🌌", "⭐", "🪐", "🚀"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "500+", label: "Fotos do universo" },
          { id: "s2", value: "200K+", label: "Seguidores" },
          { id: "s3", value: "50+", label: "Países alcançados" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🌌 Junte-se à exploração", subtitle: "Inscreva-se e receba o cosmos na sua tela toda semana" },
      ],
      pages: [],
    },
  },

  // ─── AURORA BOREAL ──────────────────────────────────────────────
  {
    id: "tpl-aurora",
    category: "animados",
    categoryEmoji: "🌌",
    name: "Aurora Boreal",
    description: "Aurora boreal com cores hipnóticas animadas — para artistas, coaches e marcas com identidade única",
    template: {
      slug: "",
      businessName: "Aurora Creative",
      tagline: "Onde criatividade encontra magia",
      heroImage: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-teal-950 to-indigo-950",
      textColor: "text-white",
      accentColor: "#5eead4",
      fontFamily: "Outfit",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}body{background:transparent;overflow:hidden;width:100%;height:100%}@keyframes a1{0%,100%{transform:translateY(0) scaleX(1) skewX(0deg);opacity:.28}33%{transform:translateY(-28px) scaleX(1.1) skewX(4deg);opacity:.52}66%{transform:translateY(12px) scaleX(.95) skewX(-3deg);opacity:.35}}@keyframes a2{0%,100%{transform:translateY(0) scaleX(1) skewX(0deg);opacity:.22}40%{transform:translateY(-20px) scaleX(1.08) skewX(-5deg);opacity:.46}75%{transform:translateY(16px) scaleX(1.04) skewX(2deg);opacity:.3}}@keyframes a3{0%,100%{transform:translateY(0) scaleX(1);opacity:.18}50%{transform:translateY(-18px) scaleX(1.12);opacity:.4}}@keyframes orb{0%,100%{transform:scale(1);opacity:.1}50%{transform:scale(1.2);opacity:.22}}@keyframes drift{0%,100%{transform:translateX(0) translateY(0);opacity:.08}50%{transform:translateX(20px) translateY(-15px);opacity:.18}}.band{position:fixed;width:110%;left:-5%;filter:blur(70px);border-radius:60%}.orb{position:fixed;border-radius:50%;filter:blur(90px);animation:orb ease-in-out infinite}</style><div class="band" style="height:220px;top:2%;background:linear-gradient(90deg,rgba(20,184,166,.0) 0%,rgba(94,234,212,.55) 20%,rgba(99,102,241,.45) 50%,rgba(94,234,212,.4) 80%,rgba(20,184,166,.0) 100%);animation:a1 13s ease-in-out infinite"></div><div class="band" style="height:180px;top:28%;background:linear-gradient(90deg,rgba(99,102,241,.0) 0%,rgba(20,184,166,.5) 15%,rgba(139,92,246,.42) 55%,rgba(94,234,212,.35) 85%,rgba(99,102,241,.0) 100%);animation:a2 17s ease-in-out infinite;animation-delay:-6s"></div><div class="band" style="height:160px;top:52%;background:linear-gradient(90deg,rgba(139,92,246,.0) 0%,rgba(6,182,212,.38) 25%,rgba(94,234,212,.45) 60%,rgba(139,92,246,.3) 90%,rgba(139,92,246,.0) 100%);animation:a3 21s ease-in-out infinite;animation-delay:-11s"></div><div class="orb" style="width:280px;height:280px;background:rgba(20,184,166,.08);top:-40px;left:-60px;animation-duration:16s"></div><div class="orb" style="width:240px;height:240px;background:rgba(99,102,241,.07);bottom:-40px;right:-50px;animation-duration:20s;animation-delay:-9s"></div>`,
        overlay: 20,
      },
      buttons: [
        { id: "1", label: "Meu Trabalho", subtitle: "Portfolio e projetos ✨", url: "", icon: "", gradientColor: "from-teal-700 to-teal-900", iconEmoji: "✨", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Instagram", subtitle: "Arte e inspiração 🌈", url: "", icon: "", gradientColor: "from-indigo-700 to-purple-900", iconEmoji: "🌈", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Mentoria", subtitle: "Sessão 1:1 disponível 🧭", url: "", icon: "", gradientColor: "from-cyan-700 to-teal-900", iconEmoji: "🧭", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
        { id: "4", label: "Newsletter", subtitle: "Criatividade toda semana 💌", url: "", icon: "", gradientColor: "from-violet-700 to-indigo-900", iconEmoji: "💌", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🌌", "✨", "🎨", "💎"],
      blocks: [
        { id: "b1", type: "cta", order: 0, content: "🌌 Sessão Gratuita de Mentoria", subtitle: "30 minutos para transformar sua visão criativa em realidade" },
        { id: "b2", type: "badges", order: 1, badges: [
          { id: "1", label: "Criação de Conteúdo", emoji: "✨", color: "bg-teal-700" },
          { id: "2", label: "Branding Pessoal", emoji: "🎨", color: "bg-indigo-700" },
          { id: "3", label: "Mentoria Criativa", emoji: "🧭", color: "bg-cyan-700" },
        ]},
      ],
      pages: [],
    },
  },

  // ─── NEON CITY / CYBERPUNK ───────────────────────────────────────
  {
    id: "tpl-neon-city",
    category: "animados",
    categoryEmoji: "🌃",
    name: "Neon City",
    description: "Cidade cyberpunk com luzes neon refletindo na chuva — visual cinematográfico para marcas ousadas",
    template: {
      slug: "",
      businessName: "NX Studio",
      tagline: "Creative direction for the future",
      heroImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-slate-950 to-fuchsia-950",
      textColor: "text-white",
      accentColor: "#e879f9",
      fontFamily: "Sora",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}body{background:transparent;overflow:hidden;width:100%;height:100%}@keyframes scan{0%{top:-2px;opacity:0}5%{opacity:1}90%{opacity:.8}100%{top:100%;opacity:0}}@keyframes scan2{0%{top:-2px;opacity:0}8%{opacity:.7}88%{opacity:.5}100%{top:100%;opacity:0}}@keyframes orb{0%,100%{transform:scale(1);opacity:.22}50%{transform:scale(1.12);opacity:.35}}@keyframes grid-pulse{0%,100%{opacity:.06}50%{opacity:.13}}.grid{position:fixed;inset:0;background-image:linear-gradient(rgba(232,121,249,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(232,121,249,.1) 1px,transparent 1px);background-size:40px 40px;animation:grid-pulse 4s ease-in-out infinite}.orb{position:fixed;border-radius:50%;filter:blur(90px);animation:orb ease-in-out infinite}.beam{position:fixed;left:0;right:0;height:2px;animation:scan linear infinite}.beam2{position:fixed;left:0;right:0;height:1px;animation:scan2 linear infinite}</style><div class="grid"></div><div class="orb" style="width:380px;height:380px;background:rgba(232,121,249,.18);top:-100px;left:-80px;animation-duration:8s"></div><div class="orb" style="width:300px;height:300px;background:rgba(168,85,247,.14);bottom:-70px;right:-60px;animation-duration:11s;animation-delay:-5s"></div><div class="orb" style="width:200px;height:200px;background:rgba(232,121,249,.1);top:35%;left:50%;animation-duration:7s;animation-delay:-3s"></div><div class="beam" style="background:linear-gradient(90deg,transparent 0%,rgba(232,121,249,.0) 10%,rgba(232,121,249,.7) 40%,rgba(255,255,255,.9) 50%,rgba(232,121,249,.7) 60%,rgba(232,121,249,.0) 90%,transparent 100%);animation-duration:6s;box-shadow:0 0 8px rgba(232,121,249,.6)"></div><div class="beam2" style="background:linear-gradient(90deg,transparent,rgba(232,121,249,.4),transparent);animation-duration:9s;animation-delay:-4s"></div>`,
        overlay: 35,
      },
      buttons: [
        { id: "1", label: "Portfólio", subtitle: "Work & projects", url: "", icon: "", gradientColor: "from-fuchsia-700 to-purple-900", iconEmoji: "🎨", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Instagram", subtitle: "Visual diary", url: "", icon: "", gradientColor: "from-pink-700 to-fuchsia-900", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Behance", subtitle: "Design projects", url: "", icon: "", gradientColor: "from-blue-700 to-indigo-900", iconEmoji: "🖌️", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
        { id: "4", label: "Contact", subtitle: "Let's create together", url: "", icon: "", gradientColor: "from-cyan-700 to-blue-950", iconEmoji: "✉️", linkType: "email", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🌃", "✨", "🎨", "⚡"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Motion Design", emoji: "🎬", color: "bg-fuchsia-700" },
          { id: "2", label: "Brand Identity", emoji: "🎨", color: "bg-purple-700" },
          { id: "3", label: "UI/UX Design", emoji: "✏️", color: "bg-indigo-700" },
          { id: "4", label: "3D & CGI", emoji: "🔮", color: "bg-pink-700" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🌃 Projetos criativos sob medida", subtitle: "Direção de arte para marcas que querem se destacar" },
      ],
      pages: [],
    },
  },

  // ─── PARTÍCULAS DOURADAS ─────────────────────────────────────────
  {
    id: "tpl-golden-luxury",
    category: "animados",
    categoryEmoji: "✨",
    name: "Luxo Dourado",
    description: "Partículas douradas com efeito bokeh — para marcas premium, joalherias e serviços de luxo",
    template: {
      slug: "",
      businessName: "House of Gold",
      tagline: "Excelência em cada detalhe",
      heroImage: "https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-stone-950 to-yellow-950",
      textColor: "text-white",
      accentColor: "#ca8a04",
      fontFamily: "Raleway",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}body{background:transparent;overflow:hidden;width:100%;height:100%}canvas{position:fixed;inset:0;width:100%;height:100%}</style><canvas id="c"></canvas><script>(function(){var c=document.getElementById('c'),ctx=c.getContext('2d'),W,H;function resize(){W=c.width=c.offsetWidth||window.innerWidth||400;H=c.height=c.offsetHeight||window.innerHeight||700}resize();window.addEventListener('resize',resize);var pts=[];for(var i=0;i<65;i++){var big=Math.random()<.15;pts.push({x:Math.random()*W,y:Math.random()*H,vy:-.12-Math.random()*.3,vx:(Math.random()-.5)*.15,r:big?2.2+Math.random()*1.2:.6+Math.random()*1.4,t:Math.random()*Math.PI*2,osc:Math.random()*.8+.4,sp:Math.random()*.02+.008,gold:Math.random()<.6,big:big})}function draw(){ctx.clearRect(0,0,W,H);pts.forEach(function(p){p.t+=p.sp;p.x+=p.vx+Math.sin(p.t)*p.osc*.4;p.y+=p.vy;if(p.y<-10)p.y=H+5;if(p.x<0)p.x=W;if(p.x>W)p.x=0;var op=.5+.35*Math.sin(p.t);if(p.big){ctx.shadowBlur=10;ctx.shadowColor='rgba(202,138,4,.8)'}else{ctx.shadowBlur=4;ctx.shadowColor='rgba(202,138,4,.5)'}var col=p.gold?'rgba(202,138,4,'+op.toFixed(2)+')':'rgba(251,191,36,'+op.toFixed(2)+')';ctx.fillStyle=col;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.2832);ctx.fill();ctx.shadowBlur=0});requestAnimationFrame(draw)}draw()})()</script>`,
        overlay: 20,
      },
      buttons: [
        { id: "1", label: "Coleção Exclusiva", subtitle: "Peças únicas sob medida 💎", url: "", icon: "", gradientColor: "from-yellow-800 to-amber-950", iconEmoji: "💎", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Atendimento VIP", subtitle: "Consultoria personalizada 👑", url: "", icon: "", gradientColor: "from-stone-700 to-neutral-900", iconEmoji: "👑", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Instagram", subtitle: "Coleções e bastidores 📸", url: "", icon: "", gradientColor: "from-amber-700 to-yellow-950", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
        { id: "4", label: "Catálogo Digital", subtitle: "Ver todas as peças 📖", url: "", icon: "", gradientColor: "from-zinc-700 to-zinc-950", iconEmoji: "📖", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["💎", "✨", "👑", "🌟"],
      blocks: [
        { id: "b1", type: "testimonial", order: 0, content: "Cada peça é uma obra de arte. O atendimento é excepcional e a qualidade é imbatível.", testimonialName: "Isabela von M.", testimonialRole: "Cliente desde 2019", testimonialRating: 5 },
        { id: "b2", type: "badges", order: 1, badges: [
          { id: "1", label: "Joias Exclusivas", emoji: "💍", color: "bg-yellow-800" },
          { id: "2", label: "Ouro 18k e 24k", emoji: "✨", color: "bg-amber-800" },
          { id: "3", label: "Pedras Certificadas", emoji: "💎", color: "bg-stone-700" },
          { id: "4", label: "Entrega Blindada", emoji: "🛡️", color: "bg-neutral-700" },
        ]},
      ],
      pages: [],
    },
  },

  // ─── VAPORWAVE / RETRO ──────────────────────────────────────────
  {
    id: "tpl-vaporwave",
    category: "animados",
    categoryEmoji: "🌊",
    name: "Vaporwave Retro",
    description: "Grade geométrica retro estilo vaporwave com degradê lilás-rosa — para marcas nostálgicas e estéticas",
    template: {
      slug: "",
      businessName: "ÆSTHETIC™",
      tagline: "// W E L C O M E  T O  T H E  F U T U R E  O F  T H E  P A S T",
      heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-fuchsia-950 to-blue-950",
      textColor: "text-white",
      accentColor: "#e879f9",
      fontFamily: "Space Grotesk",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}body{background:transparent;overflow:hidden;width:100%;height:100%}@keyframes rot1{0%{transform:rotate(0deg);opacity:.14}50%{transform:rotate(180deg);opacity:.28}100%{transform:rotate(360deg);opacity:.14}}@keyframes rot2{0%{transform:rotate(45deg);opacity:.1}50%{transform:rotate(225deg);opacity:.22}100%{transform:rotate(405deg);opacity:.1}}@keyframes rot3{0%{transform:rotate(-30deg) scale(1);opacity:.08}50%{transform:rotate(150deg) scale(1.05);opacity:.2}100%{transform:rotate(330deg) scale(1);opacity:.08}}@keyframes orb{0%,100%{transform:scale(1);opacity:.14}50%{transform:scale(1.08);opacity:.26}}@keyframes tri{0%{transform:rotate(0deg) skewX(0deg);opacity:.1}50%{transform:rotate(120deg) skewX(5deg);opacity:.22}100%{transform:rotate(240deg) skewX(0deg);opacity:.1}}.sq{position:fixed;animation:rot1 ease-in-out infinite}.sq2{position:fixed;animation:rot2 ease-in-out infinite}.sq3{position:fixed;animation:rot3 ease-in-out infinite}.orb{position:fixed;border-radius:50%;filter:blur(85px);animation:orb ease-in-out infinite}</style><div class="orb" style="width:360px;height:360px;background:rgba(232,121,249,.14);top:-80px;left:-70px;animation-duration:10s"></div><div class="orb" style="width:300px;height:300px;background:rgba(99,102,241,.11);bottom:-60px;right:-50px;animation-duration:14s;animation-delay:-6s"></div><div class="sq" style="width:90px;height:90px;border:1.5px solid rgba(232,121,249,.38);top:10%;left:7%;animation-duration:20s"></div><div class="sq2" style="width:140px;height:140px;border:1px solid rgba(99,102,241,.28);bottom:18%;right:8%;animation-duration:26s;animation-delay:-8s"></div><div class="sq3" style="width:65px;height:65px;border:1px solid rgba(216,180,254,.25);top:42%;left:62%;filter:blur(1px);animation-duration:17s;animation-delay:-4s"></div><div class="sq" style="width:110px;height:110px;border:1px solid rgba(232,121,249,.18);bottom:8%;left:18%;filter:blur(1px);animation-duration:22s;animation-delay:-12s"></div><div class="sq2" style="width:50px;height:50px;border:2px solid rgba(168,85,247,.3);top:22%;right:25%;animation-duration:14s;animation-delay:-3s"></div><div class="sq3" style="width:180px;height:180px;border:1px solid rgba(99,102,241,.12);top:55%;left:5%;filter:blur(2px);animation-duration:30s;animation-delay:-15s"></div>`,
        overlay: 25,
      },
      buttons: [
        { id: "1", label: "Loja Estética", subtitle: "Merch & produtos 🛍️", url: "", icon: "", gradientColor: "from-fuchsia-700 to-pink-900", iconEmoji: "🛍️", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Instagram", subtitle: "Conteúdo estético 📸", url: "", icon: "", gradientColor: "from-pink-700 to-fuchsia-900", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Spotify", subtitle: "Lo-fi & vaporwave 🎵", url: "", icon: "", gradientColor: "from-green-700 to-emerald-900", iconEmoji: "🎵", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
        { id: "4", label: "TikTok", subtitle: "Vídeos estéticos 🎬", url: "", icon: "", gradientColor: "from-zinc-700 to-black", iconEmoji: "🎬", linkType: "tiktok", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🌊", "🌴", "💜", "🎶"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "1M+", label: "Seguidores" },
          { id: "s2", value: "50K+", label: "Produtos vendidos" },
          { id: "s3", value: "90s", label: "Vibes eternas" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🌊 Nova coleção chegou", subtitle: "Estética pura — edição limitada disponível agora" },
      ],
      pages: [],
    },
  },

  // ══════════════════════ CATEGORIA: MINI SITES ══════════════════════

  // ─── PORTFOLIO CRIATIVO ──────────────────────────────────────────
  {
    id: "tpl-portfolio-criativo",
    category: "mini-sites",
    categoryEmoji: "🎨",
    name: "Portfólio Criativo",
    description: "Mini site para designers, artistas e criativos — com seções de projetos, serviços e contato",
    template: {
      slug: "",
      businessName: "Ana Costa — Design",
      tagline: "Designer gráfica especializada em branding e identidade visual",
      heroImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-violet-50 to-purple-100",
      textColor: "text-violet-900",
      accentColor: "#7c3aed",
      fontFamily: "DM Sans",
      bgHtml: {
        enabled: false,
        html: `<style>*{margin:0;padding:0}body{width:100%;height:100%;background:transparent;overflow:hidden}@keyframes float{0%,100%{transform:translateY(0) rotate(0deg);opacity:.12}50%{transform:translateY(-18px) rotate(8deg);opacity:.28}}@keyframes drift{0%,100%{transform:translateY(0);opacity:.15}50%{transform:translateY(-14px);opacity:.35}}.sq{position:fixed;border-radius:3px;border:1.5px solid rgba(139,92,246,.25);animation:float ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(45px);animation:drift ease-in-out infinite}</style><div class="o" style="width:280px;height:280px;background:rgba(167,139,250,.18);top:-60px;left:-50px;animation-duration:12s"></div><div class="o" style="width:240px;height:240px;background:rgba(196,181,253,.14);bottom:-40px;right:-30px;animation-duration:16s;animation-delay:-7s"></div><div class="o" style="width:160px;height:160px;background:rgba(139,92,246,.1);top:45%;left:55%;animation-duration:10s;animation-delay:-3s"></div><div class="sq" style="width:55px;height:55px;top:10%;left:12%;animation-duration:14s"></div><div class="sq" style="width:90px;height:70px;bottom:22%;right:8%;animation-duration:18s;animation-delay:-6s"></div><div class="sq" style="width:45px;height:45px;top:55%;left:6%;animation-duration:11s;animation-delay:-4s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "1", label: "Ver Portfólio Completo", subtitle: "Todos os projetos 🎨", url: "", icon: "", gradientColor: "from-amber-600 to-orange-700", iconEmoji: "🎨", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 45 },
        { id: "2", label: "Behance", subtitle: "Case studies completos 🏆", url: "", icon: "", gradientColor: "from-blue-700 to-blue-900", iconEmoji: "🏆", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 42 },
        { id: "3", label: "Contratar Serviços", subtitle: "Projetos a partir de R$800 💼", url: "", icon: "", gradientColor: "from-stone-600 to-neutral-800", iconEmoji: "💼", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 40 },
        { id: "4", label: "Instagram", subtitle: "Bastidores do processo 📸", url: "", icon: "", gradientColor: "from-rose-600 to-pink-800", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
        { id: "5", label: "E-mail", subtitle: "Orçamento e parcerias ✉️", url: "", icon: "", gradientColor: "from-zinc-600 to-zinc-900", iconEmoji: "✉️", linkType: "email", linkValue: "", imagePosition: "right" as const, imageOpacity: 62, imageSize: 36 },
      ],
      badges: [],
      floatingEmojis: ["🎨", "✏️", "🌟", "💡"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "120+", label: "Projetos entregues" },
          { id: "s2", value: "6 anos", label: "De experiência" },
          { id: "s3", value: "4.9★", label: "Avaliação média" },
        ]},
        { id: "b2", type: "badges", order: 1, badges: [
          { id: "1", label: "Identidade Visual", emoji: "🎨", color: "bg-amber-700" },
          { id: "2", label: "UI/UX Design", emoji: "✏️", color: "bg-stone-600" },
          { id: "3", label: "Motion Graphics", emoji: "🎬", color: "bg-orange-700" },
          { id: "4", label: "Social Media", emoji: "📱", color: "bg-neutral-600" },
        ]},
        { id: "b3", type: "testimonial", order: 2, content: "A Ana transformou completamente nossa identidade visual. Profissionalismo e criatividade raros.", testimonialName: "Startup Fintech XY", testimonialRole: "Cliente corporativo", testimonialRating: 5 },
      ],
      pages: [],
    },
  },

  // ─── LANDING PAGE PRODUTO ────────────────────────────────────────
  {
    id: "tpl-landing-produto",
    category: "mini-sites",
    categoryEmoji: "🚀",
    name: "Landing Page — Produto Digital",
    description: "Página de lançamento para produtos digitais, cursos e infoprodutos com alta conversão",
    template: {
      slug: "",
      businessName: "MÉTODO RESULTADO PRO",
      tagline: "O sistema que já ajudou mais de 3.000 pessoas a triplicarem seu faturamento em 90 dias",
      heroImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-slate-900 to-gray-950",
      textColor: "text-white",
      accentColor: "#3b82f6",
      fontFamily: "Montserrat",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}body{background:transparent;overflow:hidden;width:100%;height:100%}@keyframes beam{0%{transform:translateX(-110%);opacity:0}10%{opacity:.7}85%{opacity:.5}100%{transform:translateX(220%);opacity:0}}@keyframes pulse-ring{0%{transform:translate(-50%,-50%) scale(0);opacity:.7}100%{transform:translate(-50%,-50%) scale(3.5);opacity:0}}@keyframes orb{0%,100%{opacity:.08;transform:scale(1)}50%{opacity:.2;transform:scale(1.1)}}.bm{position:fixed;height:1px;animation:beam linear infinite}.ring{position:fixed;top:50%;left:50%;border-radius:50%;border:1px solid rgba(59,130,246,.6);animation:pulse-ring cubic-bezier(.2,.6,.4,1) infinite}.orb{position:fixed;border-radius:50%;filter:blur(80px);animation:orb ease-in-out infinite}</style><div class="orb" style="width:300px;height:300px;background:rgba(59,130,246,.08);top:-60px;left:-50px;animation-duration:14s"></div><div class="orb" style="width:250px;height:250px;background:rgba(99,102,241,.06);bottom:-50px;right:-40px;animation-duration:18s;animation-delay:-8s"></div><div class="bm" style="top:18%;width:70%;left:0;background:linear-gradient(90deg,transparent,rgba(59,130,246,.0) 5%,rgba(59,130,246,.7) 30%,rgba(147,197,253,.9) 50%,rgba(59,130,246,.7) 70%,rgba(59,130,246,.0) 95%,transparent);animation-duration:3.5s"></div><div class="bm" style="top:35%;width:55%;left:0;background:linear-gradient(90deg,transparent,rgba(59,130,246,.6),rgba(147,197,253,.8),rgba(59,130,246,.6),transparent);animation-duration:5s;animation-delay:-1.8s"></div><div class="bm" style="top:55%;width:65%;left:0;background:linear-gradient(90deg,transparent,rgba(59,130,246,.5),rgba(147,197,253,.7),rgba(59,130,246,.5),transparent);animation-duration:4.2s;animation-delay:-3s"></div><div class="bm" style="top:72%;width:45%;left:0;background:linear-gradient(90deg,transparent,rgba(59,130,246,.55),rgba(147,197,253,.75),rgba(59,130,246,.55),transparent);animation-duration:6s;animation-delay:-2.5s"></div><div class="ring" style="width:80px;height:80px;animation-duration:3s"></div><div class="ring" style="width:80px;height:80px;animation-duration:3s;animation-delay:-1s"></div><div class="ring" style="width:80px;height:80px;animation-duration:3s;animation-delay:-2s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "1", label: "QUERO TRIPLICAR MEU FATURAMENTO →", subtitle: "Vagas limitadas — garante a sua! 🔥", url: "", icon: "", gradientColor: "from-orange-500 to-red-600", iconEmoji: "🔥", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80", imagePosition: "right" as const, imageOpacity: 80, imageSize: 48 },
        { id: "2", label: "Assistir Aula Gratuita", subtitle: "45 min que vão mudar tudo ▶️", url: "", icon: "", gradientColor: "from-amber-600 to-amber-800", iconEmoji: "▶️", linkType: "youtube", linkValue: "", imagePosition: "right" as const, imageOpacity: 72, imageSize: 42 },
        { id: "3", label: "Falar com a Equipe", subtitle: "Tire suas dúvidas agora 💬", url: "", icon: "", gradientColor: "from-green-600 to-green-800", iconEmoji: "💬", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🔥", "💰", "🚀", "🏆"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "3.000+", label: "Alunos transformados" },
          { id: "s2", value: "R$50M+", label: "Gerados pelos alunos" },
          { id: "s3", value: "90 dias", label: "Para ver resultado" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "⏰ ÚLTIMAS VAGAS — Turma fecha em 48h", subtitle: "Não perca mais uma oportunidade. Sua transformação começa AGORA." },
        { id: "b3", type: "testimonial", order: 2, content: "Em 60 dias faturei R$47.000 no digital. Esse método funciona de verdade!", testimonialName: "Rodrigo A.", testimonialRole: "Aluno turma 2024", testimonialRating: 5 },
        { id: "b4", type: "badges", order: 3, badges: [
          { id: "1", label: "7 dias de garantia", emoji: "✅", color: "bg-green-700" },
          { id: "2", label: "Acesso vitalício", emoji: "♾️", color: "bg-orange-700" },
          { id: "3", label: "Certificado incluso", emoji: "📜", color: "bg-amber-700" },
          { id: "4", label: "Comunidade VIP", emoji: "👑", color: "bg-red-700" },
        ]},
      ],
      pages: [],
    },
  },

  // ─── CURRÍCULO ONLINE ────────────────────────────────────────────
  {
    id: "tpl-curriculo",
    category: "mini-sites",
    categoryEmoji: "👔",
    name: "Currículo Online",
    description: "Mini site profissional estilo LinkedIn para quem busca emprego, freelance ou oportunidades",
    template: {
      slug: "",
      businessName: "Lucas Ferreira",
      tagline: "Gerente de Projetos • PMP Certificado • 10 anos de experiência em tecnologia",
      heroImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-slate-50 to-white",
      textColor: "text-slate-900",
      accentColor: "#3b82f6",
      fontFamily: "Inter",
      bgHtml: {
        enabled: false,
        html: `<style>*{margin:0;padding:0}body{width:100%;height:100%;background:transparent;overflow:hidden}@keyframes float{0%,100%{transform:translateY(0) scale(1);opacity:.1}50%{transform:translateY(-14px) scale(1.04);opacity:.22}}@keyframes sparkle{0%,100%{transform:scale(0);opacity:0}50%{transform:scale(1);opacity:.5}}.o{position:fixed;border-radius:50%;filter:blur(50px);animation:float ease-in-out infinite}.s{position:fixed;width:3px;height:3px;border-radius:50%;background:rgba(100,116,139,.4);animation:sparkle ease-in-out infinite}</style><div class="o" style="width:260px;height:260px;background:rgba(148,163,184,.1);top:-50px;left:-40px;animation-duration:14s"></div><div class="o" style="width:220px;height:220px;background:rgba(100,116,139,.08);bottom:-40px;right:-30px;animation-duration:18s;animation-delay:-8s"></div><div class="o" style="width:150px;height:150px;background:rgba(148,163,184,.07);top:40%;left:50%;animation-duration:11s;animation-delay:-4s"></div><div class="s" style="top:18%;left:25%;animation-duration:3s"></div><div class="s" style="top:42%;left:72%;animation-duration:4s;animation-delay:-1.5s"></div><div class="s" style="top:65%;left:18%;animation-duration:3.5s;animation-delay:-2s"></div><div class="s" style="top:28%;left:60%;animation-duration:5s;animation-delay:-.8s"></div><div class="s" style="top:78%;left:48%;animation-duration:4s;animation-delay:-3s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "1", label: "Baixar Currículo PDF", subtitle: "Versão completa atualizada 📄", url: "", icon: "", gradientColor: "from-blue-600 to-blue-800", iconEmoji: "📄", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 45 },
        { id: "2", label: "LinkedIn", subtitle: "Histórico e recomendações 🔗", url: "", icon: "", gradientColor: "from-blue-700 to-indigo-800", iconEmoji: "🔗", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Agendar Entrevista", subtitle: "Calendly disponível 📅", url: "", icon: "", gradientColor: "from-green-600 to-emerald-800", iconEmoji: "📅", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 68, imageSize: 38 },
        { id: "4", label: "E-mail Profissional", subtitle: "Resposta em até 2h ✉️", url: "", icon: "", gradientColor: "from-slate-600 to-slate-800", iconEmoji: "✉️", linkType: "email", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
        { id: "5", label: "GitHub", subtitle: "Projetos e código 💻", url: "", icon: "", gradientColor: "from-zinc-600 to-zinc-900", iconEmoji: "💻", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 62, imageSize: 36 },
      ],
      badges: [],
      floatingEmojis: ["💼", "🏆", "⭐", "🎯"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "10 anos", label: "De experiência" },
          { id: "s2", value: "40+", label: "Projetos entregues" },
          { id: "s3", value: "PMP", label: "Certificado PMI" },
        ]},
        { id: "b2", type: "badges", order: 1, badges: [
          { id: "1", label: "Gestão de Projetos", emoji: "📊", color: "bg-blue-700" },
          { id: "2", label: "Scrum Master", emoji: "⚡", color: "bg-indigo-700" },
          { id: "3", label: "Liderança Técnica", emoji: "👥", color: "bg-slate-600" },
          { id: "4", label: "Product Owner", emoji: "🎯", color: "bg-cyan-700" },
        ]},
      ],
      pages: [],
    },
  },

  // ══════════════════════ CATEGORIA: ENTRETENIMENTO ══════════════════

  // ─── STREAMER / GAMER ────────────────────────────────────────────
  {
    id: "tpl-streamer",
    category: "entretenimento",
    categoryEmoji: "🎮",
    name: "Streamer & Gamer",
    description: "Visual gamer neon para streamers de Twitch, YouTube Gaming e criadores de conteúdo de games",
    template: {
      slug: "",
      businessName: "xKingStream",
      tagline: "GG WP • Full Time Streamer • Top 0.1%",
      heroImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-slate-950 to-purple-950",
      textColor: "text-white",
      accentColor: "#a855f7",
      fontFamily: "Space Grotesk",
      bgHtml: {
        enabled: true,
        html: `<style>
@keyframes scanV{0%{top:-4px;}100%{top:100vh;}}
@keyframes cornerPulse{0%,100%{opacity:0.35;}50%{opacity:0.9;}}
@keyframes hexPulse0{0%,100%{opacity:0.15;}10%{opacity:0.7;}}
@keyframes hexPulse1{0%,100%{opacity:0.15;}22%{opacity:0.65;}}
@keyframes hexPulse2{0%,100%{opacity:0.15;}34%{opacity:0.7;}}
@keyframes hexPulse3{0%,100%{opacity:0.15;}46%{opacity:0.6;}}
@keyframes hexPulse4{0%,100%{opacity:0.15;}58%{opacity:0.75;}}
@keyframes hexPulse5{0%,100%{opacity:0.15;}70%{opacity:0.65;}}
@keyframes hexPulse6{0%,100%{opacity:0.15;}82%{opacity:0.7;}}
@keyframes hexPulse7{0%,100%{opacity:0.15;}94%{opacity:0.6;}}
</style>
<div style="position:fixed;top:0;left:0;width:100%;height:100%;display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(5,1fr);gap:4px;padding:12px;box-sizing:border-box;pointer-events:none;">
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse0 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse1 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse2 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse3 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.2);animation:hexPulse4 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse5 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse6 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse7 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse2 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse3 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse4 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse5 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse6 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse7 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse0 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.2);animation:hexPulse1 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse4 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse5 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.2);animation:hexPulse6 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse7 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse0 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse1 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse2 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.2);animation:hexPulse3 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse5 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse6 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse7 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse0 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.2);animation:hexPulse1 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse2 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse4 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse5 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse6 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.2);animation:hexPulse7 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse0 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse1 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.2);animation:hexPulse2 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse3 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.18);animation:hexPulse4 4s ease-in-out infinite;"></div>
  <div style="clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:rgba(168,85,247,0.22);animation:hexPulse5 4s ease-in-out infinite;"></div>
</div>
<div style="position:fixed;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,rgba(168,85,247,0.8),transparent);animation:scanV 5s linear infinite;pointer-events:none;"></div>
<div style="position:fixed;top:0;left:0;width:40px;height:40px;border-top:2px solid rgba(168,85,247,0.8);border-left:2px solid rgba(168,85,247,0.8);animation:cornerPulse 2s ease-in-out infinite;"></div>
<div style="position:fixed;top:0;right:0;width:40px;height:40px;border-top:2px solid rgba(168,85,247,0.8);border-right:2px solid rgba(168,85,247,0.8);animation:cornerPulse 2s ease-in-out infinite 0.5s;"></div>
<div style="position:fixed;bottom:0;left:0;width:40px;height:40px;border-bottom:2px solid rgba(168,85,247,0.8);border-left:2px solid rgba(168,85,247,0.8);animation:cornerPulse 2s ease-in-out infinite 1s;"></div>
<div style="position:fixed;bottom:0;right:0;width:40px;height:40px;border-bottom:2px solid rgba(168,85,247,0.8);border-right:2px solid rgba(168,85,247,0.8);animation:cornerPulse 2s ease-in-out infinite 1.5s;"></div>`,
        overlay: 30,
      },
      buttons: [
        { id: "1", label: "Twitch", subtitle: "Live todo dia às 21h 🎮", url: "", icon: "", gradientColor: "from-violet-700 to-purple-900", iconEmoji: "🎮", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "YouTube Gaming", subtitle: "Highlights e clips ▶️", url: "", icon: "", gradientColor: "from-red-700 to-red-900", iconEmoji: "▶️", linkType: "youtube", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Discord", subtitle: "Comunidade de gamers 🎧", url: "", icon: "", gradientColor: "from-indigo-700 to-indigo-900", iconEmoji: "🎧", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Loja — Merch", subtitle: "Camisa, moletom e mais 🛍️", url: "", icon: "", gradientColor: "from-cyan-700 to-cyan-900", iconEmoji: "🛍️", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
        { id: "5", label: "Instagram", subtitle: "Lifestyle e bastidores 📸", url: "", icon: "", gradientColor: "from-pink-700 to-fuchsia-900", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 62, imageSize: 36 },
      ],
      badges: [],
      floatingEmojis: ["🎮", "🏆", "⚡", "💜"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "50K+", label: "Seguidores Twitch" },
          { id: "s2", value: "200+", label: "Horas ao vivo/mês" },
          { id: "s3", value: "Top 500", label: "Ranking nacional" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🎮 LIVE AGORA — Entre na stream!", subtitle: "Sub e siga para não perder nenhuma live" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── CONTABILIDADE ──────────────────────────────
  {
    id: "tpl-contabilidade-pro",
    category: "contabilidade",
    categoryEmoji: "📊",
    name: "Escritório Contábil",
    description: "Modelo profissional para escritórios de contabilidade",
    template: {
      slug: "",
      businessName: "Contabilidade Precision",
      tagline: "Mais de 20 anos cuidando das finanças da sua empresa",
      heroImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-blue-50 to-slate-100",
      textColor: "text-slate-900",
      accentColor: "#2563eb",
      fontFamily: "Inter",
      bgHtml: {
        enabled: false,
        html: `<style>*{margin:0;padding:0;box-sizing:border-box}@keyframes grid{0%,100%{opacity:.04}50%{opacity:.1}}@keyframes float{0%,100%{transform:translateY(0);opacity:.15}50%{transform:translateY(-14px);opacity:.34}}.gd{position:fixed;inset:0;background-image:linear-gradient(rgba(30,58,138,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(30,58,138,.06) 1px,transparent 1px);background-size:38px 38px;animation:grid 7s ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(44px);animation:float ease-in-out infinite}</style><div class="gd"></div><div class="o" style="width:200px;height:200px;background:radial-gradient(circle,rgba(30,58,138,.12),transparent);top:5%;right:8%;animation-duration:9s"></div><div class="o" style="width:160px;height:160px;background:radial-gradient(circle,rgba(71,85,105,.1),transparent);bottom:10%;left:6%;animation-duration:12s;animation-delay:-5s"></div><div class="o" style="width:120px;height:120px;background:radial-gradient(circle,rgba(30,58,138,.08),transparent);top:45%;left:50%;animation-duration:10s;animation-delay:-3s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "1", label: "Imposto de Renda", subtitle: "Declaração pessoa física e jurídica 📋", url: "", icon: "", gradientColor: "from-blue-600 to-blue-800", iconEmoji: "📋", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Abertura de Empresa", subtitle: "MEI, ME, LTDA — do zero 🏢", url: "", icon: "", gradientColor: "from-indigo-600 to-indigo-800", iconEmoji: "🏢", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Contabilidade Mensal", subtitle: "Gestão fiscal e trabalhista 📈", url: "", icon: "", gradientColor: "from-cyan-600 to-cyan-800", iconEmoji: "📈", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Folha de Pagamento", subtitle: "Holerites e encargos 💼", url: "", icon: "", gradientColor: "from-slate-600 to-slate-800", iconEmoji: "💼", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
        { id: "5", label: "Consultoria Financeira", subtitle: "Planejamento e análise 💡", url: "", icon: "", gradientColor: "from-blue-700 to-slate-700", iconEmoji: "💡", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["📊", "💼", "📋", "💰"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "CRC Registrado", emoji: "✅", color: "bg-blue-600" },
          { id: "2", label: "+500 Clientes", emoji: "🏆", color: "bg-indigo-600" },
          { id: "3", label: "Atendimento Ágil", emoji: "⚡", color: "bg-cyan-600" },
          { id: "4", label: "100% Digital", emoji: "💻", color: "bg-slate-600" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "📊 Diagnóstico Contábil Gratuito!", subtitle: "Descubra como reduzir sua carga tributária agora" },
        { id: "b3", type: "testimonial", order: 2, content: "A Precision mudou minha empresa. Economizei R$2.000/mês em impostos com a consultoria deles.", testimonialName: "Carlos M.", testimonialRole: "Empresário — cliente há 5 anos", testimonialRating: 5 },
      ],
      pages: [],
    },
  },
  {
    id: "tpl-contabilidade-digital",
    category: "contabilidade",
    categoryEmoji: "📊",
    name: "Contador Digital",
    description: "Modelo moderno para contadores que atendem online",
    template: {
      slug: "",
      businessName: "ContaOnline",
      tagline: "Contabilidade 100% digital, sem burocracia",
      heroImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-indigo-50 to-blue-100",
      textColor: "text-slate-900",
      accentColor: "#4f46e5",
      fontFamily: "Inter",
      bgHtml: {
        enabled: false,
        html: `<style>*{margin:0;padding:0;box-sizing:border-box}@keyframes float{0%,100%{transform:translateY(0) scale(1);opacity:.18}50%{transform:translateY(-16px) scale(1.04);opacity:.4}}@keyframes ring{0%,100%{transform:scale(1);opacity:.1}50%{transform:scale(1.08);opacity:.24}}.o{position:fixed;border-radius:50%;filter:blur(40px);animation:float ease-in-out infinite}.r{position:fixed;border-radius:50%;border:1.5px solid;animation:ring ease-in-out infinite}</style><div class="o" style="width:220px;height:220px;background:radial-gradient(circle,rgba(99,102,241,.18),transparent);top:3%;right:5%;animation-duration:10s"></div><div class="o" style="width:170px;height:170px;background:radial-gradient(circle,rgba(59,130,246,.15),transparent);bottom:8%;left:4%;animation-duration:13s;animation-delay:-5s"></div><div class="o" style="width:130px;height:130px;background:radial-gradient(circle,rgba(99,102,241,.12),transparent);top:50%;left:45%;animation-duration:11s;animation-delay:-3s"></div><div class="r" style="width:180px;height:180px;border-color:rgba(99,102,241,.18);top:8%;left:5%;animation-duration:8s"></div><div class="r" style="width:120px;height:120px;border-color:rgba(59,130,246,.15);bottom:14%;right:8%;animation-duration:10s;animation-delay:-4s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "1", label: "BPO Financeiro", subtitle: "Gestão financeira terceirizada 🏦", url: "", icon: "", gradientColor: "from-cyan-600 to-teal-700", iconEmoji: "🏦", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Simples Nacional", subtitle: "Cálculo e guias mensais 📑", url: "", icon: "", gradientColor: "from-blue-600 to-blue-800", iconEmoji: "📑", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Lucro Presumido", subtitle: "Otimização tributária 💹", url: "", icon: "", gradientColor: "from-indigo-600 to-violet-700", iconEmoji: "💹", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Regularização Fiscal", subtitle: "Débitos e certidões 📜", url: "", icon: "", gradientColor: "from-slate-600 to-slate-800", iconEmoji: "📜", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["💻", "📊", "💹", "✅"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "15 min", label: "Resposta média" },
          { id: "s2", value: "98%", label: "Satisfação" },
          { id: "s3", value: "300+", label: "Clientes ativos" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🚀 Primeira mensalidade com 50% OFF!", subtitle: "Migre para a contabilidade digital agora" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── JURISTAS ──────────────────────────────
  {
    id: "tpl-juristas-premium",
    category: "juristas",
    categoryEmoji: "⚖️",
    name: "Escritório Jurídico Premium",
    description: "Modelo elegante para escritórios de advocacia de alto padrão",
    template: {
      slug: "",
      businessName: "Dr. Henrique Alves",
      tagline: "Advocacia de excelência — Direitos que você merece defender",
      heroImage: "https://images.unsplash.com/photo-1589829545856-4a9d9d728b6e?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-slate-900 to-gray-950",
      textColor: "text-white",
      accentColor: "#2563eb",
      fontFamily: "Inter",
      bgHtml: {
        enabled: false,
        html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#06080d}@keyframes drift{0%{transform:translateY(0) translateX(0);opacity:.2}50%{transform:translateY(-18px) translateX(5px);opacity:.48}100%{transform:translateY(0) translateX(0);opacity:.2}}@keyframes pulse{0%,100%{opacity:.08;transform:scale(1)}50%{opacity:.2;transform:scale(1.06)}}.p{position:fixed;width:2px;height:2px;border-radius:50%;background:#94a3b8;animation:drift ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(90px);animation:pulse ease-in-out infinite}</style><div class="o" style="width:300px;height:300px;background:radial-gradient(circle,rgba(30,41,59,.7),transparent);top:0%;right:0%;animation-duration:9s"></div><div class="o" style="width:240px;height:240px;background:radial-gradient(circle,rgba(15,23,42,.8),transparent);bottom:0%;left:0%;animation-duration:12s;animation-delay:-5s"></div><div class="p" style="top:12%;left:18%;animation-duration:6s"></div><div class="p" style="top:28%;left:72%;animation-duration:8s;animation-delay:-2s"></div><div class="p" style="top:55%;left:35%;animation-duration:7s;animation-delay:-4s"></div><div class="p" style="top:70%;left:60%;animation-duration:9s;animation-delay:-1s"></div><div class="p" style="top:40%;left:85%;animation-duration:6s;animation-delay:-3s"></div><div class="p" style="top:82%;left:25%;animation-duration:8s;animation-delay:-5s"></div><div class="p" style="top:20%;left:50%;animation-duration:7s;animation-delay:-6s"></div><div class="p" style="top:65%;left:8%;animation-duration:9s;animation-delay:-2s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "1", label: "Direito Civil", subtitle: "Contratos, família, herança ⚖️", url: "", icon: "", gradientColor: "from-amber-700 to-amber-900", iconEmoji: "⚖️", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1589829545856-4a9d9d728b6e?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Direito Trabalhista", subtitle: "Reclamações e acordos 👔", url: "", icon: "", gradientColor: "from-stone-700 to-stone-900", iconEmoji: "👔", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Direito Empresarial", subtitle: "Contratos e societário 🏢", url: "", icon: "", gradientColor: "from-slate-700 to-slate-900", iconEmoji: "🏢", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1453733190371-0a9bedd82893?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Consultoria Jurídica", subtitle: "Análise de documentos 📜", url: "", icon: "", gradientColor: "from-amber-800 to-stone-800", iconEmoji: "📜", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1589829545856-4a9d9d728b6e?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
        { id: "5", label: "Agendar Consulta", subtitle: "Primeira consulta gratuita 🗓️", url: "", icon: "", gradientColor: "from-amber-600 to-amber-700", iconEmoji: "🗓️", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["⚖️", "📜", "🏛️", "✍️"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "OAB Registrado", emoji: "✅", color: "bg-amber-700" },
          { id: "2", label: "+15 Anos de Experiência", emoji: "🏆", color: "bg-stone-700" },
          { id: "3", label: "Atendimento 24h", emoji: "⏰", color: "bg-slate-700" },
          { id: "4", label: "100% Sigiloso", emoji: "🔒", color: "bg-amber-800" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "⚖️ Primeira Consulta Gratuita!", subtitle: "Agende agora e conheça seus direitos" },
        { id: "b3", type: "testimonial", order: 2, content: "Profissionalismo e resultados. Ganhei minha causa trabalhista e fui muito bem assessorado em todo o processo.", testimonialName: "Marcos R.", testimonialRole: "Cliente — Processo trabalhista", testimonialRating: 5 },
      ],
      pages: [],
    },
  },
  {
    id: "tpl-juristas-especialista",
    category: "juristas",
    categoryEmoji: "⚖️",
    name: "Advogado Digital",
    description: "Modelo moderno para advogados que atendem online e presencialmente",
    template: {
      slug: "",
      businessName: "Dra. Camila Nunes",
      tagline: "Seus direitos defendidos com tecnologia e expertise",
      heroImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-slate-50 to-blue-100",
      textColor: "text-slate-900",
      accentColor: "#1d4ed8",
      fontFamily: "Inter",
      bgHtml: {
        enabled: false,
        html: `<style>*{margin:0;padding:0;box-sizing:border-box}@keyframes float{0%,100%{transform:translateY(0) scale(1);opacity:.18}50%{transform:translateY(-16px) scale(1.04);opacity:.4}}@keyframes ring{0%,100%{transform:scale(1);opacity:.1}50%{transform:scale(1.08);opacity:.24}}.o{position:fixed;border-radius:50%;filter:blur(40px);animation:float ease-in-out infinite}.r{position:fixed;border-radius:50%;border:1.5px solid;animation:ring ease-in-out infinite}</style><div class="o" style="width:210px;height:210px;background:radial-gradient(circle,rgba(100,116,139,.15),transparent);top:4%;right:6%;animation-duration:10s"></div><div class="o" style="width:160px;height:160px;background:radial-gradient(circle,rgba(59,130,246,.12),transparent);bottom:9%;left:5%;animation-duration:13s;animation-delay:-5s"></div><div class="o" style="width:140px;height:140px;background:radial-gradient(circle,rgba(100,116,139,.1),transparent);top:48%;left:42%;animation-duration:11s;animation-delay:-3s"></div><div class="r" style="width:200px;height:200px;border-color:rgba(100,116,139,.14);top:6%;left:4%;animation-duration:9s"></div><div class="r" style="width:130px;height:130px;border-color:rgba(59,130,246,.12);bottom:12%;right:7%;animation-duration:11s;animation-delay:-4s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "1", label: "Direito do Consumidor", subtitle: "Cobranças abusivas, recalls 🛡️", url: "", icon: "", gradientColor: "from-violet-700 to-purple-900", iconEmoji: "🛡️", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1453733190371-0a9bedd82893?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 42 },
        { id: "2", label: "Contratos & Imóveis", subtitle: "Revisão e elaboração 🏠", url: "", icon: "", gradientColor: "from-purple-700 to-indigo-900", iconEmoji: "🏠", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Inventário e Herança", subtitle: "Partilha amigável ou judicial 📋", url: "", icon: "", gradientColor: "from-slate-700 to-gray-900", iconEmoji: "📋", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1589829545856-4a9d9d728b6e?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "Divórcio & Família", subtitle: "Consensual ou litigioso 💙", url: "", icon: "", gradientColor: "from-violet-800 to-slate-800", iconEmoji: "💙", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1453733190371-0a9bedd82893?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["⚖️", "🏛️", "📜", "💜"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "+200", label: "Casos resolvidos" },
          { id: "s2", value: "97%", label: "Taxa de êxito" },
          { id: "s3", value: "Online", label: "Atendimento" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "💬 Análise do Caso Gratuita!", subtitle: "Envie sua situação pelo WhatsApp e receba orientação" },
      ],
      pages: [],
    },
  },

  // ─────────────────────────── ANIMATED EXTRAS ────────────────────────────
  {
    id: "tpl-neon-pulse",
    category: "animados",
    categoryEmoji: "🎨",
    name: "Neon Pulse",
    description: "Fundo com linhas neon pulsantes — visual futurista",
    template: {
      slug: "",
      businessName: "NeonBrand",
      tagline: "O futuro é agora",
      heroImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-slate-950 to-pink-950",
      textColor: "text-white",
      accentColor: "#f472b6",
      fontFamily: "Inter",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}body{background:transparent;overflow:hidden;width:100%;height:100%}@keyframes pulse{0%,100%{transform:scale(1);opacity:.22}50%{transform:scale(1.15);opacity:.38}}@keyframes scan{0%{left:-100%;opacity:0}15%{opacity:.7}85%{opacity:.5}100%{left:120%;opacity:0}}@keyframes flash{0%,100%{opacity:0}50%{opacity:.7}}@keyframes orb2{0%,100%{transform:scale(1);opacity:.12}50%{transform:scale(1.1);opacity:.25}}.orb{position:fixed;border-radius:50%;filter:blur(80px);animation:pulse ease-in-out infinite}.orb2{position:fixed;border-radius:50%;filter:blur(60px);animation:orb2 ease-in-out infinite}.beam{position:fixed;height:2px;width:60%;animation:scan linear infinite}.flash{position:fixed;left:0;right:0;height:1px;animation:flash ease-in-out infinite}</style><div class="orb" style="width:380px;height:380px;background:rgba(244,114,182,.24);top:-60px;right:-60px;animation-duration:7s"></div><div class="orb" style="width:320px;height:320px;background:rgba(168,85,247,.18);bottom:-60px;left:-60px;animation-duration:10s;animation-delay:-4s"></div><div class="orb2" style="width:160px;height:160px;background:rgba(244,114,182,.16);top:38%;left:38%;animation-duration:6s;animation-delay:-2s"></div><div class="beam" style="top:27%;background:linear-gradient(90deg,transparent,rgba(244,114,182,.0) 5%,rgba(244,114,182,.8) 40%,rgba(255,200,230,.95) 50%,rgba(244,114,182,.8) 60%,rgba(244,114,182,.0) 95%,transparent);animation-duration:4.5s;box-shadow:0 0 6px rgba(244,114,182,.5)"></div><div class="beam" style="top:61%;width:50%;background:linear-gradient(90deg,transparent,rgba(244,114,182,.0) 5%,rgba(244,114,182,.6) 40%,rgba(255,180,220,.8) 50%,rgba(244,114,182,.6) 60%,rgba(244,114,182,.0) 95%,transparent);animation-duration:6.5s;animation-delay:-3s"></div><div class="flash" style="top:45%;background:rgba(244,114,182,.75);animation-duration:5s;animation-delay:-2s;box-shadow:0 0 8px rgba(244,114,182,.6)"></div><div class="flash" style="top:72%;background:rgba(244,114,182,.6);animation-duration:7.5s;animation-delay:-4.5s"></div>`,
        overlay: 40,
      },
      buttons: [
        { id: "1", label: "Ver Portfólio", subtitle: "Projetos em destaque ✨", url: "", icon: "", gradientColor: "from-cyan-500 to-blue-700", iconEmoji: "✨", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "2", label: "Instagram", subtitle: "Conteúdo exclusivo 📸", url: "", icon: "", gradientColor: "from-fuchsia-600 to-purple-800", iconEmoji: "📸", linkType: "instagram", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Falar Comigo", subtitle: "Vamos criar algo incrível 🚀", url: "", icon: "", gradientColor: "from-violet-700 to-indigo-900", iconEmoji: "🚀", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["⚡", "🔮", "✨", "💫"],
      blocks: [
        { id: "b1", type: "cta", order: 0, content: "⚡ Disponível para novos projetos!", subtitle: "Vamos conversar sobre sua ideia" },
      ],
      pages: [],
    },
  },
  {
    id: "tpl-particles",
    category: "animados",
    categoryEmoji: "🎨",
    name: "Partículas Flutuantes",
    description: "Partículas coloridas flutuando — elegante e moderno",
    template: {
      slug: "",
      businessName: "Creative Studio",
      tagline: "Design que transforma marcas em experiências",
      heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-indigo-950 to-slate-950",
      textColor: "text-white",
      accentColor: "#818cf8",
      fontFamily: "Inter",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0}body{background:transparent;overflow:hidden;width:100%;height:100%}canvas{position:fixed;inset:0;width:100%;height:100%}</style><canvas id="c"></canvas><script>(function(){var c=document.getElementById('c'),ctx=c.getContext('2d'),W,H;function resize(){W=c.width=c.offsetWidth||window.innerWidth||400;H=c.height=c.offsetHeight||window.innerHeight||700}resize();window.addEventListener('resize',resize);var cols=['rgba(129,140,248,.75)','rgba(167,139,250,.7)','rgba(244,114,182,.65)','rgba(52,211,153,.65)','rgba(251,191,36,.65)','rgba(99,102,241,.7)'];var N=45;var pts=[];for(var i=0;i<N;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,r:1.8+Math.random()*2.4,c:cols[Math.floor(Math.random()*cols.length)],t:Math.random()*Math.PI*2,sp:Math.random()*.015+.005});function draw(){ctx.clearRect(0,0,W,H);for(var i=0;i<N;i++){for(var j=i+1;j<N;j++){var dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<110){var op=(1-dist/110)*.35;ctx.strokeStyle='rgba(167,139,250,'+op.toFixed(3)+')';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke()}}}pts.forEach(function(p){p.t+=p.sp;p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;var pulse=.85+.15*Math.sin(p.t);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.r*pulse,0,6.2832);ctx.fill()});requestAnimationFrame(draw)}draw()})()</script>`,
        overlay: 20,
      },
      buttons: [
        { id: "1", label: "Brand Identity", subtitle: "Logo, paleta e tipografia 🎨", url: "", icon: "", gradientColor: "from-violet-600 to-purple-800", iconEmoji: "🎨", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "2", label: "Web Design", subtitle: "Sites e landing pages 💻", url: "", icon: "", gradientColor: "from-indigo-600 to-indigo-800", iconEmoji: "💻", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Motion Design", subtitle: "Vídeos e animações 🎬", url: "", icon: "", gradientColor: "from-purple-700 to-fuchsia-800", iconEmoji: "🎬", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
        { id: "4", label: "Solicitar Orçamento", subtitle: "Resposta em 24h ✅", url: "", icon: "", gradientColor: "from-slate-700 to-slate-900", iconEmoji: "✅", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["✨", "🎨", "💡", "🔮"],
      blocks: [
        { id: "b1", type: "stats", order: 0, statItems: [
          { id: "s1", value: "120+", label: "Projetos entregues" },
          { id: "s2", value: "8 anos", label: "No mercado" },
          { id: "s3", value: "5⭐", label: "Avaliação média" },
        ]},
        { id: "b2", type: "cta", order: 1, content: "🎨 Vamos criar algo memorável?", subtitle: "Conte-me sobre seu projeto" },
      ],
      pages: [],
    },
  },
  {
    id: "tpl-wave",
    category: "animados",
    categoryEmoji: "🎨",
    name: "Ocean Wave",
    description: "Ondas animadas em tons de azul — transmite calma e confiança",
    template: {
      slug: "",
      businessName: "Blue Wave",
      tagline: "Transformando sonhos em realidade com fluidez",
      heroImage: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-teal-50 to-cyan-100",
      textColor: "text-teal-900",
      accentColor: "#0891b2",
      fontFamily: "Inter",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0;box-sizing:border-box}@keyframes wave{0%,100%{transform:scaleX(1) scaleY(1) translateY(0);opacity:.18}50%{transform:scaleX(1.05) scaleY(1.1) translateY(-12px);opacity:.38}}@keyframes wave2{0%,100%{transform:scaleX(1) translateY(0);opacity:.12}50%{transform:scaleX(1.08) translateY(-8px);opacity:.28}}@keyframes float{0%,100%{transform:translateY(0);opacity:.14}50%{transform:translateY(-14px);opacity:.32}}.w{position:fixed;width:100%;border-radius:50%;filter:blur(55px);animation:wave ease-in-out infinite}.w2{position:fixed;width:100%;border-radius:50%;filter:blur(70px);animation:wave2 ease-in-out infinite}.o{position:fixed;border-radius:50%;filter:blur(42px);animation:float ease-in-out infinite}</style><div class="w" style="height:180px;background:linear-gradient(180deg,rgba(20,184,166,.22),transparent);top:18%;animation-duration:9s"></div><div class="w2" style="height:160px;background:linear-gradient(180deg,rgba(6,182,212,.18),transparent);top:48%;animation-duration:12s;animation-delay:-4s"></div><div class="o" style="width:200px;height:200px;background:radial-gradient(circle,rgba(20,184,166,.2),transparent);top:2%;right:4%;animation-duration:10s"></div><div class="o" style="width:150px;height:150px;background:radial-gradient(circle,rgba(6,182,212,.16),transparent);bottom:6%;left:5%;animation-duration:13s;animation-delay:-5s"></div>`,
        overlay: 10,
      },
      buttons: [
        { id: "1", label: "Nossos Serviços", subtitle: "Conheça o que fazemos 🌊", url: "", icon: "", gradientColor: "from-cyan-600 to-blue-700", iconEmoji: "🌊", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "2", label: "Sobre Nós", subtitle: "Nossa história e valores 💙", url: "", icon: "", gradientColor: "from-blue-600 to-indigo-700", iconEmoji: "💙", linkType: "external", linkValue: "", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "3", label: "Falar no WhatsApp", subtitle: "Atendimento personalizado 📲", url: "", icon: "", gradientColor: "from-teal-600 to-cyan-800", iconEmoji: "📲", linkType: "whatsapp", linkValue: "", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🌊", "💧", "🐋", "✨"],
      blocks: [
        { id: "b1", type: "cta", order: 0, content: "🌊 Pronto para mergulhar?", subtitle: "Entre em contato e vamos conversar" },
      ],
      pages: [],
    },
  },
  // ─────────────────────────── CONCESSIONÁRIA DE MOTO ────────────────────────
  {
    id: "tpl-moto",
    category: "automotivo",
    categoryEmoji: "🏍️",
    name: "Concessionária de Motos",
    description: "Modelo para concessionárias e lojas de motos",
    template: {
      slug: "",
      businessName: "Moto Prime",
      tagline: "As melhores motos com os melhores preços",
      heroImage: "https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-zinc-950 to-red-950",
      textColor: "text-white",
      accentColor: "#dc2626",
      fontFamily: "Rubik",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent!important}@keyframes streak{0%{transform:translateX(-160%);opacity:0}8%{opacity:1}85%{opacity:.9}100%{transform:translateX(260%);opacity:0}}@keyframes streakFast{0%{transform:translateX(-160%);opacity:0}5%{opacity:1}80%{opacity:.8}100%{transform:translateX(260%);opacity:0}}@keyframes friction{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--fx),var(--fy)) scale(0);opacity:0}}@keyframes glowRed{0%,100%{opacity:.2}50%{opacity:.38}}.streak{position:fixed;border-radius:2px;animation:streak linear infinite}.fast{animation-name:streakFast!important}.fric{position:fixed;border-radius:50%;animation:friction ease-out infinite}.glow{position:fixed;border-radius:50%;filter:blur(90px);animation:glowRed ease-in-out infinite}</style><div class="glow" style="width:300px;height:300px;background:radial-gradient(circle,rgba(220,38,38,.22),transparent 70%);top:40%;left:50%;transform:translate(-50%,-50%);animation-duration:4s"></div><div class="streak" style="width:55%;height:2px;background:linear-gradient(90deg,transparent,rgba(220,38,38,.9),rgba(255,255,255,.7),transparent);top:14%;left:0;animation-duration:.55s;animation-delay:0s"></div><div class="streak fast" style="width:35%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.8),rgba(220,38,38,.6),transparent);top:22%;left:0;animation-duration:.38s;animation-delay:-.12s"></div><div class="streak" style="width:70%;height:3px;background:linear-gradient(90deg,transparent,rgba(220,38,38,.95),rgba(251,146,60,.5),transparent);top:33%;left:0;animation-duration:.62s;animation-delay:-.25s"></div><div class="streak fast" style="width:45%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);top:42%;left:0;animation-duration:.42s;animation-delay:-.08s"></div><div class="streak" style="width:60%;height:2px;background:linear-gradient(90deg,transparent,rgba(220,38,38,.85),rgba(255,255,255,.5),transparent);top:50%;left:0;animation-duration:.58s;animation-delay:-.33s"></div><div class="streak fast" style="width:40%;height:1px;background:linear-gradient(90deg,transparent,rgba(251,146,60,.8),transparent);top:58%;left:0;animation-duration:.44s;animation-delay:-.18s"></div><div class="streak" style="width:65%;height:2px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),rgba(220,38,38,.8),transparent);top:66%;left:0;animation-duration:.5s;animation-delay:-.42s"></div><div class="streak fast" style="width:30%;height:1px;background:linear-gradient(90deg,transparent,rgba(220,38,38,.7),transparent);top:74%;left:0;animation-duration:.36s;animation-delay:-.06s"></div><div class="streak" style="width:55%;height:2px;background:linear-gradient(90deg,transparent,rgba(251,146,60,.9),rgba(255,255,255,.4),transparent);top:82%;left:0;animation-duration:.52s;animation-delay:-.3s"></div><div class="streak fast" style="width:45%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent);top:90%;left:0;animation-duration:.40s;animation-delay:-.15s"></div><div class="fric" style="width:4px;height:4px;background:#fff;top:48%;left:50%;--fx:-35px;--fy:-28px;animation-duration:.9s;animation-delay:0s"></div><div class="fric" style="width:3px;height:3px;background:#dc2626;top:50%;left:50%;--fx:42px;--fy:-20px;animation-duration:1.1s;animation-delay:-.3s"></div><div class="fric" style="width:4px;height:4px;background:#fb923c;top:52%;left:50%;--fx:-50px;--fy:18px;animation-duration:.8s;animation-delay:-.6s"></div><div class="fric" style="width:2px;height:2px;background:#fff;top:49%;left:51%;--fx:28px;--fy:32px;animation-duration:1.0s;animation-delay:-.15s"></div><div class="fric" style="width:3px;height:3px;background:#dc2626;top:51%;left:49%;--fx:-22px;--fy:-40px;animation-duration:.7s;animation-delay:-.5s"></div><div class="fric" style="width:2px;height:2px;background:#fbbf24;top:50%;left:50%;--fx:60px;--fy:-10px;animation-duration:1.2s;animation-delay:-.8s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "1", label: "Ver Estoque de Motos", subtitle: "Mais de 50 modelos 🏍️", url: "", icon: "", gradientColor: "from-orange-500 to-orange-700", iconEmoji: "🏍️", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=400&q=80", imagePosition: "right" as const, imageOpacity: 80, imageSize: 48 },
        { id: "2", label: "Simular Financiamento", subtitle: "Parcelas que cabem no bolso 💳", url: "", icon: "", gradientColor: "from-blue-600 to-blue-800", iconEmoji: "💳", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 42 },
        { id: "3", label: "Falar no WhatsApp", subtitle: "Atendimento imediato 💬", url: "", icon: "", gradientColor: "from-green-600 to-green-800", iconEmoji: "💬", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 40 },
        { id: "4", label: "Test Drive Grátis", subtitle: "Agende o seu agora 🗓️", url: "", icon: "", gradientColor: "from-amber-600 to-amber-800", iconEmoji: "🗓️", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 42 },
        { id: "5", label: "Nossa Localização", subtitle: "Av. Brasil, 1500 📍", url: "", icon: "", gradientColor: "from-zinc-600 to-zinc-800", iconEmoji: "📍", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🏍️", "🔥", "⚡", "🏆"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Todas as Marcas", emoji: "🏍️", color: "bg-orange-500" },
          { id: "2", label: "Financiamento Próprio", emoji: "💳", color: "bg-blue-600" },
          { id: "3", label: "Revisão Grátis", emoji: "🔧", color: "bg-gray-600" },
          { id: "4", label: "Garantia de Fábrica", emoji: "🛡️", color: "bg-green-600" },
        ]},
        { id: "b2", type: "stats", order: 1, statItems: [
          { id: "s1", value: "50+", label: "Modelos em estoque" },
          { id: "s2", value: "10x", label: "Sem entrada" },
          { id: "s3", value: "4.9★", label: "Avaliação Google" },
        ]},
        { id: "b3", type: "cta", order: 2, content: "🏍️ Semana da Moto!", subtitle: "Entrada reduzida e IPVA grátis no primeiro ano — só esta semana" },
        { id: "b4", type: "testimonial", order: 3, content: "Comprei minha Honda CB 300 aqui e a experiência foi incrível. Financiamento aprovado em minutos.", testimonialName: "Rafael S.", testimonialRole: "Cliente desde 2023", testimonialRating: 5 },
      ],
      pages: [],
    },
  },
  // ─────────────────────────── HOTEL ──────────────────────────────────────────
  {
    id: "tpl-hotel",
    category: "hospedagem",
    categoryEmoji: "🏨",
    name: "Hotel",
    description: "Modelo elegante para hotéis e pousadas",
    template: {
      slug: "",
      businessName: "Grand Palácio Hotel",
      tagline: "Luxo, conforto e hospitalidade em cada detalhe",
      heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-amber-50 to-stone-100",
      textColor: "text-stone-900",
      accentColor: "#b45309",
      fontFamily: "Playfair Display",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent;overflow:hidden}@keyframes goldShimmer{0%{transform:translateX(-130%) translateY(-130%) rotate(-35deg);opacity:0}10%{opacity:.22}50%{opacity:.38}90%{opacity:.18}100%{transform:translateX(260%) translateY(260%) rotate(-35deg);opacity:0}}@keyframes sparkPulse{0%,100%{transform:scale(0) rotate(0deg);opacity:0}20%{opacity:.8;transform:scale(1.2) rotate(72deg)}40%,60%{opacity:.65;transform:scale(1) rotate(144deg)}80%{opacity:.3;transform:scale(.7) rotate(216deg)}}@keyframes starBeam{0%,100%{opacity:0;width:0;height:0}50%{opacity:.5;width:28px;height:28px}}@keyframes ambFloat{0%,100%{opacity:.1;transform:scale(1)}50%{opacity:.25;transform:scale(1.1)}}.sh{position:fixed;background:linear-gradient(135deg,transparent 0%,rgba(251,191,36,.06) 25%,rgba(202,138,4,.32) 50%,rgba(251,191,36,.06) 75%,transparent 100%);animation:goldShimmer ease-in-out infinite}.sk{position:fixed;border-radius:50%;animation:sparkPulse ease-in-out infinite}.sk::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(251,191,36,.9) 0%,rgba(202,138,4,.6) 40%,transparent 70%);border-radius:50%;width:100%;height:100%}.sk::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(45deg);width:200%;height:1px;background:linear-gradient(90deg,transparent,rgba(251,191,36,.7),transparent)}.ag{position:fixed;border-radius:50%;filter:blur(60px);animation:ambFloat ease-in-out infinite}</style><div class="ag" style="width:300px;height:220px;background:radial-gradient(ellipse,rgba(251,191,36,.12),transparent);top:-40px;right:-40px;animation-duration:11s"></div><div class="ag" style="width:250px;height:180px;background:radial-gradient(ellipse,rgba(202,138,4,.1),transparent);bottom:-30px;left:-30px;animation-duration:14s;animation-delay:-6s"></div><div class="ag" style="width:180px;height:140px;background:radial-gradient(ellipse,rgba(180,83,9,.08),transparent);top:40%;left:30%;animation-duration:9s;animation-delay:-3s"></div><div class="sh" style="width:200%;height:200%;top:-50%;left:-50%;animation-duration:12s;animation-delay:0s"></div><div class="sh" style="width:200%;height:200%;top:-50%;left:-50%;animation-duration:18s;animation-delay:-7s;opacity:.7"></div><div class="sk" style="width:6px;height:6px;top:12%;left:18%;background:rgba(202,138,4,.75);box-shadow:0 0 10px 3px rgba(251,191,36,.5);animation-duration:4s;animation-delay:0s"></div><div class="sk" style="width:5px;height:5px;top:28%;right:22%;background:rgba(180,83,9,.8);box-shadow:0 0 8px 2px rgba(202,138,4,.6);animation-duration:5.5s;animation-delay:-1.2s"></div><div class="sk" style="width:7px;height:7px;top:18%;left:62%;background:rgba(202,138,4,.7);box-shadow:0 0 12px 4px rgba(251,191,36,.45);animation-duration:3.8s;animation-delay:-2.5s"></div><div class="sk" style="width:5px;height:5px;top:55%;left:14%;background:rgba(180,83,9,.75);box-shadow:0 0 9px 3px rgba(202,138,4,.55);animation-duration:6s;animation-delay:-0.8s"></div><div class="sk" style="width:6px;height:6px;top:72%;right:16%;background:rgba(202,138,4,.8);box-shadow:0 0 11px 3px rgba(251,191,36,.5);animation-duration:4.5s;animation-delay:-3.2s"></div><div class="sk" style="width:4px;height:4px;top:42%;right:42%;background:rgba(251,191,36,.7);box-shadow:0 0 7px 2px rgba(202,138,4,.6);animation-duration:5s;animation-delay:-1.8s"></div><div class="sk" style="width:5px;height:5px;top:85%;left:55%;background:rgba(180,83,9,.72);box-shadow:0 0 9px 3px rgba(202,138,4,.5);animation-duration:3.5s;animation-delay:-4s"></div><div class="sk" style="width:6px;height:6px;top:65%;left:35%;background:rgba(202,138,4,.78);box-shadow:0 0 10px 3px rgba(251,191,36,.55);animation-duration:6.5s;animation-delay:-2.1s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "1", label: "Reservar Agora", subtitle: "Melhor preço garantido ✨", url: "", icon: "", gradientColor: "from-amber-600 to-amber-800", iconEmoji: "🛎️", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80", imagePosition: "right" as const, imageOpacity: 80, imageSize: 48 },
        { id: "2", label: "Ver Acomodações", subtitle: "Suítes e apartamentos 🛏️", url: "", icon: "", gradientColor: "from-stone-600 to-stone-800", iconEmoji: "🛏️", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 45 },
        { id: "3", label: "Restaurante & Bar", subtitle: "Gastronomia de alto nível 🍷", url: "", icon: "", gradientColor: "from-red-900 to-stone-900", iconEmoji: "🍷", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 42 },
        { id: "4", label: "Fale Conosco", subtitle: "Atendimento 24h 📞", url: "", icon: "", gradientColor: "from-green-700 to-green-900", iconEmoji: "📞", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 40 },
        { id: "5", label: "Como Chegar", subtitle: "Centro da cidade 📍", url: "", icon: "", gradientColor: "from-zinc-700 to-zinc-900", iconEmoji: "📍", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["✨", "🏨", "🌟", "🛎️"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Café da Manhã Incluso", emoji: "☕", color: "bg-amber-600" },
          { id: "2", label: "Piscina & Spa", emoji: "🏊", color: "bg-blue-600" },
          { id: "3", label: "Wi-Fi Gratuito", emoji: "📶", color: "bg-green-600" },
          { id: "4", label: "Pet Friendly", emoji: "🐾", color: "bg-purple-600" },
        ]},
        { id: "b2", type: "stats", order: 1, statItems: [
          { id: "s1", value: "4★★★★", label: "Categoria" },
          { id: "s2", value: "9.2", label: "Avaliação Booking" },
          { id: "s3", value: "120", label: "Acomodações" },
        ]},
        { id: "b3", type: "testimonial", order: 2, content: "Uma estada perfeita. Quarto impecável, atendimento acolhedor e café da manhã delicioso. Voltarei sempre!", testimonialName: "Patrícia R.", testimonialRole: "Viajante frequente", testimonialRating: 5 },
        { id: "b4", type: "cta", order: 3, content: "🌟 Oferta Última Hora", subtitle: "Até 30% de desconto reservando pelo link — por tempo limitado" },
      ],
      pages: [],
    },
  },
  // ─────────────────────────── BISTRÔ ─────────────────────────────────────────
  {
    id: "tpl-bistro",
    category: "gastronomia",
    categoryEmoji: "🍽️",
    name: "Bistrô",
    description: "Modelo sofisticado para bistrôs e restaurantes gourmet",
    template: {
      slug: "",
      businessName: "Bistrô Maison",
      tagline: "Cozinha francesa contemporânea no coração da cidade",
      heroImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-stone-50 to-amber-100",
      textColor: "text-stone-900",
      accentColor: "#d97706",
      fontFamily: "Playfair Display",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent;overflow:hidden}@keyframes steamEl{0%{transform:translateY(0) translateX(0) scaleX(1);opacity:0}20%{opacity:.26}58%{opacity:.16;transform:translateY(-48px) translateX(var(--sx)) scaleX(1.18)}88%{opacity:.05}100%{transform:translateY(-95px) translateX(calc(var(--sx)*-.6)) scaleX(1.4);opacity:0}}@keyframes candleShimmer{0%{transform:translateX(-110%) skewX(-8deg);opacity:0}15%{opacity:.18}50%{opacity:.28}85%{opacity:.12}100%{transform:translateX(210%) skewX(-8deg);opacity:0}}@keyframes candleFlicker{0%,100%{opacity:.08;transform:translateY(0)}33%{opacity:.18;transform:translateY(-3px)}66%{opacity:.12;transform:translateY(2px)}}.sv{position:fixed;border-radius:50%;filter:blur(24px);animation:steamEl ease-in-out infinite}.sh{position:fixed;height:2px;left:0;right:0;background:linear-gradient(90deg,transparent 0%,rgba(217,119,6,.12) 20%,rgba(251,191,36,.38) 50%,rgba(217,119,6,.12) 80%,transparent 100%);animation:candleShimmer ease-in-out infinite}.cf{position:fixed;border-radius:50%;filter:blur(55px);animation:candleFlicker ease-in-out infinite}</style><div class="cf" style="width:260px;height:180px;background:radial-gradient(ellipse,rgba(217,119,6,.11),transparent);top:0;left:-30px;animation-duration:4s"></div><div class="cf" style="width:200px;height:150px;background:radial-gradient(ellipse,rgba(251,191,36,.09),transparent);bottom:5%;right:-20px;animation-duration:5s;animation-delay:-2s"></div><div class="cf" style="width:150px;height:120px;background:radial-gradient(ellipse,rgba(202,138,4,.08),transparent);top:35%;left:35%;animation-duration:6s;animation-delay:-3s"></div><div class="sh" style="top:18%;animation-duration:11s;animation-delay:0s"></div><div class="sh" style="top:42%;animation-duration:15s;animation-delay:-4s"></div><div class="sh" style="top:68%;animation-duration:13s;animation-delay:-8s"></div><div class="sh" style="top:85%;animation-duration:17s;animation-delay:-6s"></div><div class="sv" style="width:50px;height:65px;background:rgba(180,120,10,.13);bottom:11%;left:12%;--sx:9px;animation-duration:7s;animation-delay:0s"></div><div class="sv" style="width:42px;height:55px;background:rgba(202,138,4,.11);bottom:14%;left:32%;--sx:-12px;animation-duration:9s;animation-delay:-2.5s"></div><div class="sv" style="width:56px;height:70px;background:rgba(180,120,10,.12);bottom:9%;left:54%;--sx:11px;animation-duration:8s;animation-delay:-4s"></div><div class="sv" style="width:46px;height:60px;background:rgba(202,138,4,.1);bottom:12%;right:10%;--sx:-8px;animation-duration:10s;animation-delay:-1.5s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "1", label: "Ver Menu", subtitle: "Culinária contemporânea 🍽️", url: "", icon: "", gradientColor: "from-amber-700 to-stone-800", iconEmoji: "📋", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80", imagePosition: "right" as const, imageOpacity: 80, imageSize: 48 },
        { id: "2", label: "Reservar Mesa", subtitle: "Garanta seu lugar 🕯️", url: "", icon: "", gradientColor: "from-red-900 to-stone-900", iconEmoji: "🕯️", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 44 },
        { id: "3", label: "Menu Degustação", subtitle: "Experiência gastronômica 🍷", url: "", icon: "", gradientColor: "from-purple-900 to-red-950", iconEmoji: "🍷", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 42 },
        { id: "4", label: "Instagram", subtitle: "Fotos que encantam 📸", url: "", icon: "", gradientColor: "from-pink-800 to-purple-900", iconEmoji: "📸", linkType: "instagram", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "5", label: "Onde Estamos", subtitle: "Rua Augusta, 890 📍", url: "", icon: "", gradientColor: "from-zinc-700 to-zinc-900", iconEmoji: "📍", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["🍷", "🕯️", "✨", "🌹"],
      blocks: [
        { id: "b1", type: "cta", order: 0, content: "🍷 Menu Degustação — Sextas e Sábados", subtitle: "7 tempos harmonizados com vinhos selecionados por R$189 por pessoa" },
        { id: "b2", type: "badges", order: 1, badges: [
          { id: "1", label: "Cozinha Aberta", emoji: "👨‍🍳", color: "bg-amber-700" },
          { id: "2", label: "Carta de Vinhos", emoji: "🍷", color: "bg-red-800" },
          { id: "3", label: "Orgânicos & Locais", emoji: "🌿", color: "bg-green-700" },
          { id: "4", label: "Eventos Privados", emoji: "🎉", color: "bg-purple-800" },
        ]},
        { id: "b3", type: "testimonial", order: 2, content: "Uma experiência gastronômica inesquecível. Cada prato é uma obra de arte, o ambiente é intimista e o serviço impecável.", testimonialName: "Isabela M.", testimonialRole: "Crítica gastronômica", testimonialRating: 5 },
        { id: "b4", type: "stats", order: 3, statItems: [
          { id: "s1", value: "12", label: "Anos de tradição" },
          { id: "s2", value: "4.9★", label: "TripAdvisor" },
          { id: "s3", value: "200+", label: "Rótulos de vinho" },
        ]},
      ],
      pages: [],
    },
  },
  // ─────────────────────────── POSTO DE COMBUSTÍVEL ───────────────────────────
  {
    id: "tpl-posto",
    category: "automotivo",
    categoryEmoji: "⛽",
    name: "Posto de Combustível",
    description: "Modelo para postos de gasolina e conveniências",
    template: {
      slug: "",
      businessName: "Posto Express",
      tagline: "Combustível de qualidade, atendimento ágil",
      heroImage: "https://images.unsplash.com/photo-1545224645-b62baa265f5d?w=800&q=80",
      logoUrl: "",
      backgroundColor: "from-gray-950 to-zinc-900",
      textColor: "text-white",
      accentColor: "#f59e0b",
      fontFamily: "Rubik",
      bgHtml: {
        enabled: true,
        html: `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#080808}@keyframes streak{0%{transform:translateX(-100%) scaleX(.4);opacity:0}20%{opacity:.55}80%{opacity:.3}100%{transform:translateX(250%) scaleX(.4);opacity:0}}@keyframes spark{0%{transform:translateY(0) scale(1);opacity:.8}100%{transform:translateY(-50px) scale(0) translateX(20px);opacity:0}}@keyframes smoke{0%{transform:translateY(0) scale(0.9);opacity:0}25%{opacity:.18}75%{opacity:.06}100%{transform:translateY(-70px) scale(1.5);opacity:0}}@keyframes pulse{0%,100%{opacity:.1;transform:scale(1)}50%{opacity:.24;transform:scale(1.06)}}.s{position:fixed;height:1px;background:linear-gradient(90deg,transparent,rgba(234,179,8,.75),rgba(202,138,4,.55),transparent);animation:streak linear infinite}.k{position:fixed;width:2px;height:2px;border-radius:50%;background:#eab308;filter:blur(.5px);animation:spark ease-out infinite}.sm{position:fixed;border-radius:50%;filter:blur(22px);background:rgba(63,63,70,.35);animation:smoke ease-in-out infinite}.g{position:fixed;border-radius:50%;filter:blur(70px);animation:pulse ease-in-out infinite}</style><div class="g" style="width:260px;height:260px;background:radial-gradient(circle,rgba(63,63,70,.45),transparent);top:-4%;right:-4%;animation-duration:9s"></div><div class="g" style="width:200px;height:200px;background:radial-gradient(circle,rgba(234,179,8,.15),transparent);bottom:-5%;left:-3%;animation-duration:12s;animation-delay:-5s"></div><div class="s" style="width:50%;top:25%;animation-duration:3.2s"></div><div class="s" style="width:38%;top:45%;animation-duration:2.6s;animation-delay:-.9s"></div><div class="s" style="width:58%;top:65%;animation-duration:3.8s;animation-delay:-1.6s"></div><div class="k" style="bottom:20%;left:25%;animation-duration:1.3s"></div><div class="k" style="bottom:22%;left:45%;animation-duration:1.7s;animation-delay:-.5s"></div><div class="k" style="bottom:18%;left:65%;animation-duration:1.2s;animation-delay:-.8s"></div><div class="k" style="bottom:24%;left:80%;animation-duration:1.5s;animation-delay:-.3s"></div><div class="sm" style="width:55px;height:65px;bottom:18%;left:30%;animation-duration:6s"></div><div class="sm" style="width:45px;height:55px;bottom:22%;left:55%;animation-duration:8s;animation-delay:-3s"></div><div class="sm" style="width:50px;height:60px;bottom:15%;right:25%;animation-duration:7s;animation-delay:-2s"></div>`,
        overlay: 0,
      },
      buttons: [
        { id: "1", label: "Preços dos Combustíveis", subtitle: "Sempre atualizados ⛽", url: "", icon: "", gradientColor: "from-green-600 to-green-800", iconEmoji: "⛽", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1561316441-1bb1f5a13f7d?w=400&q=80", imagePosition: "right" as const, imageOpacity: 75, imageSize: 44 },
        { id: "2", label: "Loja de Conveniência", subtitle: "Aberta 24 horas 🛒", url: "", icon: "", gradientColor: "from-blue-600 to-blue-800", iconEmoji: "🛒", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 42 },
        { id: "3", label: "Lavagem de Veículos", subtitle: "Lavagem completa a partir de R$25 🚗", url: "", icon: "", gradientColor: "from-cyan-600 to-cyan-800", iconEmoji: "🚿", linkType: "whatsapp", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1552427574-cdc56be27e75?w=400&q=80", imagePosition: "right" as const, imageOpacity: 70, imageSize: 40 },
        { id: "4", label: "GNV e Elétrico", subtitle: "Carregador rápido disponível ⚡", url: "", icon: "", gradientColor: "from-yellow-600 to-amber-700", iconEmoji: "⚡", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 40 },
        { id: "5", label: "Nossa Localização", subtitle: "Estrada das Palmeiras, 0 Km 📍", url: "", icon: "", gradientColor: "from-zinc-600 to-zinc-800", iconEmoji: "📍", linkType: "external", linkValue: "", imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80", imagePosition: "right" as const, imageOpacity: 65, imageSize: 38 },
      ],
      badges: [],
      floatingEmojis: ["⛽", "🚗", "⚡", "🛒"],
      blocks: [
        { id: "b1", type: "badges", order: 0, badges: [
          { id: "1", label: "Aberto 24h", emoji: "🕐", color: "bg-green-600" },
          { id: "2", label: "Carro & Moto", emoji: "🚗", color: "bg-blue-600" },
          { id: "3", label: "Troca de Óleo", emoji: "🔧", color: "bg-amber-600" },
          { id: "4", label: "Segurança Monitorada", emoji: "📷", color: "bg-gray-600" },
        ]},
        { id: "b2", type: "stats", order: 1, statItems: [
          { id: "s1", value: "24h", label: "Funcionamento" },
          { id: "s2", value: "5", label: "Tipos de combustível" },
          { id: "s3", value: "400m²", label: "Conveniência" },
        ]},
        { id: "b3", type: "banner", order: 2, content: "Troco de Óleo + Filtro + Revisão GRÁTIS", subtitle: "Para os primeiros 50 clientes esta semana", bannerBg: "#16a34a" },
      ],
      pages: [],
    },
  },
];
