import React, { memo, RefObject, useState } from "react";
import { LinkBlock } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextBlockEditorProps {
  block: LinkBlock;
  onUpdate: (id: string, updates: Partial<LinkBlock>) => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
  applyTextFormat: (tag: string, url?: string) => void;
}

export const TextBlockEditor = memo(function TextBlockEditor({ block, onUpdate, textareaRef, applyTextFormat }: TextBlockEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  function handleLinkConfirm() {
    applyTextFormat("a", linkUrl);
    setLinkUrl('');
    setShowLinkInput(false);
  }

  function handleLinkCancel() {
    setLinkUrl('');
    setShowLinkInput(false);
  }

  return (
    <>
      {(block.type === "text" || block.type === "cta") && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {block.type === "cta" ? "Título do CTA" : "Texto"}
            </Label>
            {block.type === "text" && (
              <div className="mb-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    title="Negrito"
                    className="px-2 py-0.5 rounded text-xs font-bold border border-border hover:bg-secondary"
                    onClick={() => applyTextFormat("b")}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    title="Itálico"
                    className="px-2 py-0.5 rounded text-xs font-bold border border-border hover:bg-secondary italic"
                    onClick={() => applyTextFormat("i")}
                  >
                    I
                  </button>
                  <button
                    type="button"
                    title="Link"
                    className={`px-2 py-0.5 rounded text-xs font-bold border border-border hover:bg-secondary${showLinkInput ? ' bg-secondary' : ''}`}
                    onClick={() => setShowLinkInput((v) => !v)}
                  >
                    🔗
                  </button>
                </div>
                {showLinkInput && (
                  <div className="flex gap-1 mt-1 items-center">
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleLinkConfirm();
                        if (e.key === 'Escape') handleLinkCancel();
                      }}
                      placeholder="https://..."
                      autoFocus
                      className="flex-1 h-7 px-2 text-xs rounded border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={handleLinkConfirm}
                      className="px-2 py-0.5 rounded text-xs font-bold border border-border hover:bg-secondary"
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={handleLinkCancel}
                      className="px-2 py-0.5 rounded text-xs border border-border hover:bg-secondary text-muted-foreground"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}
            <Textarea
              ref={block.type === "text" ? textareaRef : undefined}
              value={block.content || ""}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder={block.type === "cta" ? "Transforme Seus Projetos em Realidade" : "Seu texto aqui..."}
              className="text-sm min-h-[60px]"
            />
          </div>
          {block.type === "cta" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Subtítulo</Label>
              <Textarea
                value={block.subtitle || ""}
                onChange={(e) => onUpdate(block.id, { subtitle: e.target.value })}
                placeholder="Descrição do CTA..."
                className="text-sm min-h-[60px]"
              />
            </div>
          )}
          {/* Cor do texto */}
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Cor do texto</Label>
            <input
              type="color"
              value={block.blockTextColor || "#ffffff"}
              onChange={(e) => onUpdate(block.id, { blockTextColor: e.target.value })}
              className="h-7 w-10 rounded cursor-pointer border border-border bg-transparent p-0.5"
            />
          </div>
          {/* Alinhamento */}
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Alinhamento</Label>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map(align => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onUpdate(block.id, { blockTextAlign: align })}
                  className={`p-1 rounded text-xs ${(block.blockTextAlign || 'center') === align ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {align === 'left' ? '⬅' : align === 'center' ? '↔' : '➡'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {block.type === "header" && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Título</Label>
            <Input
              value={block.content || ""}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="Nossos Serviços"
              className="text-sm h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Emoji (opcional)</Label>
            <Input
              value={block.emoji || ""}
              onChange={(e) => onUpdate(block.id, { emoji: e.target.value })}
              placeholder="🚀"
              className="text-sm h-9 w-20 text-center text-lg"
            />
          </div>
          {/* Cor do texto */}
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Cor do texto</Label>
            <input
              type="color"
              value={block.blockTextColor || "#ffffff"}
              onChange={(e) => onUpdate(block.id, { blockTextColor: e.target.value })}
              className="h-7 w-10 rounded cursor-pointer border border-border bg-transparent p-0.5"
            />
          </div>
          {/* Alinhamento */}
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Alinhamento</Label>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map(align => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onUpdate(block.id, { blockTextAlign: align })}
                  className={`p-1 rounded text-xs ${(block.blockTextAlign || 'center') === align ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {align === 'left' ? '⬅' : align === 'center' ? '↔' : '➡'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
});
