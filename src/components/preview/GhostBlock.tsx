import { motion } from "framer-motion";
import { BlockType } from "@/types/smart-link";

const GHOST_BLOCK_LABELS: Partial<Record<BlockType, string>> = {
  text: "Escreva seu texto aqui...",
  title: "Escreva seu título...",
  richtext: "Escreva seu conteúdo...",
  cta: "Chamada para ação...",
  banner: "Banner de destaque",
  stats: "Bloco de estatísticas",
  badges: "Selos / Badges",
  testimonial: "Depoimento de cliente",
  image: "Imagem",
  video: "Vídeo",
  spacer: "Espaçador",
  "email-capture": "Captura de e-mail",
  countdown: "Contagem regressiva",
  spotify: "Player Spotify",
  map: "Mapa",
  carousel: "Carrossel de imagens",
  "animated-button": "Botão animado",
  product: "Card de produto",
  contacts: "Bloco de contatos",
  faq: "Perguntas frequentes",
  gallery: "Galeria de fotos",
  html: "Bloco HTML",
};

interface GhostBlockProps {
  blockType: BlockType;
  dark: boolean;
}

export function GhostBlock({ blockType, dark }: GhostBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="mx-1 mb-2"
    >
      <div className={`rounded-xl border-2 border-dashed px-4 py-3 text-center transition-colors ${
        dark
          ? "border-white/30 bg-white/5 text-white/60"
          : "border-primary/40 bg-primary/5 text-primary/70"
      }`}>
        <p className="text-[11px] font-medium">
          {GHOST_BLOCK_LABELS[blockType] ?? "Novo bloco"}
        </p>
        <p className={`text-[10px] mt-0.5 ${dark ? "text-white/30" : "text-muted-foreground"}`}>
          Solte para adicionar
        </p>
      </div>
    </motion.div>
  );
}
