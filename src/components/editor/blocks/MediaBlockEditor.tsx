import React, { memo } from "react";
import { LinkBlock, CarouselSlide } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ImageUploader } from "../ImageUploader";
import { Trash2 } from "lucide-react";

interface MediaBlockEditorProps {
  block: LinkBlock;
  onUpdate: (id: string, updates: Partial<LinkBlock>) => void;
}

export const MediaBlockEditor = memo(function MediaBlockEditor({ block, onUpdate }: MediaBlockEditorProps) {
  return (
    <>
      {block.type === "image" && (
        <>
          <ImageUploader
            value={block.imageUrl || ""}
            onChange={(url) => onUpdate(block.id, { imageUrl: url })}
            aspectRatio={16 / 9}
            label="Imagem"
          />
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Arredondamento: {block.borderRadius ?? 12}px</Label>
            <Slider
              value={[block.borderRadius ?? 12]}
              onValueChange={([v]) => onUpdate(block.id, { borderRadius: v })}
              min={0}
              max={32}
              step={2}
            />
          </div>
        </>
      )}

      {block.type === "video" && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">URL do Vídeo (YouTube ou Vimeo)</Label>
          <Input
            value={block.videoUrl || ""}
            onChange={(e) => onUpdate(block.id, { videoUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            className="text-sm h-9 font-mono"
          />
        </div>
      )}

      {block.type === "spotify" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">URL do Spotify</Label>
            <Input
              value={block.spotifyUrl || ""}
              onChange={e => onUpdate(block.id, { spotifyUrl: e.target.value })}
              placeholder="https://open.spotify.com/track/..."
              className="text-sm h-9 font-mono"
            />
            <p className="text-[10px] text-muted-foreground">Cole o link de música, playlist ou álbum</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`spotify-compact-${block.id}`}
              checked={block.spotifyCompact ?? false}
              onChange={e => onUpdate(block.id, { spotifyCompact: e.target.checked })}
              className="rounded cursor-pointer"
            />
            <Label htmlFor={`spotify-compact-${block.id}`} className="text-xs text-muted-foreground cursor-pointer">
              Modo compacto (altura menor)
            </Label>
          </div>
        </div>
      )}

      {block.type === "map" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Endereço ou nome do local</Label>
            <Input
              value={block.mapAddress || ""}
              onChange={e => onUpdate(block.id, { mapAddress: e.target.value })}
              placeholder="Ex: Av. Paulista 1000, São Paulo"
              className="text-sm h-9"
            />
            <p className="text-[10px] text-muted-foreground">
              Recomendado: preencha o endereço acima para mostrar o mapa automaticamente.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Link externo (opcional)</Label>
            <Textarea
              value={block.mapUrl || ""}
              onChange={e => onUpdate(block.id, { mapUrl: e.target.value })}
              placeholder="https://maps.app.goo.gl/... ou https://www.google.com/maps/embed?pb=..."
              className="text-sm min-h-[60px] font-mono"
            />
            <p className="text-[10px] text-muted-foreground">
              Cole aqui um link de compartilhamento ou URL embed. Usado como botão "Abrir no Google Maps".
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Altura: {block.mapHeight ?? 220}px</Label>
            <Slider
              value={[block.mapHeight ?? 220]}
              onValueChange={([v]) => onUpdate(block.id, { mapHeight: v })}
              min={150}
              max={400}
              step={10}
            />
          </div>
        </div>
      )}

      {block.type === "html" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Conteúdo HTML</Label>
            <Textarea
              value={block.htmlContent || ""}
              onChange={e => onUpdate(block.id, { htmlContent: e.target.value })}
              placeholder="<div>Seu HTML aqui...</div>"
              className="font-mono text-xs min-h-[120px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Altura: {block.htmlHeight ? `${block.htmlHeight}px` : "Automática"}
            </Label>
            <Slider
              value={[block.htmlHeight || 0]}
              onValueChange={([v]) => onUpdate(block.id, { htmlHeight: v === 0 ? undefined : v })}
              min={0}
              max={800}
              step={10}
            />
            <p className="text-[10px] text-muted-foreground mt-1">0 = altura automática</p>
          </div>
        </div>
      )}

      {block.type === "carousel" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(block.carouselSlides || []).map((slide) => (
              <div key={slide.id} className="relative group rounded-lg overflow-hidden border border-border/40">
                <img src={slide.url} alt="" className="w-full h-16 object-cover" />
                <button
                  onClick={() => onUpdate(block.id, { carouselSlides: (block.carouselSlides || []).filter(s => s.id !== slide.id) })}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            ))}
          </div>
          <ImageUploader
            value=""
            onChange={url => {
              const newSlide: CarouselSlide = { id: `slide-${Date.now()}`, url };
              onUpdate(block.id, { carouselSlides: [...(block.carouselSlides || []), newSlide] });
            }}
            aspectRatio={16 / 9}
            label="Adicionar slide"
            compact
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`carousel-auto-${block.id}`}
              checked={block.carouselAutoplay ?? true}
              onChange={e => onUpdate(block.id, { carouselAutoplay: e.target.checked })}
              className="cursor-pointer"
            />
            <Label htmlFor={`carousel-auto-${block.id}`} className="text-xs text-muted-foreground cursor-pointer">
              Autoplay
            </Label>
          </div>
        </div>
      )}
    </>
  );
});
