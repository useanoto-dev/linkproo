import type { TargetAndTransition, Transition } from "framer-motion";
import { EntryAnimation } from "@/types/smart-link";
import { getCustomBgGradient } from "@/lib/color-utils";

/** Typed shape returned by getEntryVariants and consumed by ButtonPreview / BlockRenderer. */
export type EntryVariants = {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  transition: Transition;
};

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
  // ── Sans-serif — Modern & Clean ──
  Inter: "'Inter', sans-serif",
  "Plus Jakarta Sans": "'Plus Jakarta Sans', sans-serif",
  "DM Sans": "'DM Sans', sans-serif",
  Outfit: "'Outfit', sans-serif",
  Sora: "'Sora', sans-serif",
  Manrope: "'Manrope', sans-serif",
  // ── Sans-serif — Geometric & Bold ──
  Poppins: "'Poppins', sans-serif",
  Montserrat: "'Montserrat', sans-serif",
  Raleway: "'Raleway', sans-serif",
  Rubik: "'Rubik', sans-serif",
  Nunito: "'Nunito', sans-serif",
  "Space Grotesk": "'Space Grotesk', sans-serif",
  Unbounded: "'Unbounded', sans-serif",
  // ── Serif — Elegant & Editorial ──
  "Playfair Display": "'Playfair Display', serif",
  "Cormorant Garamond": "'Cormorant Garamond', serif",
  "Libre Baskerville": "'Libre Baskerville', serif",
  "DM Serif Display": "'DM Serif Display', serif",
  Fraunces: "'Fraunces', serif",
  Lora: "'Lora', serif",
  // ── Display — Personality & Impact ──
  "Archivo Black": "'Archivo Black', sans-serif",
  "Bebas Neue": "'Bebas Neue', sans-serif",
  // ── Handwritten — Casual & Friendly ──
  Caveat: "'Caveat', cursive",
  // ── Premium (Fontshare) ──
  Satoshi: "'Satoshi', sans-serif",
  "General Sans": "'General Sans', sans-serif",
  "Cabinet Grotesk": "'Cabinet Grotesk', sans-serif",
  "Clash Display": "'Clash Display', sans-serif",
  Switzer: "'Switzer', sans-serif",
};

/** Fontshare slug map (not on Google Fonts) */
const FONTSHARE_SLUGS: Record<string, string> = {
  Satoshi: "satoshi",
  "General Sans": "general-sans",
  "Cabinet Grotesk": "cabinet-grotesk",
  "Clash Display": "clash-display",
  Switzer: "switzer",
};

export function loadGoogleFont(font: string) {
  const id = `gf-${font.replace(/\s/g, "-")}`;
  if (document.getElementById(id)) return;
  const linkEl = document.createElement("link");
  linkEl.id = id;
  linkEl.rel = "stylesheet";
  const fsSlug = FONTSHARE_SLUGS[font];
  linkEl.href = fsSlug
    ? `https://api.fontshare.com/v2/css?f[]=${fsSlug}@400,700&display=swap`
    : `https://fonts.googleapis.com/css2?family=${font.replace(/\s/g, "+")}:wght@400;700&display=swap`;
  document.head.appendChild(linkEl);
}

/**
 * Returns Framer Motion variants for the chosen entry animation.
 *
 * @param anim         - Animation type selected by the user
 * @param delay        - Stagger delay in seconds
 * @param forceAnimate - When true (editor preview), bypass prefers-reduced-motion so
 *                       the user can always see the animation they're configuring.
 *                       On the public page (default false), accessibility is respected.
 */
export function getEntryVariants(anim: EntryAnimation, delay: number, forceAnimate = false): EntryVariants {
  if (
    !forceAnimate &&
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return { initial: {}, animate: {}, transition: { duration: 0 } as const };
  }
  if (anim === "none") {
    return { initial: {}, animate: {}, transition: { duration: 0 } as const };
  }
  const base = { delay, duration: 0.55 };
  switch (anim) {
    case "slide-left":
      return { initial: { opacity: 0, x: -80 }, animate: { opacity: 1, x: 0 }, transition: { ...base, type: "spring" as const, stiffness: 140, damping: 18 } };
    case "slide-right":
      return { initial: { opacity: 0, x: 80 }, animate: { opacity: 1, x: 0 }, transition: { ...base, type: "spring" as const, stiffness: 140, damping: 18 } };
    case "scale":
      return { initial: { opacity: 0, scale: 0.6 }, animate: { opacity: 1, scale: 1 }, transition: { ...base, type: "spring" as const, stiffness: 220, damping: 16 } };
    case "bounce":
      return { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0 }, transition: { ...base, type: "spring" as const, stiffness: 320, damping: 10 } };
    case "fade-up":
    default:
      return { initial: { opacity: 0, y: 35, scale: 0.90 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { ...base, type: "spring" as const, stiffness: 170, damping: 18 } };
  }
}
