import { SmartLinkButton } from "@/types/smart-link";
import { Slider } from "@/components/ui/slider";
import { BUTTON_STYLE_OPTIONS } from "./shared";

interface Props {
  button: SmartLinkButton;
  onUpdate: (id: string, updates: Partial<SmartLinkButton>) => void;
}

export function ButtonStyleSection({ button, onUpdate }: Props) {
  return (
    <div className="py-3 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estilo</p>

      <div className="grid grid-cols-5 gap-1">
        {BUTTON_STYLE_OPTIONS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onUpdate(button.id, { buttonStyle: s.value })}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer border ${
              (button.buttonStyle || "card") === s.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="font-semibold">{s.label}</span>
            <span className="text-[9px] opacity-70">{s.desc}</span>
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] text-muted-foreground">Arredondamento</label>
          <span className="text-[11px] font-mono tabular-nums text-foreground">
            {button.buttonBorderRadius ?? 12}px
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={32}
          step={2}
          value={button.buttonBorderRadius ?? 12}
          onChange={(e) => onUpdate(button.id, { buttonBorderRadius: Number(e.target.value) })}
          className="w-full h-1.5 accent-primary cursor-pointer"
        />
      </div>

      {(button.buttonStyle === undefined || button.buttonStyle === "card") && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] text-muted-foreground">Altura</label>
            <span className="text-[11px] font-mono tabular-nums text-foreground">
              {button.buttonHeight ?? 110}px
            </span>
          </div>
          <Slider
            value={[button.buttonHeight ?? 110]}
            onValueChange={([v]) => onUpdate(button.id, { buttonHeight: v })}
            min={60}
            max={200}
            step={5}
          />
        </div>
      )}
    </div>
  );
}
