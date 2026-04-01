import { SmartLinkButton } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { ColorState, BUTTON_COLOR_MODE_OPTIONS, gradientOptions } from "./shared";

interface Props {
  button: SmartLinkButton;
  colorState: ColorState;
  setColorState: React.Dispatch<React.SetStateAction<ColorState>>;
  onUpdate: (id: string, updates: Partial<SmartLinkButton>) => void;
  onApplyToAll?: () => void;
}

export function ButtonColorsSection({ button, colorState, setColorState, onUpdate, onApplyToAll }: Props) {
  if (button.buttonStyle !== undefined && button.buttonStyle !== "card" && button.buttonStyle !== "pill") {
    return null;
  }

  return (
    <div className="py-3 space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cor do Botão</p>

      {/* Mode tabs */}
      <div className="flex gap-0.5 p-0.5 rounded-lg bg-secondary/60 border border-border/30">
        {BUTTON_COLOR_MODE_OPTIONS.map((mode) => (
          <button
            key={mode.value}
            onClick={() => setColorState((s) => ({ ...s, mode: mode.value }))}
            className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all ${
              colorState.mode === mode.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {colorState.mode === "preset" && (
        <div className="grid grid-cols-5 gap-1.5">
          {gradientOptions.map((g) => (
            <button
              key={g.value}
              onClick={() => onUpdate(button.id, { gradientColor: g.value })}
              title={g.label}
              className={`h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                button.gradientColor === g.value
                  ? "border-foreground scale-110 shadow-lg"
                  : "border-transparent hover:border-border"
              }`}
              style={{ background: g.css }}
            />
          ))}
        </div>
      )}

      {colorState.mode === "solid" && (
        <div className="flex items-center gap-2">
          <div className="relative w-9 h-9 rounded-lg border border-border overflow-hidden cursor-pointer shrink-0">
            <input
              type="color"
              value={colorState.solidColor}
              onChange={(e) => {
                setColorState((s) => ({ ...s, solidColor: e.target.value }));
                onUpdate(button.id, { gradientColor: `custom:${e.target.value}:${e.target.value}` });
              }}
              className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0"
            />
            <div className="w-full h-full" style={{ backgroundColor: colorState.solidColor }} />
          </div>
          <Input
            value={colorState.solidColor}
            onChange={(e) => {
              setColorState((s) => ({ ...s, solidColor: e.target.value }));
              onUpdate(button.id, { gradientColor: `custom:${e.target.value}:${e.target.value}` });
            }}
            className="text-xs h-9 font-mono flex-1"
            placeholder="#2563eb"
          />
        </div>
      )}

      {colorState.mode === "gradient" && (
        <div className="space-y-2">
          <div
            className="h-8 rounded-lg border border-border/50"
            style={{ background: `linear-gradient(135deg, ${colorState.customFrom}, ${colorState.customTo})` }}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <div className="relative w-7 h-7 rounded-md border border-border overflow-hidden cursor-pointer shrink-0">
                <input
                  type="color"
                  value={colorState.customFrom}
                  onChange={(e) => setColorState((s) => ({ ...s, customFrom: e.target.value }))}
                  className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0"
                />
                <div className="w-full h-full" style={{ backgroundColor: colorState.customFrom }} />
              </div>
              <Input
                value={colorState.customFrom}
                onChange={(e) => setColorState((s) => ({ ...s, customFrom: e.target.value }))}
                className="text-[10px] h-7 font-mono"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="relative w-7 h-7 rounded-md border border-border overflow-hidden cursor-pointer shrink-0">
                <input
                  type="color"
                  value={colorState.customTo}
                  onChange={(e) => setColorState((s) => ({ ...s, customTo: e.target.value }))}
                  className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0"
                />
                <div className="w-full h-full" style={{ backgroundColor: colorState.customTo }} />
              </div>
              <Input
                value={colorState.customTo}
                onChange={(e) => setColorState((s) => ({ ...s, customTo: e.target.value }))}
                className="text-[10px] h-7 font-mono"
              />
            </div>
          </div>
          <button
            onClick={() =>
              onUpdate(button.id, {
                gradientColor: `custom:${colorState.customFrom}:${colorState.customTo}`,
              })
            }
            className="w-full h-8 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
          >
            Aplicar degradê
          </button>
        </div>
      )}

      {onApplyToAll && (
        <button
          type="button"
          onClick={onApplyToAll}
          className="w-full h-8 rounded-lg text-[11px] font-medium border border-border/60 hover:bg-secondary/60 transition-colors text-muted-foreground hover:text-foreground mt-1"
        >
          Aplicar cor a todos os botões
        </button>
      )}
    </div>
  );
}
