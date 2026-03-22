import { SmartLink, EntryAnimation, SnowEffect, BubblesEffect, FirefliesEffect, MatrixEffect, StarsEffect, BgHtmlEffect } from "@/types/smart-link";

/**
 * Single source of truth for DB row ↔ SmartLink conversion.
 * Used by use-links.ts hooks AND the autosave logic in LinkEditor.
 */

/** Convert a DB row (any shape) to a SmartLink domain object */
export function rowToSmartLink(row: any, viewCount = 0, clickCount = 0): SmartLink {
  return {
    id: row.id,
    slug: row.slug,
    businessName: row.business_name,
    businessNameHtml: row.business_name_html || false,
    tagline: row.tagline || "",
    heroImage: row.hero_image || "",
    heroImageHeight: row.hero_image_height || undefined,
    heroImageOpacity: row.hero_image_opacity ?? undefined,
    heroOverlayOpacity: row.hero_overlay_opacity ?? undefined,
    heroOverlayColor: row.hero_overlay_color ?? undefined,
    logoUrl: row.logo_url || "",
    backgroundColor: row.background_color || "from-gray-50 to-white",
    textColor: row.text_color || "text-white",
    accentColor: row.accent_color || "#f59e0b",
    fontFamily: row.font_family || "Inter",
    titleSize: row.title_size ?? undefined,
    businessNameFontSize: row.business_name_font_size ? Number(row.business_name_font_size) : undefined,
    businessNameAlign: (row.business_name_align as "left" | "center" | "right") || "center",
    entryAnimation: (row.entry_animation || "fade-up") as EntryAnimation,
    snowEffect: row.snow_effect ? (row.snow_effect as SnowEffect) : undefined,
    bubblesEffect: row.bg_effects?.bubbles as BubblesEffect | undefined,
    firefliesEffect: row.bg_effects?.fireflies as FirefliesEffect | undefined,
    matrixEffect: row.bg_effects?.matrix as MatrixEffect | undefined,
    starsEffect: row.bg_effects?.stars as StarsEffect | undefined,
    bgHtml: row.bg_effects?.bgHtml as BgHtmlEffect | undefined,
    buttons: (row.buttons as SmartLink["buttons"]) || [],
    pages: (row.pages as SmartLink["pages"]) || [],
    badges: (row.badges as string[]) || [],
    floatingEmojis: (row.floating_emojis as string[]) || [],
    blocks: (row.blocks as SmartLink["blocks"]) || [],
    views: viewCount,
    clicks: clickCount,
    isActive: row.is_active ?? true,
    createdAt: row.created_at || new Date().toISOString(),
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
    hero_image_height: link.heroImageHeight || null,
    hero_image_opacity: link.heroImageOpacity ?? null,
    hero_overlay_opacity: link.heroOverlayOpacity ?? null,
    hero_overlay_color: link.heroOverlayColor ?? null,
    logo_url: link.logoUrl,
    background_color: link.backgroundColor,
    text_color: link.textColor,
    accent_color: link.accentColor,
    font_family: link.fontFamily,
    title_size: link.titleSize ?? null,
    business_name_font_size: link.businessNameFontSize || null,
    business_name_align: link.businessNameAlign || "center",
    buttons: link.buttons as any,
    pages: link.pages as any,
    badges: link.badges as any,
    floating_emojis: link.floatingEmojis as any,
    blocks: link.blocks as any,
    is_active: link.isActive,
    custom_domain: (link as any).customDomain || null,
    entry_animation: link.entryAnimation || "fade-up",
    snow_effect: link.snowEffect ? (link.snowEffect as any) : null,
    bg_effects: (link.bubblesEffect || link.firefliesEffect || link.matrixEffect || link.starsEffect || link.bgHtml) ? {
      bubbles: link.bubblesEffect ?? null,
      fireflies: link.firefliesEffect ?? null,
      matrix: link.matrixEffect ?? null,
      stars: link.starsEffect ?? null,
      bgHtml: link.bgHtml ?? null,
    } : null,
  };
}
