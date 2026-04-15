import { memo } from "react";
import { SmartLink } from "@/types/smart-link";
import { SnowEffect } from "@/components/SnowEffect";
import { BubblesEffect } from "@/components/BubblesEffect";
import { FirefliesEffect } from "@/components/FirefliesEffect";
import { MatrixEffect } from "@/components/MatrixEffect";
import { StarsEffect } from "@/components/StarsEffect";
import { BgHtmlEffect } from "@/components/BgHtmlEffect";
import { FloatingEmoji } from "@/components/preview/FloatingEmoji";

// Only the fields this component actually reads — keeps memo comparisons tight.
type BackgroundEffectsProps = Pick<
  SmartLink,
  | "bgHtml"
  | "snowEffect"
  | "bubblesEffect"
  | "firefliesEffect"
  | "matrixEffect"
  | "starsEffect"
  | "floatingEmojis"
>;

export const BackgroundEffects = memo(function BackgroundEffects({
  bgHtml,
  snowEffect,
  bubblesEffect,
  firefliesEffect,
  matrixEffect,
  starsEffect,
  floatingEmojis,
}: BackgroundEffectsProps) {
  // Effects that the user EXPLICITLY enabled must always render regardless of
  // prefers-reduced-motion. The user made an active choice to enable them.
  // bgHtml embeds its own @media(prefers-reduced-motion) rule internally.
  // Each canvas effect component self-regulates via IntersectionObserver and RAF.
  return (
    <>
      {bgHtml?.enabled && bgHtml.html && (
        <BgHtmlEffect key={bgHtml.html} html={bgHtml.html} />
      )}
      {bgHtml?.enabled && (bgHtml.overlay ?? 0) > 0 && (
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ backgroundColor: `rgba(0,0,0,${(bgHtml.overlay ?? 0) / 100})` }}
        />
      )}
      {starsEffect?.enabled && (
        <StarsEffect
          count={starsEffect.count}
          color={starsEffect.color}
          shooting={starsEffect.shooting}
        />
      )}
      {matrixEffect?.enabled && (
        <MatrixEffect speed={matrixEffect.speed} color={matrixEffect.color} />
      )}
      {snowEffect?.enabled && (
        <SnowEffect intensity={snowEffect.intensity} color={snowEffect.color} />
      )}
      {bubblesEffect?.enabled && (
        <BubblesEffect intensity={bubblesEffect.intensity} color={bubblesEffect.color} />
      )}
      {firefliesEffect?.enabled && (
        <FirefliesEffect count={firefliesEffect.count} color={firefliesEffect.color} />
      )}
      {(floatingEmojis ?? []).map((emoji, i) => (
        <FloatingEmoji key={`${emoji}-${i}`} emoji={emoji} delay={i * 1.5} />
      ))}
    </>
  );
});
