import { useState } from "react";
import { motion } from "framer-motion";
import { SmartLink } from "@/types/smart-link";
import { getOptimizedUrl } from "@/lib/image-optimization";

interface HeroImageProps {
  link: SmartLink;
  heroBgColor: string;
  isBioMode: boolean;
  curveClipId: string;
}

const MIN_HEIGHT = 80;
const MAX_HEIGHT = 500;

function isValidImageUrl(url: string): boolean {
  return typeof url === 'string' && url.length > 10 && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/'));
}

export function HeroImage({ link, heroBgColor, isBioMode, curveClipId }: HeroImageProps) {
  const [imgError, setImgError] = useState(false);

  if (!link.heroImage || imgError || !isValidImageUrl(link.heroImage)) return null;

  const objectFit = link.heroObjectFit ?? 'cover';
  const isOriginalMode = objectFit === 'none';
  const objectPos = link.heroFocalPoint
    ? `${link.heroFocalPoint.x}% ${link.heroFocalPoint.y}%`
    : 'center';
  const opacity = (link.heroImageOpacity ?? 100) / 100;
  const heightPx = isOriginalMode
    ? undefined
    : Math.min(Math.max(link.heroImageHeightPx ?? 160, MIN_HEIGHT), MAX_HEIGHT);

  return (
    <motion.div
      className="relative w-full z-[2] overflow-hidden"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{
        ...(link.bannerCurve ? { clipPath: `url(#${curveClipId})` } : {}),
        // Fixed-height modes: container controls the height and bg color
        ...(!isOriginalMode ? {
          height: heightPx,
          // contain leaves empty space — fill it with the page bg so it looks intentional
          backgroundColor: objectFit === 'contain' ? heroBgColor : undefined,
        } : {}),
      }}
    >
      <img
        src={getOptimizedUrl(link.heroImage, isOriginalMode ? 1080 : 480)}
        alt={link.businessName}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onError={() => setImgError(true)}
        style={isOriginalMode ? {
          // Original: image renders at its natural proportions — no forced height
          display: 'block',
          width: '100%',
          height: 'auto',
          opacity,
        } : {
          // Fixed-height modes: image fills the container using chosen object-fit
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: objectFit as React.CSSProperties['objectFit'],
          objectPosition: objectPos,
          opacity,
        }}
      />

      {/* Color overlay */}
      {(link.heroOverlayOpacity ?? 0) > 0 && (() => {
        const color = link.heroOverlayColor ?? 'dark';
        const bg = color === 'dark' ? '#000000' : color === 'light' ? '#ffffff' : color;
        return (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: bg, opacity: (link.heroOverlayOpacity ?? 0) / 100 }}
          />
        );
      })()}

      {/* Classic mode: gradient fade at top edge */}
      {!isBioMode && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${heroBgColor}80 0%, transparent 40%)` }}
        />
      )}
    </motion.div>
  );
}
