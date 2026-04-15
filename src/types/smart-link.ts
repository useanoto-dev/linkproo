export type LinkType = 'external' | 'whatsapp' | 'instagram' | 'tiktok' | 'youtube' | 'telegram' | 'email' | 'phone' | 'page';

export interface SmartLinkButton {
  id: string;
  label: string;
  subtitle: string;
  url: string;
  linkType?: LinkType;
  linkValue?: string;
  icon: string;
  imageUrl?: string;
  gradientColor?: string;
  iconEmoji?: string;
  imagePosition?: "left" | "right";
  imageOpacity?: number;
  imageSize?: number;
  textAlign?: "left" | "center" | "right";
  titleSize?: number;
  buttonHeight?: number;
  order?: number;
  pageId?: string;
  badgeLabel?: string;
  badgeColor?: string;
  buttonStyle?: 'card' | 'pill' | 'outline' | 'glass' | 'minimal' | 'flat' | 'neubrutalism' | 'soft';
  buttonBorderRadius?: number;  // per-button border radius override, 0-24px
  whatsappMessage?: string;     // pre-filled message for WhatsApp links
}

export type BlockType =
  | 'hero' | 'info' | 'button' | 'image-button' | 'badges'
  | 'text' | 'separator' | 'cta' | 'image' | 'header'
  | 'spacer' | 'video' | 'countdown' | 'faq' | 'gallery'
  | 'testimonial' | 'stats' | 'product' | 'email-capture'
  | 'spotify' | 'map' | 'carousel' | 'banner' | 'html'
  | 'animated-button' | 'contacts';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
}

export interface CarouselSlide {
  id: string;
  url: string;
  caption?: string;
}

export interface LinkBlock {
  id: string;
  type: BlockType;
  order: number;
  content?: string;
  subtitle?: string;
  badges?: BadgeItem[];
  imageUrl?: string;
  height?: number;
  videoUrl?: string;
  borderRadius?: number;
  emoji?: string;
  // Image Button
  buttonImageUrl?: string;
  buttonUrl?: string;
  buttonHeight?: number;
  // Countdown
  countdownDate?: string;
  countdownLabel?: string;
  // FAQ
  faqItems?: FaqItem[];
  // Gallery
  galleryImages?: GalleryImage[];
  // Testimonial
  testimonialName?: string;
  testimonialRole?: string;
  testimonialAvatar?: string;
  testimonialRating?: number;
  // Stats
  statItems?: StatItem[];
  // Product
  productImage?: string;
  productName?: string;
  productPrice?: string;
  productOldPrice?: string;
  productDescription?: string;
  productButtonLabel?: string;
  productButtonUrl?: string;
  // Email Capture
  emailPlaceholder?: string;
  emailButtonLabel?: string;
  emailSuccessMessage?: string;
  // Spotify
  spotifyUrl?: string;
  spotifyCompact?: boolean;
  // Map
  mapUrl?: string;
  mapHeight?: number;
  mapAddress?: string;
  // Text/Header/CTA overrides
  blockTextColor?: string;      // override text color for this block
  blockTextAlign?: 'left' | 'center' | 'right';  // text alignment for this block
  // HTML
  htmlContent?: string;
  htmlHeight?: number;
  // Carousel
  carouselSlides?: CarouselSlide[];
  carouselAutoplay?: boolean;
  // Banner
  bannerBg?: string;
  bannerTag?: string;
  // Animated Button
  animStyle?: 'whatsapp' | 'location' | 'schedule' | 'cta' | 'instagram' | 'tiktok' | 'youtube' | 'phone' | 'email' | 'telegram';
  animPrimaryColor?: string;
  animSecondaryColor?: string;
  animButtonLabel?: string;
  animSubtitle?: string;
  animUrl?: string;
  animTitleSize?: number;
  animButtonHeight?: number;
  // Sub-page linking (for image-button and animated-button blocks)
  blockPageId?: string;  // if set, clicking this block opens the sub-page with this id
  // Contacts block
  contactsList?: ContactItem[];
  contactsMode?: 1 | 2;  // 1 = single contact centered, 2 = two contacts side by side
  // Scheduling — ISO datetime strings (e.g. "2025-06-01T09:00")
  visibleFrom?: string;   // block hidden before this time
  visibleUntil?: string;  // block hidden after this time
}

export interface ContactItem {
  id: string;
  name: string;
  role?: string;       // optional job title / description
  photo?: string;      // URL
  whatsappNumber?: string;
  whatsappMessage?: string;
}

