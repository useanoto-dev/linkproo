import { SmartLink, EntryAnimation, SnowEffect, BubblesEffect, FirefliesEffect, MatrixEffect, StarsEffect, BgHtmlEffect, WhatsAppFloat, SmartLinkButton } from "@/types/smart-link";
import type { Json } from "@/integrations/supabase/types";
import { SmartLinkRowSchema, SmartLinkButtonSchema, LinkBlockSchema } from './schemas';

/**
 * Serializa um valor TypeScript tipado para o tipo Json do Supabase (colunas JSONB).
 * A conversão passa por JSON.parse(JSON.stringify()) para garantir que o valor
 * seja serializable e remover referências circulares ou métodos não-serializáveis.
 * Use apenas para campos JSONB onde o tipo TS é a fonte canônica de verdade.
 */
function toJsonb<T>(value: T): Json {
  return JSON.parse(JSON.stringify(value ?? null)) as Json;
}

/**
 * Manual type representing the superset of all DB columns accessed by rowToSmartLink.
 * NOT derived from Supabase generated types — those are stale (missing bg_effects,
 * business_name_align, business_name_font_size, business_name_html).
 * @see D-07, D-08, D-09 in 1-CONTEXT.md
 */
export interface SmartLinkRow {
  id: string;
  slug: string;
  business_name: string;
  business_name_html?: boolean | null;
  tagline?: string | null;
  hero_image?: string | null;
  hero_image_height_px?: number | null;
  hero_object_fit?: string | null;
  hero_focal_point?: unknown;
  hero_image_opacity?: number | null;
  hero_overlay_opacity?: number | null;
  hero_overlay_color?: string | null;
  logo_url?: string | null;
  logo_size_px?: number | null;
  logo_shape?: string | null;
  logo_shadow?: boolean | null;
  header_style?: string | null;
  banner_curve?: boolean | null;
  logo_border_color?: string | null;
  title_color?: string | null;
  tagline_color?: string | null;
  watermark_enabled?: boolean | null;
  watermark_url?: string | null;
  background_color?: string | null;
  text_color?: string | null;
  accent_color?: string | null;
  font_family?: string | null;
  title_size?: number | null;
  business_name_font_size?: number | string | null;
  business_name_align?: string | null;
  hide_business_name?: boolean | null;
  hide_tagline?: boolean | null;
  entry_animation?: string | null;
  snow_effect?: unknown;
  bg_effects?: {
    bubbles?: unknown;
    fireflies?: unknown;
    matrix?: unknown;
    stars?: unknown;
    bgHtml?: unknown;
    whatsappFloat?: unknown;
  } | null;
  buttons?: unknown;
  pages?: unknown;
  badges?: unknown;
  floating_emojis?: unknown;
  blocks?: unknown;
  is_active?: boolean | null;
  created_at?: string;
}

/**
 * Single source of truth for DB row ↔ SmartLink conversion.
 * Used by use-links.ts hooks AND the autosave logic in LinkEditor.
 */

