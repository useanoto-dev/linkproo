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

export function HeroImage({ link, heroBgColor, isBioMode, curveClipId }: HeroImageProps) {
  const [imgError, setImgError] = useState(false);
  if (!link.heroImage || imgError) return null;

  // Resolve height — new px value takes precedence over legacy enum
  const heightPx: number = link.heroImageHeightPx ?? 192;
  const objectFit = link.heroObjectFit ?? 'cover';
  const objectPos = link.heroFocalPoint
    ? `${link.heroFocalPoint.x}% ${link.heroFocalPoint.y}%`
    : 'center';

  return (
    <motion.div
      className="relative w-full z-[2]"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      // Curve: clip the entire banner (image + overlay) with a curved bottom — any mode
      style={link.bannerCurve ? { clipPath: `url(#${curveClipId})` } : undefined}
    >
      <img
        src={getOptimizedUrl(link.heroImage, 480)}
        alt={link.businessName}
        width={480}
        height={heightPx}
        className="w-full"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onError={() => setImgError(true)}
        style={{
          height:         heightPx,
          objectFit,
          objectPosition: objectPos,
          display:        'block',
          opacity:        (link.heroImageOpacity ?? 100) / 100,
        }}
      />
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
          className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, ${heroBgColor}80 0%, transparent 40%)` }}
        />
      )}
    </motion.div>
  );
}
