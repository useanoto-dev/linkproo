import { useEffect, useRef, useState } from "react";
import { WhatsAppFloat as WFConfig } from "@/types/smart-link";

interface Props {
  config: WFConfig;
  /** No editor o botão usa position:absolute (evita ser clipado pelo transform/overflow do DeviceFrame).
   *  Na página pública usa position:fixed (comportamento correto no viewport). */
  isEditorPreview?: boolean;
}

function WhatsAppIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
        fill="white"
      />
      <path
        d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.979-1.406A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.182a8.182 8.182 0 01-4.394-1.277l-.315-.187-3.263.921.921-3.177-.205-.326A8.182 8.182 0 1112 20.182z"
        fill="white"
      />
    </svg>
  );
}

export function WhatsAppFloat({ config, isEditorPreview = false }: Props) {
  if (!config.enabled) return null;

  const {
    phone,
    message,
    label,
    showLabel = true,
    position = "bottom-right",
    animation = "pulse",
    labelDelayMs = 1500,
    labelDurationMs = 4000,
    labelHiddenMs = 5000,
  } = config;

  const isRight = position === "bottom-right";

  const [labelShown, setLabelShown] = useState(false);
  // animKey forces CSS animation restart when animation type changes
  const [animKey, setAnimKey] = useState(0);
  const prevAnimRef = useRef(animation);

  // Force CSS animation restart on animation type change
  useEffect(() => {
    if (prevAnimRef.current !== animation) {
      prevAnimRef.current = animation;
      setAnimKey((k) => k + 1);
    }
  }, [animation]);

  // Label visibility cycle: delay → visible → hidden → repeat
  useEffect(() => {
    if (!showLabel || !label) return;
    const init = setTimeout(() => setLabelShown(true), labelDelayMs);
    return () => clearTimeout(init);
  }, [showLabel, label, labelDelayMs]);

  useEffect(() => {
    if (!showLabel || !label) return;
    if (!labelShown) {
      const t = setTimeout(() => setLabelShown(true), labelHiddenMs);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setLabelShown(false), labelDurationMs);
      return () => clearTimeout(t);
    }
  }, [labelShown, showLabel, label, labelDurationMs, labelHiddenMs]);

  const waUrl = `https://wa.me/${phone.replace(/\D/g, "")}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

  const animClass =
    animation === "pulse"
      ? "wa-float-pulse"
      : animation === "bounce"
      ? "wa-float-bounce"
      : "";

  const btnEl = (
    <a
      key={`btn-${animKey}`}
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir WhatsApp"
      title="Falar no WhatsApp"
      className={`wa-float-btn${animClass ? ` ${animClass}` : ""}`}
    >
      <WhatsAppIcon size={28} />
    </a>
  );

  const labelEl = showLabel && label ? (
    <div
      className={`wa-float-label${!isRight ? " wa-float-label-left" : ""}`}
      data-shown={String(labelShown)}
      aria-hidden={!labelShown}
    >
      <span className="text-[13px] font-medium text-gray-800 whitespace-nowrap leading-none">
        {label}
      </span>
      {/* Arrow tip pointing toward the button */}
      <span
        className={`absolute top-1/2 -translate-y-1/2 border-[5px] border-transparent ${
          isRight
            ? "right-[-9px] border-l-white"
            : "left-[-9px] border-r-white"
        }`}
        aria-hidden="true"
      />
    </div>
  ) : null;

  // No editor: position absolute (relativo ao SmartLinkPreview que tem position:relative)
  // Na página pública: position fixed (relativo ao viewport)
  const positionClass = isEditorPreview ? "absolute" : "fixed";

  return (
    <div
      className={`${positionClass} z-[200] flex items-center gap-3 ${isRight ? "flex-row-reverse" : "flex-row"} ${
        isRight ? "right-4" : "left-4"
      }`}
      style={{ bottom: "24px" }}
    >
      {btnEl}
      {labelEl}
    </div>
  );
}
