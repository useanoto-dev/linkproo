import React, { useMemo } from "react";
import { SmartLink, BlockType } from "@/types/smart-link";
import { BusinessInfoPanel } from "./blocks/BusinessInfoPanel";
import { SortableList } from "./blocks/SortableList";
import { SubPageMode } from "./blocks/unified-items";

// ─── Lazy-loaded group editors (module-level per D-07) ────────────────────────

const TextBlockEditor = React.lazy(() =>
  import("./blocks/TextBlockEditor").then(m => ({ default: m.TextBlockEditor }))
);
const MediaBlockEditor = React.lazy(() =>
  import("./blocks/MediaBlockEditor").then(m => ({ default: m.MediaBlockEditor }))
);
const LayoutBlockEditor = React.lazy(() =>
  import("./blocks/LayoutBlockEditor").then(m => ({ default: m.LayoutBlockEditor }))
);
const InteractiveBlockEditor = React.lazy(() =>
  import("./blocks/InteractiveBlockEditor").then(m => ({ default: m.InteractiveBlockEditor }))
);
const ListBlockEditor = React.lazy(() =>
  import("./blocks/ListBlockEditor").then(m => ({ default: m.ListBlockEditor }))
);

// ─────────────────────────────────────────────────────────────────────────────

interface BlockEditorProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
  onInsertBlockAt?: (type: BlockType, atIndex: number, defaults?: Record<string, unknown>) => void;
  subPageMode?: SubPageMode;
  selectedElementId?: string;
  onElementSelected?: (id: string | null) => void;
}

// Stable object — created once at module level so SortableList never re-renders
// due to a new editors reference on each BlockEditor render.
const EDITORS = {
  TextBlockEditor,
  MediaBlockEditor,
  LayoutBlockEditor,
  InteractiveBlockEditor,
  ListBlockEditor,
} as const;

export function BlockEditor({
  link,
  onUpdateLink,
  onInsertBlockAt,
  subPageMode,
  selectedElementId,
  onElementSelected,
}: BlockEditorProps) {
  const isSubPage = !!subPageMode;

  return (
    <div className="space-y-3">
      {!isSubPage && <BusinessInfoPanel link={link} onUpdateLink={onUpdateLink} />}
      <SortableList
        link={link}
        isSubPage={isSubPage}
        subPageMode={subPageMode}
        selectedElementId={selectedElementId}
        onElementSelected={onElementSelected}
        onUpdateLink={onUpdateLink}
        onInsertBlockAt={onInsertBlockAt}
        editors={EDITORS}
      />
    </div>
  );
}
