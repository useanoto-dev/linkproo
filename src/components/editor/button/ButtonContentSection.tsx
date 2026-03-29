import { SmartLinkButton } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BUTTON_ALIGN_OPTIONS } from "./shared";

interface Props {
  button: SmartLinkButton;
  onUpdate: (id: string, updates: Partial<SmartLinkButton>) => void;
}

export function ButtonContentSection({ button, onUpdate }: Props) {
  return (
    <div className="py-3 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Conteúdo</p>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Título</Label>
          <Input
            value={button.label}
            onChange={(e) => onUpdate(button.id, { label: e.target.value })}
            placeholder="Ex: Fale conosco"
            className="text-sm h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Subtítulo</Label>
          <Input
            value={button.subtitle}
            onChange={(e) => onUpdate(button.id, { subtitle: e.target.value })}
            placeholder="Ex: Chama no Whats"
            className="text-sm h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">
            Tamanho: {button.titleSize ?? 16}px
          </Label>
          <Slider
            value={[button.titleSize ?? 16]}
            onValueChange={([v]) => onUpdate(button.id, { titleSize: v })}
            min={12}
            max={28}
            step={1}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Alinhamento</Label>
          <div className="flex gap-1">
            {BUTTON_ALIGN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onUpdate(button.id, { textAlign: opt.value })}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs transition-all ${
                  (button.textAlign || "center") === opt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground border border-border/50"
                }`}
              >
                <opt.icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Emoji row */}
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">Emoji / Ícone</Label>
        <Input
          value={button.iconEmoji || ""}
          onChange={(e) => onUpdate(button.id, { iconEmoji: e.target.value })}
          placeholder="💬 Cole ou digita um emoji"
          className="text-sm h-8"
        />
      </div>

      {/* Badge row */}
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">Badge (canto)</Label>
        <div className="flex items-center gap-1.5">
          <Input
            value={button.badgeLabel || ""}
            onChange={(e) => onUpdate(button.id, { badgeLabel: e.target.value })}
            placeholder="NOVO · 🔥 · GRÁTIS"
            className="text-sm h-8 flex-1"
          />
          <div className="relative w-8 h-8 rounded-lg border border-border overflow-hidden cursor-pointer shrink-0">
            <input
              type="color"
              value={button.badgeColor || "#ef4444"}
              onChange={(e) => onUpdate(button.id, { badgeColor: e.target.value })}
              className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0"
            />
            <div
              className="w-full h-full rounded-lg"
              style={{ backgroundColor: button.badgeColor || "#ef4444" }}
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Aparece no canto superior do botão • cor ao lado
        </p>
      </div>
    </div>
  );
}
