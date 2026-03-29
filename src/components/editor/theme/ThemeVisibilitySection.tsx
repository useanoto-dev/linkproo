import React from "react";
import { SmartLink } from "@/types/smart-link";
import { Switch } from "@/components/ui/switch";
import { Eye } from "lucide-react";
import { SectionHeader } from "./shared";

interface ThemeVisibilitySectionProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
}

export function ThemeVisibilitySection({
  link,
  onUpdateLink,
}: ThemeVisibilitySectionProps) {
  return (
    <section className="space-y-3">
      <SectionHeader icon={Eye} label="Visibilidade" />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Mostrar nome do negócio
          </span>
          <Switch
            checked={!(link.hideBusinessName ?? false)}
            onCheckedChange={(v) => onUpdateLink({ hideBusinessName: !v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Mostrar slogan / bio
          </span>
          <Switch
            checked={!(link.hideTagline ?? false)}
            onCheckedChange={(v) => onUpdateLink({ hideTagline: !v })}
          />
        </div>
      </div>
    </section>
  );
}
