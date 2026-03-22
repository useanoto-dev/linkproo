import { motion } from "framer-motion";
import { LinkBlock } from "@/types/smart-link";
import { FaWhatsapp, FaInstagram, FaYoutube, FaTelegram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";

interface AnimatedButtonBlockProps {
  block: LinkBlock;
  dark?: boolean;
  onClick?: () => void;
  /** When set, overrides the URL used for navigation (pass "#" to suppress external navigation) */
  overrideUrl?: string;
}

type AnimStyle =
  | "whatsapp" | "location" | "schedule" | "cta"
  | "instagram" | "tiktok" | "youtube" | "phone" | "email" | "telegram";

const VALID_ANIM_STYLES: readonly AnimStyle[] = [
  "whatsapp", "location", "schedule", "cta",
  "instagram", "tiktok", "youtube", "phone", "email", "telegram",
];

function isAnimStyle(value: unknown): value is AnimStyle {
  return typeof value === "string" && (VALID_ANIM_STYLES as readonly string[]).includes(value);
}

// ─── Theme configs ─────────────────────────────────────────────────────────────
const THEMES: Record<AnimStyle, {
  bg: string;
  textColor: string;
  btnBg: string;
  btnText: string;
  shadow: string;
  defaultLabel: string;
  defaultSubtitle: string;
  defaultBtnText: string;
}> = {
  whatsapp: {
    bg: "linear-gradient(135deg, #044d2c 0%, #076b3e 35%, #128C7E 100%)",
    textColor: "#fff", btnBg: "#fff", btnText: "#044d2c",
    shadow: "rgba(37,211,102,0.40)",
    defaultLabel: "Chama no WhatsApp",
    defaultSubtitle: "Atendimento rápido pelo chat",
    defaultBtnText: "Falar no WhatsApp",
  },
  location: {
    bg: "linear-gradient(140deg, #040e2e 0%, #0A2463 50%, #142d80 100%)",
    textColor: "#fff", btnBg: "#fff", btnText: "#0A2463",
    shadow: "rgba(58,134,255,0.35)",
    defaultLabel: "Nossa Localização",
    defaultSubtitle: "Saiba como nos encontrar",
    defaultBtnText: "Abrir Google Maps",
  },
  schedule: {
    bg: "linear-gradient(135deg, #e8f0fe 0%, #dbeafe 60%, #bfdbfe 100%)",
    textColor: "#071c52", btnBg: "#1e40af", btnText: "#fff",
    shadow: "rgba(30,64,175,0.25)",
    defaultLabel: "Agende sua consulta",
    defaultSubtitle: "Horários disponíveis online",
    defaultBtnText: "Agendar agora",
  },
  cta: {
    bg: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
    textColor: "#fff", btnBg: "#fff", btnText: "#7c3aed",
    shadow: "rgba(124,58,237,0.40)",
    defaultLabel: "Saiba Mais",
    defaultSubtitle: "Clique e descubra",
    defaultBtnText: "Clique aqui",
  },
  instagram: {
    bg: "linear-gradient(135deg, #833ab4 0%, #c13584 45%, #fd1d1d 100%)",
    textColor: "#fff", btnBg: "#fff", btnText: "#c13584",
    shadow: "rgba(193,53,132,0.40)",
    defaultLabel: "Siga no Instagram",
    defaultSubtitle: "Conteúdo novo toda semana",
    defaultBtnText: "Ver perfil",
  },
  tiktok: {
    bg: "linear-gradient(135deg, #010101 0%, #1a1a2e 60%, #16213e 100%)",
    textColor: "#fff", btnBg: "#fff", btnText: "#010101",
    shadow: "rgba(105,201,208,0.35)",
    defaultLabel: "Me siga no TikTok",
    defaultSubtitle: "Vídeos novos toda semana",
    defaultBtnText: "Ver vídeos",
  },
  youtube: {
    bg: "linear-gradient(135deg, #b91c1c 0%, #ef4444 55%, #dc2626 100%)",
    textColor: "#fff", btnBg: "#fff", btnText: "#b91c1c",
    shadow: "rgba(239,68,68,0.40)",
    defaultLabel: "Inscreva-se no Canal",
    defaultSubtitle: "Novos vídeos toda semana",
    defaultBtnText: "Assistir agora",
  },
  phone: {
    bg: "linear-gradient(135deg, #0f4c81 0%, #1565c0 60%, #0d47a1 100%)",
    textColor: "#fff", btnBg: "#fff", btnText: "#0f4c81",
    shadow: "rgba(21,101,192,0.35)",
    defaultLabel: "Ligue para nós",
    defaultSubtitle: "Atendimento de segunda a sexta",
    defaultBtnText: "Ligar agora",
  },
  email: {
    bg: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
    textColor: "#fff", btnBg: "#fff", btnText: "#134e5e",
    shadow: "rgba(19,78,94,0.40)",
    defaultLabel: "Entre em Contato",
    defaultSubtitle: "Respondemos em até 24h",
    defaultBtnText: "Enviar mensagem",
  },
  telegram: {
    bg: "linear-gradient(135deg, #1c1c2e 0%, #0088cc 65%, #006fa8 100%)",
    textColor: "#fff", btnBg: "#fff", btnText: "#0088cc",
    shadow: "rgba(0,136,204,0.40)",
    defaultLabel: "Canal no Telegram",
    defaultSubtitle: "Novidades em primeira mão",
    defaultBtnText: "Entrar no canal",
  },
};

// ─── Icon components ────────────────────────────────────────────────────────────
function StyleIcon({ style, size }: { style: AnimStyle; size: number }) {
  const cls = "drop-shadow-lg";
  switch (style) {
    case "whatsapp":
      return <FaWhatsapp size={size} color="rgba(255,255,255,0.92)" className={cls} />;
    case "location":
      return <FaMapMarkerAlt size={size} color="rgba(255,255,255,0.92)" className={cls} />;
    case "schedule":
      return <FaCalendarAlt size={size} color="#1e3a8a" className={cls} />;
    case "cta":
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={cls}>
          <circle cx="40" cy="40" r="36" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/>
          <path d="M26 40h28M48 28l14 12-14 12" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "instagram":
      return <FaInstagram size={size} color="rgba(255,255,255,0.92)" className={cls} />;
    case "tiktok":
      return <FaTiktok size={size} color="rgba(255,255,255,0.92)" className={cls} />;
    case "youtube":
      return <FaYoutube size={size} color="rgba(255,255,255,0.92)" className={cls} />;
    case "phone":
      return <FaPhone size={size} color="rgba(255,255,255,0.92)" className={cls} />;
    case "email":
      return <FaEnvelope size={size} color="rgba(255,255,255,0.92)" className={cls} />;
    case "telegram":
      return <FaTelegram size={size} color="rgba(255,255,255,0.92)" className={cls} />;
  }
}

// ─── Main component ────────────────────────────────────────────────────────────
export function AnimatedButtonBlock({ block, onClick, overrideUrl }: AnimatedButtonBlockProps) {
  const style: AnimStyle = isAnimStyle(block.animStyle) ? block.animStyle : "cta";

  const minH = block.animButtonHeight || 130;
  const titleFontSize = block.animTitleSize || 17;

  // Scale icon size proportionally with button height
  const iconSize = minH < 110 ? 48 : minH < 150 ? 60 : 72;
  const iconColW = minH < 110 ? 72 : minH < 150 ? 84 : 96;

  // Color overrides apply to ALL styles — not just CTA
  const primaryOverride = block.animPrimaryColor;
  const secondaryOverride = block.animSecondaryColor;

  const theme = (() => {
    const base = THEMES[style];
    if (primaryOverride) {
      return {
        ...base,
        bg: `linear-gradient(135deg, ${primaryOverride} 0%, ${secondaryOverride || primaryOverride} 100%)`,
        btnText: primaryOverride,
        shadow: `${primaryOverride}66`,
      };
    }
    if (style === "cta") {
      return {
        ...base,
        bg: `linear-gradient(135deg, ${block.animPrimaryColor || "#7c3aed"} 0%, ${block.animSecondaryColor || "#4f46e5"} 100%)`,
        btnText: block.animPrimaryColor || "#7c3aed",
      };
    }
    return base;
  })();

  const url = overrideUrl !== undefined ? overrideUrl : (block.animUrl || "#");
  const label = block.content || theme.defaultLabel;
  const subtitle = block.animSubtitle !== undefined ? block.animSubtitle : theme.defaultSubtitle;
  const btnText = block.animButtonLabel || theme.defaultBtnText;

  const handleClick = () => {
    onClick?.();
    if (url && url !== "#" && typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const cardShadow = [
    `0 4px 16px ${theme.shadow}`,
    `0 10px 32px ${theme.shadow}`,
    `0 4px 16px ${theme.shadow}`,
  ];

  return (
    <div className="px-4 pb-2">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
        className="w-full rounded-2xl overflow-hidden cursor-pointer relative select-none"
        style={{ background: theme.bg, minHeight: minH }}
        animate={{ boxShadow: cardShadow }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.985, transition: { duration: 0.1 } }}
      >
        {/* Shimmer sweep */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)",
            width: "70%",
          }}
          animate={{ x: ["-100%", "250%"] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 4.5, ease: "easeInOut" }}
        />

        {/* Ripple rings — location only */}
        {style === "location" && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none z-0">
            {[0, 1.2, 2.4].map((delay) => (
              <motion.div
                key={delay}
                className="absolute rounded-full"
                style={{
                  width: 88, height: 88,
                  border: "2px solid rgba(99,162,255,0.30)",
                  top: "50%", left: "50%",
                  marginTop: -44, marginLeft: -44,
                }}
                animate={{ scale: [0.5, 2.0], opacity: [0.55, 0] }}
                transition={{ duration: 2.4, delay, repeat: Infinity, ease: "easeOut" }}
              />
            ))}
          </div>
        )}

        {/* Light gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-0" />

        {/* Content row */}
        <div className="relative z-10 flex items-center" style={{ minHeight: minH }}>
          {/* Left: text + button */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-2 px-5 py-4">
            <p
              className="font-bold leading-snug overflow-hidden"
              style={{
                color: theme.textColor,
                fontSize: titleFontSize,
                textShadow: style !== "schedule" ? "0 1px 8px rgba(0,0,0,0.20)" : "none",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {label}
            </p>
            {subtitle && (
              <p
                className="leading-snug overflow-hidden text-ellipsis whitespace-nowrap"
                style={{
                  color: theme.textColor,
                  opacity: 0.72,
                  fontSize: Math.max(10, titleFontSize - 5),
                }}
              >
                {subtitle}
              </p>
            )}
            <div
              className="mt-1 rounded-full font-bold px-3 py-1.5 w-fit max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
              style={{
                background: theme.btnBg,
                color: theme.btnText,
                fontSize: Math.max(10, titleFontSize - 5),
              }}
            >
              {btnText}
            </div>
          </div>

          {/* Right: floating icon */}
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: iconColW }}
          >
            <motion.div
              style={{ filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.22))" }}
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                <StyleIcon style={style} size={iconSize} />

                {/* WhatsApp notification badge */}
                {style === "whatsapp" && (
                  <motion.span
                    className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white font-black"
                    style={{ width: 20, height: 20, fontSize: 9, background: "#ef4444", border: "2px solid rgba(255,255,255,0.5)" }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  >1</motion.span>
                )}

                {/* Phone online dot */}
                {style === "phone" && (
                  <motion.span
                    className="absolute bottom-0 right-0 rounded-full"
                    style={{ width: 14, height: 14, background: "#22c55e", border: "2px solid rgba(255,255,255,0.7)" }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
