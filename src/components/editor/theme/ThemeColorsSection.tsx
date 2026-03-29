import React, { useState, useEffect } from "react";
import { SmartLink } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Palette, RotateCcw } from "lucide-react";
import { SectionHeader } from "./shared";

interface ThemeColorsSectionProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
}

const bgPresets = [
  {
    label: "Neve",
    value: "from-gray-50 to-white",
    from: "#f9fafb",
    to: "#ffffff",
  },
  {
    label: "Creme",
    value: "from-orange-50 to-amber-50",
    from: "#fff7ed",
    to: "#fffbeb",
  },
  {
    label: "Céu",
    value: "from-blue-50 to-sky-100",
    from: "#eff6ff",
    to: "#e0f2fe",
  },
  {
    label: "Menta",
    value: "from-green-50 to-emerald-50",
    from: "#f0fdf4",
    to: "#ecfdf5",
  },
  {
    label: "Rosa",
    value: "from-pink-50 to-rose-100",
    from: "#fdf2f8",
    to: "#ffe4e6",
  },
  {
    label: "Lavanda",
    value: "from-violet-50 to-purple-100",
    from: "#f5f3ff",
    to: "#ede9fe",
  },
  {
    label: "Escuro",
    value: "from-slate-950 to-slate-900",
    from: "#020617",
    to: "#0f172a",
  },
  {
    label: "Índigo",
    value: "from-blue-950 to-indigo-950",
    from: "#172554",
    to: "#1e1b4b",
  },
  {
    label: "Floresta",
    value: "from-green-950 to-emerald-950",
    from: "#052e16",
    to: "#022c22",
  },
  {
    label: "Vinho",
    value: "from-rose-950 to-red-950",
    from: "#4c0519",
    to: "#450a0a",
  },
  {
    label: "Roxo",
    value: "from-purple-950 to-indigo-950",
    from: "#3b0764",
    to: "#1e1b4b",
  },
  {
    label: "Brasa",
    value: "from-red-950 to-orange-950",
    from: "#450a0a",
    to: "#431407",
  },
];

