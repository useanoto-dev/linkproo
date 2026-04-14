import { SmartLink } from "@/types/smart-link";
import { SnowEffect } from "@/components/SnowEffect";
import { BubblesEffect } from "@/components/BubblesEffect";
import { FirefliesEffect } from "@/components/FirefliesEffect";
import { MatrixEffect } from "@/components/MatrixEffect";
import { StarsEffect } from "@/components/StarsEffect";
import { BgHtmlEffect } from "@/components/BgHtmlEffect";
import { FloatingEmoji } from "@/components/preview/FloatingEmoji";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface BackgroundEffectsProps {
  link: SmartLink;
}

export function BackgroundEffects({ link }: BackgroundEffectsProps) {
  // Effects that the user EXPLICITLY enabled must always render regardless of
  // prefers-reduced-motion. The user made an active choice to enable them.
  // bgHtml embeds its own @media(prefers-reduced-motion) rule internally.
  // Each canvas effect component self-regulates via IntersectionObserver and RAF.
  return (
    <>
      {link.bgHtml?.enabled && link.bgHtml.html && (
        <BgHtmlEffect key={link.bgHtml.html} html={link.bgHtml.html} />
      )}
      {link.bgHtml?.enabled && (link.bgHtml.overlay ?? 0) > 0 && (
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ backgroundColor: `rgba(0,0,0,${(link.bgHtml.overlay ?? 0) / 100})` }}
        />
      )}
      {link.starsEffect?.enabled && (
        <StarsEffect
          count={link.starsEffect.count}
          color={link.starsEffect.color}
          shooting={link.starsEffect.shooting}
        />
      )}
      {link.matrixEffect?.enabled && (
        <MatrixEffect speed={link.matrixEffect.speed} color={link.matrixEffect.color} />
      )}
      {link.snowEffect?.enabled && (
        <SnowEffect intensity={link.snowEffect.intensity} color={link.snowEffect.color} />
      )}
      {link.bubblesEffect?.enabled && (
        <BubblesEffect intensity={link.bubblesEffect.intensity} color={link.bubblesEffect.color} />
      )}
      {link.firefliesEffect?.enabled && (
        <FirefliesEffect count={link.firefliesEffect.count} color={link.firefliesEffect.color} />
      )}
      {(link.floatingEmojis ?? []).map((emoji, i) => (
        <FloatingEmoji key={`${emoji}-${i}`} emoji={emoji} delay={i * 1.5} />
      ))}
    </>
  );
}
