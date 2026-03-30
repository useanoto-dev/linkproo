import { SmartLink, SmartLinkButton, LinkBlock, BlockType, SubPage } from "@/types/smart-link";

export interface SubPageMode {
  page: SubPage;
  onUpdatePage: (updates: Partial<SubPage>) => void;
  onAddBlock: (type: BlockType, defaults?: Record<string, unknown>) => void;
  onInsertBlockAt: (type: BlockType, atIndex: number, defaults?: Record<string, unknown>) => void;
}

// Unified item type for the sortable list
export type UnifiedItem =
  | { kind: "button"; id: string; data: SmartLinkButton }
  | { kind: "block"; id: string; data: LinkBlock };

export function getUnifiedItems(link: SmartLink): UnifiedItem[] {
  const buttons = link.buttons ?? [];
  const blocks = link.blocks ?? [];
  const buttonItems: UnifiedItem[] = buttons.map((b, i) => ({
    kind: "button",
    id: b.id,
    data: { ...b, order: b.order ?? i },
  }));
  const blockItems: UnifiedItem[] = blocks.map((b, i) => ({
    kind: "block",
    id: b.id,
    data: { ...b, order: b.order ?? (buttons.length + i) },
  }));
  return [...buttonItems, ...blockItems].sort(
    (a, b) => (a.data.order ?? 0) - (b.data.order ?? 0)
  );
}

export function getUnifiedItemsForMode(link: SmartLink, subPageMode?: SubPageMode): UnifiedItem[] {
  if (subPageMode) {
    return (subPageMode.page.blocks ?? [])
      .map((b, i) => ({
        kind: "block" as const,
        id: b.id,
        data: { ...b, order: b.order ?? i },
      }))
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
  }
  return getUnifiedItems(link);
}
