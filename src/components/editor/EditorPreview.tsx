import { motion } from 'framer-motion';
import { EyeOff, ExternalLink } from 'lucide-react';
import { SmartLinkPreview } from '@/components/SmartLinkPreview';
import { SubPagePreview } from '@/components/SubPagePreview';
import { DeviceFrame, DeviceType, DEVICE_LABELS } from '@/components/editor/DeviceFrame';
import { SmartLink } from '@/types/smart-link';
import { useEditorStore } from '@/stores/editor-store';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  EDITOR_PREVIEW_SCALE,
  EDITOR_PREVIEW_SCALE_OFFSET_PX,
  EDITOR_PREVIEW_PANEL_WIDTH,
} from '@/lib/editor-constants';

export interface EditorPreviewProps {
  previewLink: SmartLink;
  link: SmartLink;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export function EditorPreview({
  previewLink,
  link,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}: EditorPreviewProps) {
  const device = useEditorStore((s) => s.ui.device);
  const editingSubPageId = useEditorStore((s) => s.ui.editingSubPageId);
  const isDraggingOverPreview = useEditorStore((s) => s.ui.isDraggingOverPreview);
  const ghostBlockType = useEditorStore((s) => s.ui.ghostBlockType);
  const selectedElementId = useEditorStore((s) => s.ui.selectedElementId);
  const setUI = useEditorStore((s) => s.setUI);
  const isMobile = useIsMobile();

  const subPage = editingSubPageId
    ? (link.pages || []).find((p) => p.id === editingSubPageId)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{ width: isMobile ? '100%' : EDITOR_PREVIEW_PANEL_WIDTH }}
      className={`shrink-0 border-l border-border flex flex-col items-center justify-center overflow-hidden relative ${
        isMobile
          ? 'fixed inset-0 z-50 bg-background'
          : 'bg-[radial-gradient(ellipse_80%_55%_at_50%_65%,hsl(var(--primary)/0.07),transparent)]'
      }`}
    >
      {isMobile && (
        <button
          type="button"
          onClick={() => setUI({ showPreview: false })}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-secondary border border-border cursor-pointer"
        >
          <EyeOff className="h-4 w-4" />
        </button>
      )}

      {/* Header: status dot + label + device picker */}
      <div className="flex items-center justify-between w-full mb-5 px-5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {editingSubPageId ? 'Sub-página' : 'Preview ao vivo'}
          </span>
        </div>
        <div className="flex items-center gap-0.5 p-1 rounded-lg bg-secondary/70 border border-border/60">
          {(['iphone15', 'pixel8', 'galaxy'] as DeviceType[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setUI({ device: d })}
              className={`px-2.5 py-1 rounded-md text-[9px] font-semibold transition-all cursor-pointer select-none ${
                device === d
                  ? 'bg-background text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {DEVICE_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {/* Device + ambient glow */}
      <div className="relative flex flex-col items-center">
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-72 h-24 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--primary)/0.22) 0%, transparent 70%)',
            filter: 'blur(28px)',
          }}
        />

        <div
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative transition-all duration-150 ${
            isDraggingOverPreview
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-[2.5rem]'
              : ''
          }`}
          style={{ transform: `scale(${EDITOR_PREVIEW_SCALE})`, transformOrigin: 'top center', marginBottom: `${EDITOR_PREVIEW_SCALE_OFFSET_PX}px` }}
        >
          <DeviceFrame device={device}>
            {subPage ? (
              <SubPagePreview page={subPage} link={previewLink} />
            ) : (
              <SmartLinkPreview
                link={previewLink}
                selectedId={selectedElementId ?? undefined}
                ghostBlockType={ghostBlockType ?? undefined}
                onSelectElement={(id) => {
                  setUI({ selectedElementId: id, openDrawer: null });
                }}
              />
            )}
          </DeviceFrame>

          {isDraggingOverPreview && (
            <div className="absolute inset-x-0 -bottom-8 flex items-center justify-center pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold shadow-lg animate-bounce">
                Solte aqui para adicionar
              </span>
            </div>
          )}
        </div>
      </div>

      {/* URL bar */}
      {link.slug && !editingSubPageId && (
        <a
          href={`/l/${link.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary/70 border border-border/60 text-[10px] font-mono hover:border-primary/40 hover:bg-secondary transition-all group"
        >
          <span className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
            {window.location.host}/l/
          </span>
          <span className="text-foreground font-semibold">{link.slug}</span>
          <ExternalLink className="h-2.5 w-2.5 ml-0.5 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
        </a>
      )}
      {editingSubPageId && (
        <div className="mt-6 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary font-semibold">
          Editando sub-página
        </div>
      )}
    </motion.div>
  );
}