/** Convert a DB row (any shape) to a SmartLink domain object */
export function rowToSmartLink(row: Partial<SmartLinkRow>, viewCount = 0, clickCount = 0, ownerPlan?: string): SmartLink {
  // Validate at the DB boundary — catches schema drift early.
  // Uses safeParse: logs errors but never throws, so callers are unaffected.
  const parsed = SmartLinkRowSchema.safeParse(row);
  if (!parsed.success) {
    if (import.meta.env.DEV) {
      console.warn('[link-mappers] rowToSmartLink validation failed:', parsed.error.flatten());
    }
  }

  // Validate buttons array — skip individual items that don't conform.
  const rawButtons: unknown[] = Array.isArray(row.buttons) ? row.buttons : [];
  const validatedButtons = rawButtons.filter((b: unknown) => {
    const result = SmartLinkButtonSchema.safeParse(b);
    if (!result.success) {
      if (import.meta.env.DEV) {
        console.warn('[link-mappers] invalid button skipped:', result.error.flatten());
      }
    }
    return result.success;
  }) as SmartLinkButton[];

  // Validate blocks array — skip individual items that don't conform.
  const rawBlocks: unknown[] = Array.isArray(row.blocks) ? row.blocks : [];
  const validatedBlocks = rawBlocks.filter((bl: unknown) => {
    const result = LinkBlockSchema.safeParse(bl);
    if (!result.success) {
      if (import.meta.env.DEV) {
        console.warn('[link-mappers] invalid block skipped:', result.error.flatten());
      }
    }
    return result.success;
  }) as SmartLink['blocks'];

  return {
    id: row.id,
    slug: row.slug,
    businessName: row.business_name,
    businessNameHtml: row.business_name_html || false,
    tagline: row.tagline || "",
    heroImage: row.hero_image || "",
    heroImageHeightPx: row.hero_image_height_px ?? undefined,
    heroObjectFit: (row.hero_object_fit as SmartLink['heroObjectFit']) ?? undefined,
    heroFocalPoint: row.hero_focal_point ? (row.hero_focal_point as SmartLink['heroFocalPoint']) : undefined,
    heroImageOpacity: row.hero_image_opacity ?? undefined,
    heroOverlayOpacity: row.hero_overlay_opacity ?? undefined,
    heroOverlayColor: row.hero_overlay_color ?? undefined,
    logoUrl: row.logo_url || "",
    logoSizePx: row.logo_size_px ?? 80,
    logoShape: (row.logo_shape as SmartLink['logoShape']) ?? 'rounded',
    logoShadow: row.logo_shadow ?? true,
    headerStyle: (row.header_style as SmartLink['headerStyle']) ?? undefined,
    bannerCurve: row.banner_curve ?? undefined,
    logoBorderColor: row.logo_border_color ?? undefined,
    titleColor: row.title_color ?? undefined,
    taglineColor: row.tagline_color ?? undefined,
    taglineFontSize: row.tagline_font_size ? Number(row.tagline_font_size) : undefined,
    watermarkEnabled: row.watermark_enabled ?? undefined,
    watermarkUrl: row.watermark_url ?? undefined,
    backgroundColor: row.background_color || "from-gray-50 to-white",
    textColor: row.text_color || "text-white",
    accentColor: row.accent_color || "#f59e0b",
    fontFamily: row.font_family || "Inter",
    titleSize: row.title_size ?? undefined,
    businessNameFontSize: row.business_name_font_size ? Number(row.business_name_font_size) : undefined,
    businessNameAlign: (row.business_name_align as "left" | "center" | "right") || "center",
    hideBusinessName: row.hide_business_name ?? false,
    hideTagline: row.hide_tagline ?? false,
    entryAnimation: (row.entry_animation || "fade-up") as EntryAnimation,
    snowEffect: row.snow_effect ? (row.snow_effect as SnowEffect) : undefined,
    bubblesEffect: row.bg_effects?.bubbles as BubblesEffect | undefined,
    firefliesEffect: row.bg_effects?.fireflies as FirefliesEffect | undefined,
    matrixEffect: row.bg_effects?.matrix as MatrixEffect | undefined,
    starsEffect: row.bg_effects?.stars as StarsEffect | undefined,
    bgHtml: row.bg_effects?.bgHtml as BgHtmlEffect | undefined,
    whatsappFloat: row.bg_effects?.whatsappFloat as WhatsAppFloat | undefined,
    buttons: validatedButtons,
    pages: (row.pages as SmartLink["pages"]) || [],
    badges: (row.badges as string[]) || [],
    floatingEmojis: (row.floating_emojis as string[]) || [],
    blocks: validatedBlocks,
    views: viewCount,
    clicks: clickCount,
    isActive: row.is_active ?? true,
    createdAt: row.created_at || new Date().toISOString(),
    ownerPlan: ownerPlan ?? undefined,
  };
}

/** Convert a SmartLink domain object to a DB row for insert/update */
export function smartLinkToRow(link: SmartLink, userId: string) {
  return {
    user_id: userId,
    slug: link.slug,
    business_name: link.businessName,
    business_name_html: link.businessNameHtml || false,
    tagline: link.tagline,
    hero_image: link.heroImage,
    hero_image_height_px: link.heroImageHeightPx ?? null,
    hero_object_fit: link.heroObjectFit ?? null,
    hero_focal_point: toJsonb(link.heroFocalPoint ?? null),
    hero_image_opacity: link.heroImageOpacity ?? null,
    hero_overlay_opacity: link.heroOverlayOpacity ?? null,
    hero_overlay_color: link.heroOverlayColor ?? null,
    logo_url: link.logoUrl,
    logo_size_px: link.logoSizePx ?? 80,
    logo_shape: link.logoShape ?? 'rounded',
    logo_shadow: link.logoShadow ?? true,
    header_style: link.headerStyle ?? null,
    banner_curve: link.bannerCurve ?? null,
    banner_curve_intensity: link.bannerCurveIntensity ?? null,
    logo_border_color: link.logoBorderColor ?? null,
    title_color: link.titleColor ?? null,
    tagline_color: link.taglineColor ?? null,
    tagline_font_size: link.taglineFontSize ?? null,
    watermark_enabled: link.watermarkEnabled ?? null,
    watermark_url: link.watermarkUrl ?? null,
    background_color: link.backgroundColor,
    text_color: link.textColor,
    accent_color: link.accentColor,
    font_family: link.fontFamily,
    title_size: link.titleSize ?? null,
    business_name_font_size: link.businessNameFontSize || null,
    business_name_align: link.businessNameAlign || "center",
    hide_business_name: link.hideBusinessName ?? false,
    hide_tagline: link.hideTagline ?? false,
    buttons: toJsonb(link.buttons),
    pages: toJsonb(link.pages),
    badges: toJsonb(link.badges),
    floating_emojis: toJsonb(link.floatingEmojis),
    blocks: toJsonb(link.blocks),
    is_active: link.isActive,
    custom_domain: link.customDomain ?? null,
    entry_animation: link.entryAnimation || "fade-up",
    // SnowEffect is a structured object that maps to JSONB in the DB
    snow_effect: toJsonb(link.snowEffect ?? null),
    bg_effects: (link.bubblesEffect || link.firefliesEffect || link.matrixEffect || link.starsEffect || link.bgHtml || link.whatsappFloat) ? toJsonb({
      bubbles: link.bubblesEffect ?? null,
      fireflies: link.firefliesEffect ?? null,
      matrix: link.matrixEffect ?? null,
      stars: link.starsEffect ?? null,
      bgHtml: link.bgHtml ?? null,
      whatsappFloat: link.whatsappFloat ?? null,
    }) : null,
  };
}
