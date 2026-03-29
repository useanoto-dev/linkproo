import { SmartLinkButton, SubPage } from "@/types/smart-link";
import { Trash2, GripVertical, ChevronDown, ChevronUp, CopyPlus } from "lucide-react";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ColorState } from "./button/shared";
import { ButtonContentSection } from "./button/ButtonContentSection";
import { ButtonColorsSection } from "./button/ButtonColorsSection";
import { ButtonStyleSection } from "./button/ButtonStyleSection";
import { ButtonDestinationSection } from "./button/ButtonDestinationSection";
import { ButtonImageSection } from "./button/ButtonImageSection";

interface ButtonBlockEditorProps {
  button: SmartLinkButton;
  index: number;
  onUpdate: (id: string, updates: Partial<SmartLinkButton>) => void;
  onRemove: (id: string) => void;
  onDuplicate?: (id: string) => void;
  dragHandleProps?: Record<string, any>;
  pages?: SubPage[];
}

export const ButtonBlockEditor = React.memo(function ButtonBlockEditor({
  button,
  index,
  onUpdate,
  onRemove,
  onDuplicate,
  dragHandleProps,
  pages = [],
}: ButtonBlockEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [colorState, setColorState] = useState<ColorState>({
    mode: "preset",
    solidColor: "#2563eb",
    customFrom: "#2563eb",
    customTo: "#1e40af",
  });

  const gradientStyle = useMemo(() => {
    if (!button.gradientColor?.startsWith("custom:")) return undefined;
    const parts = button.gradientColor.split(":");
    return { background: `linear-gradient(135deg, ${parts[1]}, ${parts[2]})` };
  }, [button.gradientColor]);

  const imgPos = button.imagePosition || "right";
  const imgOpacity = button.imageOpacity ?? 85;
  const imgSize = button.imageSize ?? 50;

  return (
    <div className="editor-card rounded-2xl">
      {/* Header with mini preview */}
      <div className="flex items-center gap-2 p-2.5 bg-secondary/30">
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Mini card preview */}
        <div
          className={`flex-1 h-14 rounded-xl bg-gradient-to-r ${
            button.gradientColor?.startsWith("custom:")
              ? ""
              : button.gradientColor || "from-blue-600 to-blue-800"
          } flex items-center px-4 gap-3 overflow-hidden relative shadow-inner`}
          style={gradientStyle}
        >
          {button.imageUrl && (
            <img
              src={button.imageUrl}
              alt=""
              className={`absolute ${imgPos === "left" ? "left-0" : "right-0"} top-0 h-full object-cover`}
              style={{
                width: `${imgSize}%`,
                opacity: imgOpacity / 100,
                maskImage:
                  imgPos === "left"
                    ? "linear-gradient(to left, transparent, black 50%)"
                    : "linear-gradient(to right, transparent, black 50%)",
                WebkitMaskImage:
                  imgPos === "left"
                    ? "linear-gradient(to left, transparent, black 50%)"
                    : "linear-gradient(to right, transparent, black 50%)",
              }}
            />
          )}
          {button.iconEmoji && (
            <span className="text-2xl drop-shadow-md relative z-10">{button.iconEmoji}</span>
          )}
          <div className="relative z-10 flex-1 min-w-0">
            <span className="text-white text-sm font-bold truncate block drop-shadow-sm">
              {button.label || `Botão ${index + 1}`}
            </span>
            {button.subtitle && (
              <span className="text-white/70 text-[10px] truncate block">{button.subtitle}</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {onDuplicate && (
          <button
            onClick={() => onDuplicate(button.id)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Duplicar botão"
          >
            <CopyPlus className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => onRemove(button.id)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded editor */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-0 border-t border-border/30 divide-y divide-border/20">
              <ButtonContentSection button={button} onUpdate={onUpdate} />
              <ButtonColorsSection
                button={button}
                colorState={colorState}
                setColorState={setColorState}
                onUpdate={onUpdate}
              />
              <ButtonStyleSection button={button} onUpdate={onUpdate} />
              <ButtonDestinationSection button={button} onUpdate={onUpdate} pages={pages} />
              <ButtonImageSection button={button} onUpdate={onUpdate} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
