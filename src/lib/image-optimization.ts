/**
 * Image optimization utilities for Supabase Storage URLs.
 * Uses the built-in image transform endpoint to resize/compress on the fly.
 */

/**
 * Returns an optimised Supabase image URL for the given target width.
 * Non-Supabase URLs are returned unchanged.
 */
export function getOptimizedUrl(url: string, width: number, quality = 80): string {
  if (!url || !url.includes("supabase.co/storage")) return url;
  const transformed = url.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );
  return `${transformed}?width=${width}&quality=${quality}`;
}
