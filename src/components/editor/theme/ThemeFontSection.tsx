import React from "react";
import { SmartLink } from "@/types/smart-link";
import { Type } from "lucide-react";
import { SectionHeader } from "./shared";
import { loadGoogleFont } from "@/components/preview/preview-utils";

export { loadGoogleFont };

interface ThemeFontSectionProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
}

const fontGroups = [
  {
    label: "Moderno & Clean",
    fonts: ["Inter", "Plus Jakarta Sans", "DM Sans", "Outfit", "Sora", "Manrope"],
  },
  {
    label: "Geométrico & Bold",
    fonts: ["Poppins", "Montserrat", "Raleway", "Rubik", "Nunito", "Space Grotesk", "Unbounded"],
  },
  {
    label: "Serif — Editorial",
    fonts: ["Playfair Display", "Cormorant Garamond", "Libre Baskerville", "DM Serif Display", "Fraunces", "Lora"],
  },
  {
    label: "Display — Impacto",
    fonts: ["Archivo Black", "Bebas Neue"],
  },
  {
    label: "Casual",
    fonts: ["Caveat"],
  },
  {
    label: "Premium (Fontshare)",
    fonts: ["Satoshi", "General Sans", "Cabinet Grotesk", "Clash Display", "Switzer"],
  },
];


export function ThemeFontSection({
  link,
  onUpdateLink,
}: ThemeFontSectionProps) {
  return (
    <section className="space-y-3">
      <SectionHeader icon={Type} label="Tipografia" />

      <div className="space-y-3">
        {fontGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              {group.label}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {group.fonts.map((font) => (
                <button
                  key={font}
                  onMouseEnter={() => loadGoogleFont(font)}
                  onClick={() => {
                    loadGoogleFont(font);
                    onUpdateLink({ fontFamily: font });
                  }}
                  className={`py-2.5 px-3 rounded-lg border text-left text-[12px] transition-all truncate ${
                    link.fontFamily === font
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border/50 bg-secondary/30 text-foreground hover:border-border hover:bg-secondary/60"
                  }`}
                  style={{ fontFamily: `'${font}', sans-serif` }}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
