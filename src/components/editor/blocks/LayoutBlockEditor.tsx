import React, { memo } from "react";
import { LinkBlock } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface LayoutBlockEditorProps {
  block: LinkBlock;
  onUpdate: (id: string, updates: Partial<LinkBlock>) => void;
}

export const LayoutBlockEditor = memo(function LayoutBlockEditor({ block, onUpdate }: LayoutBlockEditorProps) {
  return (
    <>
      {block.type === "spacer" && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Altura: {block.height ?? 24}px</Label>
          <Slider
            value={[block.height ?? 24]}
            onValueChange={([v]) => onUpdate(block.id, { height: v })}
            min={8}
            max={80}
            step={4}
          />
        </div>
      )}

      {block.type === "separator" && (
        <p className="text-xs text-muted-foreground text-center">Linha divisora visual</p>
      )}

      {/* Banner Promo */}
      {block.type === "banner" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tag / Etiqueta (ex: 🔥 OFERTA)</Label>
            <Input
              value={block.bannerTag || ""}
              onChange={e => onUpdate(block.id, { bannerTag: e.target.value })}
              placeholder="🔥 OFERTA ESPECIAL"
              className="text-sm h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Título</Label>
            <Input
              value={block.content || ""}
              onChange={e => onUpdate(block.id, { content: e.target.value })}
              placeholder="50% OFF em todo o site"
              className="text-sm h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Subtítulo</Label>
            <Input
              value={block.subtitle || ""}
              onChange={e => onUpdate(block.id, { subtitle: e.target.value })}
              placeholder="Somente hoje, não perca!"
              className="text-sm h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Cor de fundo (hex)</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={block.bannerBg || "#6366f1"}
                onChange={e => onUpdate(block.id, { bannerBg: e.target.value })}
                className="w-10 h-9 rounded-lg border border-border cursor-pointer"
              />
              <Input
                value={block.bannerBg || "#6366f1"}
                onChange={e => onUpdate(block.id, { bannerBg: e.target.value })}
                className="text-sm h-9 font-mono flex-1"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
});
