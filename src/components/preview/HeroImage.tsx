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
  const zoom = (link.heroImageZoom ?? 100) / 100;
  const paddingX = link.heroBannerPaddingX ?? 0;
  const heightPx = isOriginalMode
    ? undefined
    : Math.min(Math.max(link.heroImageHeightPx ?? 160, MIN_HEIGHT), MAX_HEIGHT);

  return (
    <motion.div
      className="relative w-full z-[2]"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{
        paddingLeft: paddingX > 0 ? `${paddingX}%` : undefined,
        paddingRight: paddingX > 0 ? `${paddingX}%` : undefined,
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          ...(link.bannerCurve ? { clipPath: `url(#${curveClipId})` } : {}),
          ...(!isOriginalMode ? {
            height: heightPx,
            backgroundColor: objectFit === 'contain' ? heroBgColor : undefined,
          } : {}),
          borderRadius: paddingX > 0 ? 12 : undefined,
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
          // Original mode: zoom via width expansion + negative margin to keep centered.
          // transform:scale() doesn't work here because it doesn't affect layout flow
          // — the container stays at natural height and clips the overflow awkwardly.
          display: 'block',
          width: `${zoom * 100}%`,
          height: 'auto',
          marginLeft: zoom > 1 ? `${-(zoom - 1) * 50}%` : undefined,
          opacity,
        } : {
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: objectFit as React.CSSProperties['objectFit'],
          objectPosition: objectPos,
          opacity,
          transform: zoom !== 1 ? `scale(${zoom})` : undefined,
          transformOrigin: 'center center',
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
      </div>
    </motion.div>
  );
}
