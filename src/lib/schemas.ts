/**
 * Zod runtime schemas for the SmartLink data layer.
 *
 * Purpose: validate DB rows at the boundary before field mapping.
 * All schemas use safeParse — no throwing on bad data.
 * .passthrough() ensures forward compatibility when the DB grows new columns.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Leaf schemas
// ---------------------------------------------------------------------------

export const LinkTypeSchema = z.enum([
  'external', 'whatsapp', 'instagram', 'tiktok', 'youtube',
  'telegram', 'email', 'phone', 'page',
]);

export const BlockTypeSchema = z.enum([
  'hero', 'info', 'button', 'image-button', 'badges',
  'text', 'separator', 'cta', 'image', 'header',
  'spacer', 'video', 'countdown', 'faq', 'gallery',
  'testimonial', 'stats', 'product', 'email-capture',
  'spotify', 'map', 'carousel', 'banner', 'html',
  'animated-button', 'contacts',
]);

// ---------------------------------------------------------------------------
// SmartLinkButton
// ---------------------------------------------------------------------------

export const SmartLinkButtonSchema = z.object({
  id: z.string(),
  label: z.string(),
  subtitle: z.string().optional().default(''),
  url: z.string(),
  linkType: LinkTypeSchema.optional(),
  linkValue: z.string().optional(),
  icon: z.string().optional().default(''),
  imageUrl: z.string().optional().nullable(),
  gradientColor: z.string().optional().nullable(),
  iconEmoji: z.string().optional().nullable(),
  imagePosition: z.enum(['left', 'right']).optional(),
  imageOpacity: z.number().optional(),
  imageSize: z.number().optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  titleSize: z.number().optional(),
  buttonHeight: z.number().optional(),
  order: z.number().optional(),
  pageId: z.string().optional().nullable(),
  badgeLabel: z.string().optional().nullable(),
  badgeColor: z.string().optional().nullable(),
  buttonStyle: z.enum(['card', 'pill', 'outline', 'glass', 'minimal', 'flat', 'soft', 'neubrutalism']).optional(),
  buttonBorderRadius: z.number().optional(),
  whatsappMessage: z.string().optional().nullable(),
}).passthrough();

// ---------------------------------------------------------------------------
// LinkBlock — only validates the critical discriminant + required fields
// ---------------------------------------------------------------------------

export const LinkBlockSchema = z.object({
  // coerce accepts numeric ids from legacy data — never drops a block for id format
  id: z.union([z.string(), z.number()]).transform(String),
  type: BlockTypeSchema,
  // .catch(0) — accepts null/undefined/NaN from legacy data without dropping the block
  order: z.number().catch(0),
}).passthrough();

// ---------------------------------------------------------------------------
// Sub-schemas used inside SmartLinkRowSchema
// ---------------------------------------------------------------------------

const BgEffectsSchema = z.object({
  bubbles: z.unknown().optional(),
  fireflies: z.unknown().optional(),
  matrix: z.unknown().optional(),
  stars: z.unknown().optional(),
  bgHtml: z.unknown().optional(),
  whatsappFloat: z.unknown().optional(),
}).passthrough().optional().nullable();

// ---------------------------------------------------------------------------
// SmartLinkRowSchema — mirrors SmartLinkRow; validates critical fields only
// ---------------------------------------------------------------------------

export const SmartLinkRowSchema = z.object({
  id: z.string(),
  slug: z.string(),
  business_name: z.string(),
  business_name_html: z.boolean().optional().nullable(),
  tagline: z.string().optional().nullable(),
  hero_image: z.string().optional().nullable(),
  hero_image_height_px: z.number().optional().nullable(),
  hero_object_fit: z.string().optional().nullable(),
  hero_focal_point: z.unknown().optional(),
  hero_image_opacity: z.number().optional().nullable(),
  hero_overlay_opacity: z.number().optional().nullable(),
  hero_overlay_color: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  logo_size_px: z.number().optional().nullable(),
  logo_shape: z.string().optional().nullable(),
  logo_shadow: z.boolean().optional().nullable(),
  header_style: z.string().optional().nullable(),
  banner_curve: z.boolean().optional().nullable(),
  logo_border_color: z.string().optional().nullable(),
  title_color: z.string().optional().nullable(),
  tagline_color: z.string().optional().nullable(),
  watermark_enabled: z.boolean().optional().nullable(),
  watermark_url: z.string().optional().nullable(),
  background_color: z.string().optional().nullable(),
  text_color: z.string().optional().nullable(),
  accent_color: z.string().optional().nullable(),
  font_family: z.string().optional().nullable(),
  title_size: z.number().optional().nullable(),
  business_name_font_size: z.union([z.number(), z.string()]).optional().nullable(),
  business_name_align: z.string().optional().nullable(),
  hide_business_name: z.boolean().optional().nullable(),
  hide_tagline: z.boolean().optional().nullable(),
  entry_animation: z.string().optional().nullable(),
  snow_effect: z.unknown().optional(),
  bg_effects: BgEffectsSchema,
  // JSONB arrays — validated element-by-element in rowToSmartLink
  buttons: z.unknown().optional(),
  pages: z.unknown().optional(),
  badges: z.unknown().optional(),
  floating_emojis: z.unknown().optional(),
  blocks: z.unknown().optional(),
  is_active: z.boolean().optional().nullable(),
  created_at: z.string().optional(),
}).passthrough();

// ---------------------------------------------------------------------------
// Full SmartLink domain schema (optional — for internal consistency checks)
// ---------------------------------------------------------------------------

export const SmartLinkSchema = z.object({
  id: z.string(),
  slug: z.string(),
  businessName: z.string(),
  buttons: z.array(SmartLinkButtonSchema).default([]),
  blocks: z.array(LinkBlockSchema).default([]),
}).passthrough();
