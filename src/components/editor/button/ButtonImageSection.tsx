import { SmartLinkButton } from "@/types/smart-link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeftRight } from "lucide-react";
import { ImageUploader } from "../ImageUploader";

interface Props {
  button: SmartLinkButton;
  onUpdate: (id: string, updates: Partial<SmartLinkButton>) => void;
}

export function ButtonImageSection({ button, onUpdate }: Props) {
  if (button.buttonStyle !== undefined && button.buttonStyle !== "card") {
    return null;
  }

  const imgPos = button.imagePosition || "right";
  const imgOpacity = button.imageOpacity ?? 85;
  const imgSize = button.imageSize ?? 50;

  return (
    <div className="py-3 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <ArrowLeftRight className="h-3 w-3 inline mr-1" />Imagem
      </p>

      <ImageUploader
        value={button.imageUrl || ""}
        onChange={(url) => onUpdate(button.id, { imageUrl: url })}
        aspectRatio={3 / 4}
        label="Imagem do Card (opcional)"
        compact
      />

      {button.imageUrl && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Posição</Label>
            <div className="flex gap-1">
              <button
                onClick={() => onUpdate(button.id, { imagePosition: "left" })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  imgPos === "left"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground border border-border/50"
                }`}
              >
                ← Esq.
              </button>
              <button
                onClick={() => onUpdate(button.id, { imagePosition: "right" })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  imgPos === "right"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground border border-border/50"
                }`}
              >
                Dir. →
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Opacidade: {imgOpacity}%</Label>
            <Slider
              value={[imgOpacity]}
              onValueChange={([v]) => onUpdate(button.id, { imageOpacity: v })}
              min={10}
              max={100}
              step={5}
            />
          </div>

          <div className="col-span-2 space-y-1">
            <Label className="text-[11px] text-muted-foreground">Tamanho: {imgSize}%</Label>
            <Slider
              value={[imgSize]}
              onValueChange={([v]) => onUpdate(button.id, { imageSize: v })}
              min={30}
              max={70}
              step={5}
            />
          </div>
        </div>
      )}
    </div>
  );
}