export function ThemeColorsSection({
  link,
  onUpdateLink,
}: ThemeColorsSectionProps) {
  const [customBg, setCustomBg] = useState({
    from: "#1a1a2e",
    to: "#16213e",
    isGradient: false,
  });

  useEffect(() => {
    if (!link.backgroundColor.startsWith("custom:")) return;
    const parts = link.backgroundColor.split(":");
    const from = parts[1] ?? "#1a1a2e";
    const to = parts[2] ?? "#16213e";
    setCustomBg({ from, to, isGradient: from !== to });
  }, [link.backgroundColor]);

  return (
    <section className="space-y-3">
      <SectionHeader icon={Palette} label="Cores" />

      {/* Background presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-muted-foreground">
          Fundo predefinido
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {bgPresets.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdateLink({ backgroundColor: opt.value })}
              title={opt.label}
              className={`h-9 rounded-lg bg-gradient-to-br ${
                opt.value
              } border-2 transition-all duration-200 hover:scale-105 relative ${
                link.backgroundColor === opt.value
                  ? "border-primary ring-1 ring-primary/30 scale-105 shadow-md"
                  : "border-transparent hover:border-border/50"
              }`}
            >
              {link.backgroundColor === opt.value && (
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom color */}
      <div className="p-3 rounded-xl bg-secondary/20 border border-border/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-foreground">
            Cor personalizada
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Degradê</span>
            <Switch
              checked={customBg.isGradient}
              onCheckedChange={(v) =>
                setCustomBg((s) => ({ ...s, isGradient: v }))
              }
            />
          </div>
        </div>

        {!customBg.isGradient ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative w-9 h-9 rounded-lg border border-border overflow-hidden shrink-0 cursor-pointer">
                <input
                  type="color"
                  value={customBg.from}
                  onChange={(e) =>
                    setCustomBg((s) => ({
                      ...s,
                      from: e.target.value,
                      to: e.target.value,
                    }))
                  }
                  className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0"
                />
                <div
                  className="w-full h-full rounded-lg"
                  style={{ backgroundColor: customBg.from }}
                />
              </div>
              <Input
                value={customBg.from}
                onChange={(e) =>
                  setCustomBg((s) => ({
                    ...s,
                    from: e.target.value,
                    to: e.target.value,
                  }))
                }
                placeholder="#1a1a2e"
                className="text-xs h-9 font-mono"
              />
            </div>
            <button
              onClick={() =>
                onUpdateLink({
                  backgroundColor: `custom:${customBg.from}:${customBg.from}`,
                })
              }
              className="w-full h-8 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all"
            >
              Aplicar Cor
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div
              className="h-8 rounded-lg border border-border/50"
              style={{
                background: `linear-gradient(135deg, ${customBg.from}, ${customBg.to})`,
              }}
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[9px] text-muted-foreground font-medium">
                  Cor inicial
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="relative w-7 h-7 rounded-md border border-border overflow-hidden shrink-0 cursor-pointer">
                    <input
                      type="color"
                      value={customBg.from}
                      onChange={(e) =>
                        setCustomBg((s) => ({ ...s, from: e.target.value }))
                      }
                      className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0"
                    />
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: customBg.from }}
                    />
                  </div>
                  <Input
                    value={customBg.from}
                    onChange={(e) =>
                      setCustomBg((s) => ({ ...s, from: e.target.value }))
                    }
                    className="text-[10px] h-7 font-mono px-1.5"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-muted-foreground font-medium">
                  Cor final
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="relative w-7 h-7 rounded-md border border-border overflow-hidden shrink-0 cursor-pointer">
                    <input
                      type="color"
                      value={customBg.to}
                      onChange={(e) =>
                        setCustomBg((s) => ({ ...s, to: e.target.value }))
                      }
                      className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0"
                    />
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: customBg.to }}
                    />
                  </div>
                  <Input
                    value={customBg.to}
                    onChange={(e) =>
                      setCustomBg((s) => ({ ...s, to: e.target.value }))
                    }
                    className="text-[10px] h-7 font-mono px-1.5"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                onUpdateLink({
                  backgroundColor: `custom:${customBg.from}:${customBg.to}`,
                })
              }
              className="w-full h-8 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all"
            >
              Aplicar Degradê
            </button>
          </div>
        )}
      </div>

      {/* Text & accent colors */}
      <div className="space-y-3 p-3 rounded-xl bg-secondary/20 border border-border/40">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Cores do texto
        </span>

        {/* Accent */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground">
              Cor de destaque
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg border border-border overflow-hidden shrink-0 cursor-pointer">
              <input
                type="color"
                value={link.accentColor}
                onChange={(e) => onUpdateLink({ accentColor: e.target.value })}
                className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0"
              />
              <div
                className="w-full h-full rounded-lg"
                style={{ backgroundColor: link.accentColor }}
              />
            </div>
            <Input
              value={link.accentColor}
              onChange={(e) => onUpdateLink({ accentColor: e.target.value })}
              placeholder="#f59e0b"
              className="text-xs h-8 flex-1 font-mono"
            />
          </div>
          <p className="text-[9px] text-muted-foreground">
            CTAs, botões e detalhes visuais
          </p>
        </div>

        {/* Title color */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground">
              Cor do título
            </Label>
            {link.titleColor && (
              <button
                onClick={() => onUpdateLink({ titleColor: undefined })}
                className="flex items-center gap-0.5 text-[9px] text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-2.5 w-2.5" /> usar destaque
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg border border-border overflow-hidden shrink-0 cursor-pointer">
              <input
                type="color"
                value={link.titleColor || link.accentColor}
                onChange={(e) => onUpdateLink({ titleColor: e.target.value })}
                className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0"
              />
              <div
                className="w-full h-full rounded-lg"
                style={{
                  backgroundColor: link.titleColor || link.accentColor,
                }}
              />
            </div>
            <Input
              value={link.titleColor || ""}
              onChange={(e) =>
                onUpdateLink({ titleColor: e.target.value || undefined })
              }
              placeholder={`destaque (${link.accentColor})`}
              className="text-xs h-8 flex-1 font-mono"
            />
          </div>
        </div>

        {/* Tagline color */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground">
              Cor do slogan
            </Label>
            {link.taglineColor && (
              <button
                onClick={() => onUpdateLink({ taglineColor: undefined })}
                className="flex items-center gap-0.5 text-[9px] text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-2.5 w-2.5" /> automático
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg border border-border overflow-hidden shrink-0 cursor-pointer">
              <input
                type="color"
                value={link.taglineColor || "#888888"}
                onChange={(e) =>
                  onUpdateLink({ taglineColor: e.target.value })
                }
                className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0"
              />
              <div
                className="w-full h-full rounded-lg"
                style={{ backgroundColor: link.taglineColor || "#888888" }}
              />
            </div>
            <Input
              value={link.taglineColor || ""}
              onChange={(e) =>
                onUpdateLink({ taglineColor: e.target.value || undefined })
              }
              placeholder="automático"
              className="text-xs h-8 flex-1 font-mono"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
