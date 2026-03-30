import { Eye, MousePointerClick, ExternalLink, Copy, Trash2, Pencil, QrCode, CopyPlus, Share2, ToggleLeft, ToggleRight, Download, MessageCircle, CheckSquare, Square } from "lucide-react";
import { SmartLink } from "@/types/smart-link";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useRef, useCallback } from "react";
import { getPublicLinkUrl } from "@/hooks/use-links";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

interface SmartLinkCardProps {
  link: SmartLink;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleActive?: (id: string, active: boolean) => void;
  selectionMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

type Overlay = null | "delete" | "qr" | "share";

export function SmartLinkCard({ link, onDelete, onDuplicate, onToggleActive, selectionMode, selected, onSelect }: SmartLinkCardProps) {
  const navigate = useNavigate();
  const [overlay, setOverlay] = useState<Overlay>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const shareUrl = getPublicLinkUrl(link.slug);

  const downloadQr = useCallback(() => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${link.slug}.png`;
    a.click();
    toast.success("QR Code baixado!");
  }, [link.slug]);

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Confira: ${shareUrl}`)}`, "_blank");
  };

  const conversionRate = link.views > 0 ? Math.round(((link.clicks ?? 0) / link.views) * 100) : 0;

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`rounded-xl overflow-hidden group hover:glow-border transition-all duration-300 relative bg-card border ${selected ? "border-primary ring-2 ring-primary" : "border-border"}`}
    >
      {/* Overlay */}
      <AnimatePresence>
        {overlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-5 rounded-xl"
          >
            {overlay === "delete" && (
              <>
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mb-1">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-sm font-semibold text-foreground">Excluir este link?</p>
                <p className="text-xs text-muted-foreground text-center">Essa ação não pode ser desfeita</p>
                <div className="flex gap-2 mt-1">
                  <button type="button" onClick={() => setOverlay(null)} className="px-4 py-2 rounded-lg text-xs font-medium bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors cursor-pointer select-none">
                    Cancelar
                  </button>
                  <button type="button" onClick={() => { onDelete?.(link.id); setOverlay(null); }} className="px-4 py-2 rounded-lg text-xs font-medium bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity cursor-pointer select-none">
                    Excluir
                  </button>
                </div>
              </>
            )}

            {overlay === "qr" && (
              <>
                <div ref={qrRef} className="bg-white p-3 rounded-2xl shadow-lg">
                  <QRCodeCanvas value={shareUrl} size={160} level="H" includeMargin={false} />
                </div>
                <p className="text-[10px] text-muted-foreground text-center truncate max-w-full font-mono">{shareUrl}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={downloadQr} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer select-none">
                    <Download className="h-3.5 w-3.5" />
                    Baixar PNG
                  </button>
                  <button type="button" onClick={() => setOverlay(null)} className="px-3 py-2 rounded-lg text-xs font-medium bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors cursor-pointer select-none">
                    Fechar
                  </button>
                </div>
              </>
            )}

            {overlay === "share" && (
              <>
                <p className="text-sm font-semibold text-foreground mb-1">Compartilhar</p>
                <div className="w-full space-y-2">
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success("Link copiado!"); setOverlay(null); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-secondary/60 border border-border/50 text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer select-none"
                  >
                    <Copy className="h-3.5 w-3.5 text-primary" />
                    Copiar Link
                  </button>
                  <button
                    type="button"
                    onClick={() => { shareWhatsApp(); setOverlay(null); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-secondary/60 border border-border/50 text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer select-none"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-green-400" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOverlay("qr"); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-secondary/60 border border-border/50 text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer select-none"
                  >
                    <QrCode className="h-3.5 w-3.5 text-accent" />
                    QR Code
                  </button>
                </div>
                <button type="button" onClick={() => setOverlay(null)} className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none">
                  Cancelar
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection checkbox overlay */}
      {selectionMode && (
        <button
          type="button"
          onClick={() => onSelect?.(link.id)}
          className="absolute top-2 left-2 z-30 p-0.5 rounded transition-colors cursor-pointer select-none"
          title={selected ? "Desselecionar" : "Selecionar"}
        >
          {selected
            ? <CheckSquare className="h-5 w-5 text-primary drop-shadow" />
            : <Square className="h-5 w-5 text-white drop-shadow" />
          }
        </button>
      )}

      {/* Hero preview */}
      <div
        onClick={() => selectionMode ? onSelect?.(link.id) : navigate(`/links/${link.id}/edit`)}
        className="relative h-28 overflow-hidden cursor-pointer"
      >
        {link.heroImage ? (
          <img src={link.heroImage} alt={link.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`w-full h-full ${link.backgroundColor?.startsWith("custom:") ? "" : `bg-gradient-to-br ${link.backgroundColor || "from-gray-800 to-gray-900"}`}`}
            style={link.backgroundColor?.startsWith("custom:") ? { background: `linear-gradient(135deg, ${link.backgroundColor.split(":")[1]}, ${link.backgroundColor.split(":")[2]})` } : undefined}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        
        {/* Logo */}
        {link.logoUrl && (
          <img src={link.logoUrl} alt={`Logo de ${link.businessName}`} className="absolute bottom-2 left-3 w-8 h-8 rounded-lg object-cover ring-2 ring-card shadow-md" />
        )}
        
        <div className={`absolute bottom-2 ${link.logoUrl ? "left-13" : "left-3"} right-3`}>
          <h3 className="font-display font-bold text-foreground text-sm truncate">
            {(link.businessName || "Sem nome").replace(/<[^>]*>/g, "").trim() || "Sem nome"}
          </h3>
          {link.tagline && (
            <p className="text-[10px] text-muted-foreground truncate">
              {link.tagline.replace(/<[^>]*>/g, "").trim()}
            </p>
          )}
        </div>

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleActive?.(link.id, !link.isActive); }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer select-none ${
              link.isActive
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {link.isActive ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
            {link.isActive ? "Ativo" : "Inativo"}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-3 py-2 flex items-center gap-3 border-b border-border/50">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Eye className="h-3 w-3" />
          <span className="text-[11px] font-medium">{link.views.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MousePointerClick className="h-3 w-3" />
          <span className="text-[11px] font-medium">{link.clicks.toLocaleString()}</span>
        </div>
        {conversionRate > 0 && (
          <span className="text-[10px] font-semibold text-primary">{conversionRate}% conv.</span>
        )}
        <div className="flex-1" />
        <span className="text-[10px] text-muted-foreground">
          {link.buttons.length} botões · {link.blocks.length} blocos
        </span>
      </div>

      {/* Actions */}
      <div className="px-3 py-2 flex items-center gap-1">
        <button type="button" onClick={() => navigate(`/links/${link.id}/edit`)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Editar">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {onDuplicate && (
          <button type="button" onClick={() => onDuplicate(link.id)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Duplicar">
            <CopyPlus className="h-3.5 w-3.5" />
          </button>
        )}
        {link.slug && (
          <button type="button" onClick={() => setOverlay("share")} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Compartilhar">
            <Share2 className="h-3.5 w-3.5" />
          </button>
        )}
        {link.slug && (
          <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Abrir">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        <div className="flex-1" />
        {link.slug && (
          <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success("Link copiado!"); }}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors truncate max-w-[140px] cursor-pointer select-none"
          >
            <Copy className="h-3 w-3 shrink-0" />
            /{link.slug}
          </button>
        )}
        {onDelete && (
          <button type="button" onClick={() => setOverlay("delete")} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer" title="Excluir">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
