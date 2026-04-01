import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Copy, Trash2, Settings2, ArrowUp, ArrowDown } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import type React from "react";

interface EditorContextMenuProps {
  onDuplicate: (id: string, kind: "button" | "block") => void;
  onRemove: (id: string, kind: "button" | "block") => void;
  onEditProperties: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export function EditorContextMenu({
  onDuplicate,
  onRemove,
  onEditProperties,
  onMoveUp,
  onMoveDown,
}: EditorContextMenuProps) {
  const contextMenu = useEditorStore((s) => s.ui.contextMenu);
  const setUI = useEditorStore((s) => s.setUI);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = () => setUI({ contextMenu: null });

  // Close on click outside or Escape
  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextMenu]);

  // Auto-reposition to avoid viewport overflow
  useEffect(() => {
    if (!contextMenu || !menuRef.current) return;
    const el = menuRef.current;
    const { width, height } = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (contextMenu.x + width > vw) el.style.left = `${contextMenu.x - width}px`;
    if (contextMenu.y + height > vh) el.style.top = `${contextMenu.y - height}px`;
  }, [contextMenu]);

  if (!contextMenu) return null;

  const { x, y, itemId, itemKind } = contextMenu;

  type MenuItem =
    | { separator: true }
    | {
        separator?: false;
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        action: () => void;
        danger?: boolean;
      };

  const items: MenuItem[] = [
    {
      icon: Copy,
      label: "Duplicar",
      action: () => { onDuplicate(itemId, itemKind); close(); },
    },
    {
      icon: Settings2,
      label: "Editar propriedades",
      action: () => { onEditProperties(itemId); close(); },
    },
    { separator: true },
    {
      icon: ArrowUp,
      label: "Trazer para frente",
      action: () => { onMoveUp(itemId); close(); },
    },
    {
      icon: ArrowDown,
      label: "Enviar para trás",
      action: () => { onMoveDown(itemId); close(); },
    },
    { separator: true },
    {
      icon: Trash2,
      label: "Excluir",
      action: () => { onRemove(itemId, itemKind); close(); },
      danger: true,
    },
  ];

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[190px] rounded-xl border border-border bg-card shadow-xl py-1 overflow-hidden"
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) => {
        if (item.separator) {
          return <div key={i} className="my-1 h-px bg-border/60" />;
        }
        const { icon: Icon, label, action, danger } = item;
        return (
          <button
            key={label}
            type="button"
            onClick={action}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition-colors text-left ${
              danger
                ? "text-destructive hover:bg-destructive/10"
                : "text-foreground hover:bg-secondary/60"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </button>
        );
      })}
    </div>,
    document.body
  );
}