export interface BadgeItem {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export type EntryAnimation = 'none' | 'fade-up' | 'slide-left' | 'slide-right' | 'scale' | 'bounce';

/** Configurable background box rendered behind a text element */
export interface TextBgBox {
  enabled: boolean;
  borderWidth: number;    // 0–16 px
  borderColor: string;    // hex
  borderOpacity: number;  // 0–100
  borderRadius: number;   // 0–40 px
  padding: number;        // 4–40 px
  bgColor: string;        // hex
  bgOpacity: number;      // 0–100
}

export interface SnowEffect {
  enabled: boolean;
  intensity: number;
  color: string;
}

export interface BubblesEffect {
  enabled: boolean;
  intensity: number; // 5–100
  color: string;
}

export interface FirefliesEffect {
  enabled: boolean;
  count: number; // 5–40
  color: string;
}

export interface MatrixEffect {
  enabled: boolean;
  speed: number; // 1–10
  color: string;
}

export interface StarsEffect {
  enabled: boolean;
  count: number; // 20–200
  color: string;
  shooting: boolean;
}

export interface BgHtmlEffect {
  enabled: boolean;
  html: string;
  overlay?: number; // 0-100 opacity overlay on top of the HTML background
}

/** A sub-page within a SmartLink */
export interface SubPage {
  id: string;
  title: string;
  slug?: string;
  blocks: LinkBlock[];
  backgroundColor?: string;
  fontFamily?: string;
  linkedButtonId?: string;
}

export type HeroObjectFit = 'cover' | 'contain' | 'fill' | 'none';

export interface HeroFocalPoint {
  x: number;  // 0–100 %
  y: number;  // 0–100 %
}

export interface SmartLink {
  id: string;
  slug: string;
  businessName: string;
  businessNameHtml?: boolean;
  tagline: string;
  heroImage: string;
  /** Banner height in px (80–500). */
  heroImageHeightPx?: number;
  /** How the banner image fills its container */
  heroObjectFit?: HeroObjectFit;
  /** Focal point for object-position (0–100 each axis) */
  heroFocalPoint?: HeroFocalPoint;
  /** Opacity of the hero image itself (10–100, default 100) */
  heroImageOpacity?: number;
  /** Opacity of the overlay on top of hero image (0–80, default 0) */
  heroOverlayOpacity?: number;
  /** Color of the overlay: "dark" | "light" | hex string (default "dark") */
  heroOverlayColor?: string;
  logoUrl: string;
  logoSizePx?: number;           // Logo display size in px, default 80
  logoShape?: 'square' | 'rounded' | 'circle';  // default: 'rounded'
  logoShadow?: boolean;                           // default: true
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily?: string;
  titleSize?: number;
  businessNameFontSize?: number; // font size in px, default 24
  businessNameAlign?: "left" | "center" | "right"; // text alignment of business name, default center
  hideBusinessName?: boolean;  // default: false
  hideTagline?: boolean;       // default: false
  businessNameWidth?: number;     // % de largura, 30-100, default 100
  taglineWidth?: number;          // % de largura, 30-100, default 100
  businessNameBgBox?: TextBgBox;  // caixa de fundo configurável atrás do nome
  taglineBgBox?: TextBgBox;       // caixa de fundo configurável atrás do slogan
  businessNameEffect?: string;          // chave de efeito de texto (te-glass, te-neon, etc.)
  businessNameEffectIntensity?: number; // 0–100, default 100
  taglineEffect?: string;               // chave de efeito de texto para o slogan
  taglineEffectIntensity?: number;      // 0–100, default 100
  entryAnimation?: EntryAnimation;
  snowEffect?: SnowEffect;
  bubblesEffect?: BubblesEffect;
  firefliesEffect?: FirefliesEffect;
  matrixEffect?: MatrixEffect;
  starsEffect?: StarsEffect;
  bgHtml?: BgHtmlEffect;
  buttons: SmartLinkButton[];
  badges: string[];
  floatingEmojis: string[];
  blocks: LinkBlock[];
  pages: SubPage[];
  views: number;
  clicks: number;
  isActive: boolean;
  createdAt: string;
  customDomain?: string;
  /** Plan do dono do link — usado para decidir se exibe marca d'água */
  ownerPlan?: string;
  /** Header layout style: 'classic' = logo dentro do conteúdo (padrão), 'bio' = avatar sobreposto ao banner (estilo bio.site) */
  headerStyle?: 'classic' | 'bio';
  /** Curve SVG na borda inferior do banner (funciona em qualquer estilo de header) */
  bannerCurve?: boolean;
  /** Intensidade da curva do banner 0–100 (padrão: 50) */
  bannerCurveIntensity?: number;
  /** Em modo bio: cor da borda/anel do avatar (padrão: '#ffffff') */
  logoBorderColor?: string;
  /** Em modo bio: espessura da borda/anel do avatar em px (padrão: 4) */
  logoBorderWidth?: number;
  /** Cor independente para o nome/título do negócio (fallback: accentColor) */
  titleColor?: string;
  /** Cor independente para o slogan/tagline (fallback: automático por tema claro/escuro) */
  taglineColor?: string;
  /** Tamanho da fonte do slogan/tagline em px (padrão: 13) */
  taglineFontSize?: number;
  /** Exibir marca d'água — sobrescreve a lógica baseada no plano quando definido */
  watermarkEnabled?: boolean;
  /** URL personalizada do link da marca d'água */
  watermarkUrl?: string;
  /** Botão flutuante do WhatsApp */
  whatsappFloat?: WhatsAppFloat;
}

export interface WhatsAppFloat {
  enabled: boolean;
  /** Número no formato internacional sem símbolos: ex. 5599981361794 */
  phone: string;
  /** Mensagem pré-preenchida ao abrir o WhatsApp */
  message: string;
  /** Texto do balão que aparece ao lado do botão */
  label: string;
  /** Exibir o balão de texto */
  showLabel: boolean;
  /** Posição na tela */
  position: 'bottom-right' | 'bottom-left';
  /** Animação do botão */
  animation: 'pulse' | 'bounce' | 'none';
  /** Delay inicial antes do balão aparecer (ms). Padrão: 1500 */
  labelDelayMs?: number;
  /** Tempo que o balão fica visível (ms). Padrão: 4000 */
  labelDurationMs?: number;
  /** Tempo que o balão fica oculto entre ciclos (ms). Padrão: 5000 */
  labelHiddenMs?: number;
}
