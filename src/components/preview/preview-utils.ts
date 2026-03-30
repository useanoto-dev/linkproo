import { EntryAnimation } from "@/types/smart-link";
import { getCustomBgGradient } from "@/lib/color-utils";

export function isDarkBg(bg: string) {
  if (!bg) return false;
  if (bg.startsWith("custom:")) {
    const hex = bg.split(":")[1];
    return isHexDark(hex);
  }
  return bg.includes("950") || bg.includes("900");
}

function isHexDark(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

export function parseCustomBg(bg: string): string | null {
  return getCustomBgGradient(bg) || null;
}

export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vmMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
  return null;
}

/** Returns true for short links that cannot be converted to an embed URL in the browser. */
export function isShortMapLink(url: string): boolean {
  if (!url) return false;
  return url.includes("maps.app.goo.gl") || url.includes("goo.gl/maps") || url.includes("share.google");
}

export function getMapEmbedUrl(url: string): string | null {
  if (!url) return null;

  // Already an embed URL — pass through unchanged
  if (url.includes("google.com/maps/embed")) return url;

  // Short/share links cannot be resolved or embedded in the browser
  if (isShortMapLink(url)) return null;

  // Extract @lat,lng from any Google Maps URL (most reliable signal)
  const coordMatch = url.match(/@([-\d.]+),([-\d.]+)(?:,([\d.]+)z)?/);
  if (coordMatch) {
    const lat = coordMatch[1];
    const lng = coordMatch[2];
    const zoom = coordMatch[3] ?? "15";
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
  }

  // google.com/maps?q=... or maps.google.com/maps?q=...
  // Append output=embed only when not already present
  if (url.match(/(?:maps\.google\.com|google\.com\/maps)\?/)) {
    if (url.includes("output=embed")) return url;
    const separator = url.includes("?") ? "&" : "?";
    return url + separator + "output=embed";
  }

  // google.com/maps/place/NAME — use place name as search query
  const placeNameMatch = url.match(/google\.com\/maps\/place\/([^/?]+)/);
  if (placeNameMatch) {
    const name = decodeURIComponent(placeNameMatch[1].replace(/\+/g, " "));
    return `https://maps.google.com/maps?q=${encodeURIComponent(name)}&output=embed`;
  }

  return null;
}

export function getSpotifyEmbedUrl(url: string): string | null {
  const match = url.match(/open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator`;
}

export const FONT_LINKS: Record<string, string> = {
  Inter: "'Inter', sans-serif",
  Poppins: "'Poppins', sans-serif",
  "Space Grotesk": "'Space Grotesk', sans-serif",
  Montserrat: "'Montserrat', sans-serif",
  Raleway: "'Raleway', sans-serif",
  "DM Sans": "'DM Sans', sans-serif",
  Outfit: "'Outfit', sans-serif",
  Sora: "'Sora', sans-serif",
  Rubik: "'Rubik', sans-serif",
  Nunito: "'Nunito', sans-serif",
};

export function loadGoogleFont(font: string) {
  const id = `gf-${font.replace(/\s/g, "-")}`;
  if (document.getElementById(id)) return;
  const linkEl = document.createElement("link");
  linkEl.id = id;
  linkEl.rel = "stylesheet";
  linkEl.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s/g, "+")}:wght@300;400;500;600;700;800&display=swap`;
  document.head.appendChild(linkEl);
}

export function getEntryVariants(anim: EntryAnimation, delay: number) {
  const base = { delay, duration: 0.5 };
  switch (anim) {
    case "none":
      return { initial: {}, animate: {}, transition: { duration: 0 } as const };
    case "slide-left":
      return { initial: { opacity: 0, x: -60 }, animate: { opacity: 1, x: 0 }, transition: { ...base, type: "spring" as const, stiffness: 150, damping: 20 } };
    case "slide-right":
      return { initial: { opacity: 0, x: 60 }, animate: { opacity: 1, x: 0 }, transition: { ...base, type: "spring" as const, stiffness: 150, damping: 20 } };
    case "scale":
      return { initial: { opacity: 0, scale: 0.7 }, animate: { opacity: 1, scale: 1 }, transition: { ...base, type: "spring" as const, stiffness: 200, damping: 18 } };
    case "bounce":
      return { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { ...base, type: "spring" as const, stiffness: 300, damping: 12 } };
    case "fade-up":
    default:
      return { initial: { opacity: 0, y: 25, scale: 0.92 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { ...base, type: "spring" as const, stiffness: 180, damping: 20 } };
  }
}
