# Editor — Bug fixes + Apply-to-all + Right-click Context Menu

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the image-button double-shadow artefact, add "Apply colour to all buttons", and implement a right-click context menu on canvas elements and sidebar items.

**Architecture:**
Context menu state lives in the Zustand `EditorUIState` (already the single source-of-truth for all editor UI). `SmartLinkPreview` gets an optional `onContextMenu` prop so it stays decoupled from the editor. `EditorLeftPanel` fires context-menu events directly via the store (it is editor-only). A single `EditorContextMenu` portal component reads from the store and receives operation callbacks from `LinkEditor`. `duplicateItem` is lifted from `EditorLeftPanel` into `LinkEditor` so it can be shared with both the context menu and the sidebar hover-actions.

**Tech Stack:** React 18, Zustand 5, Tailwind CSS, Lucide React, Framer Motion (existing stack — no new deps needed).

---

## Component Map (files touched)

| File | Change |
|------|--------|
| `src/components/preview/BlockRenderer.tsx` | Remove double-shadow from `image-button` |
| `src/components/editor/button/ButtonColorsSection.tsx` | Add `onApplyToAll?` prop + "Aplicar a todos" button |
| `src/components/editor/ButtonBlockEditor.tsx` | Thread `onApplyColorToAll?` → `ButtonColorsSection` |
| `src/components/editor/EditorRightPanel.tsx` | Implement `onApplyColorToAll` in `ButtonEditorContent` |
| `src/stores/editor-store.ts` | Add `contextMenu` field to `EditorUIState` |
| `src/components/editor/EditorLeftPanel.tsx` | Accept `onDuplicateItem` prop; add right-click on `SortableBlockItem` |
| `src/components/SmartLinkPreview.tsx` | Add optional `onContextMenu` prop; attach to selectionWrapper |
| `src/components/editor/EditorPreview.tsx` | Accept + forward `onElementContextMenu` to `SmartLinkPreview` |
| `src/pages/LinkEditor.tsx` | Define `duplicateItem`; wire `onContextMenu` handlers; render `EditorContextMenu` |
| **`src/components/editor/EditorContextMenu.tsx`** | **NEW** — floating menu portal |

---

## Task 1 — Fix Image-Button Double Shadow

**Root cause:** `BlockRenderer.tsx` lines 88-99 apply *both* Tailwind `shadow-lg hover:shadow-2xl` and a CSS `filter: drop-shadow(...)` on the same `motion.a`, producing a compound artefact that looks like a ghost outline beside the element.

**Files:**
- Modify: `src/components/preview/BlockRenderer.tsx` (image-button branch, lines ~88-110)

- [ ] **Step 1: Read the current image-button block** in `BlockRenderer.tsx` lines 77-112 to confirm the exact class/style strings.

- [ ] **Step 2: Remove the double shadow**

  Replace the `motion.a` for image-button (currently):
  ```tsx
  className="block w-full rounded-2xl shadow-lg hover:shadow-2xl transition-all relative overflow-hidden group"
  style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}
  ```
  With (single clean shadow via class only):
  ```tsx
  className="block w-full rounded-2xl shadow-md transition-shadow hover:shadow-xl relative overflow-hidden group"
  ```
  Remove the `style` prop entirely from that element.

- [ ] **Step 3: TypeScript check**

  Run: `tsc --noEmit`
  Expected: 0 errors.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/preview/BlockRenderer.tsx
  git commit -m "fix(preview): remove double shadow on image-button block"
  ```

---

## Task 2 — "Aplicar a todos os botões" in ButtonColorsSection

**Files:**
- Modify: `src/components/editor/button/ButtonColorsSection.tsx`
- Modify: `src/components/editor/ButtonBlockEditor.tsx`
- Modify: `src/components/editor/EditorRightPanel.tsx`

### 2a — Add prop + button to `ButtonColorsSection`

- [ ] **Step 1: Add `onApplyToAll` prop**

  Change the `Props` interface:
  ```tsx
  interface Props {
    button: SmartLinkButton;
    colorState: ColorState;
    setColorState: React.Dispatch<React.SetStateAction<ColorState>>;
    onUpdate: (id: string, updates: Partial<SmartLinkButton>) => void;
    onApplyToAll?: () => void;   // ← new
  }
  ```
  Destructure it:
  ```tsx
  export function ButtonColorsSection({ button, colorState, setColorState, onUpdate, onApplyToAll }: Props) {
  ```

- [ ] **Step 2: Render the "Aplicar a todos" button**

  At the very end of the returned JSX, before the closing `</div>`, add:
  ```tsx
  {onApplyToAll && (
    <button
      type="button"
      onClick={onApplyToAll}
      className="w-full h-8 rounded-lg text-[11px] font-medium border border-border/60 hover:bg-secondary/60 transition-colors text-muted-foreground hover:text-foreground mt-1"
    >
      Aplicar cor a todos os botões
    </button>
  )}
  ```

### 2b — Thread through `ButtonBlockEditor`

- [ ] **Step 3: Add prop to `ButtonBlockEditorProps`**

  ```tsx
  interface ButtonBlockEditorProps {
    ...
    onApplyColorToAll?: () => void;   // ← new
  }
  ```
  Destructure and forward to `ButtonColorsSection`:
  ```tsx
  <ButtonColorsSection
    button={button}
    colorState={colorState}
    setColorState={setColorState}
    onUpdate={onUpdate}
    onApplyToAll={onApplyColorToAll}   // ← new
  />
  ```

### 2c — Implement handler in `EditorRightPanel`

- [ ] **Step 4: Implement `onApplyColorToAll` in `ButtonEditorContent`**

  Inside `ButtonEditorContent`, add:
  ```tsx
  const onApplyColorToAll = useCallback(() => {
    const color = button.gradientColor;
    if (!color) return;
    onUpdateLink({
      buttons: link.buttons.map((b) => ({ ...b, gradientColor: color })),
    });
  }, [button.gradientColor, link.buttons, onUpdateLink]);
  ```
  Pass to `ButtonBlockEditor`:
  ```tsx
  <ButtonBlockEditor
    ...
    onApplyColorToAll={onApplyColorToAll}
  />
  ```

- [ ] **Step 5: TypeScript check** — `tsc --noEmit`, 0 errors.

- [ ] **Step 6: Commit**
  ```bash
  git add src/components/editor/button/ButtonColorsSection.tsx \
          src/components/editor/ButtonBlockEditor.tsx \
          src/components/editor/EditorRightPanel.tsx
  git commit -m "feat(editor): aplicar cor a todos os botões"
  ```

---

## Task 3 — Add `contextMenu` to Zustand EditorUIState

**Files:**
- Modify: `src/stores/editor-store.ts`

- [ ] **Step 1: Extend `EditorUIState`**

  Add after `ghostBlockType`:
  ```ts
  contextMenu: {
    x: number;
    y: number;
    itemId: string;
    itemKind: 'button' | 'block';
  } | null;
  ```

- [ ] **Step 2: Set initial value**

  In the `ui` initial object inside `create(...)`:
  ```ts
  contextMenu: null,
  ```

- [ ] **Step 3: TypeScript check** — `tsc --noEmit`, 0 errors.

- [ ] **Step 4: Commit**
  ```bash
  git add src/stores/editor-store.ts
  git commit -m "feat(store): add contextMenu field to EditorUIState"
  ```

---

## Task 4 — Create `EditorContextMenu` Component

**Files:**
- Create: `src/components/editor/EditorContextMenu.tsx`

This component renders a portal-based floating menu. It reads position and target from the Zustand store and receives operation callbacks from `LinkEditor`.

- [ ] **Step 1: Create the file**

  ```tsx
  import { useEffect, useRef } from "react";
  import { createPortal } from "react-dom";
  import {
    Copy, Trash2, Settings2, ArrowUp, ArrowDown,
  } from "lucide-react";
  import { useEditorStore } from "@/stores/editor-store";

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

    // Close on click outside
    useEffect(() => {
      if (!contextMenu) return;
      const handleClick = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          close();
        }
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
    }, [contextMenu]);

    // Auto-reposition to avoid viewport overflow
    useEffect(() => {
      if (!contextMenu || !menuRef.current) return;
      const el = menuRef.current;
      const { width, height } = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (contextMenu.x + width > vw) {
        el.style.left = `${contextMenu.x - width}px`;
      }
      if (contextMenu.y + height > vh) {
        el.style.top = `${contextMenu.y - height}px`;
      }
    }, [contextMenu]);

    if (!contextMenu) return null;

    const { x, y, itemId, itemKind } = contextMenu;

    const items = [
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
        className="fixed z-[9999] min-w-[180px] rounded-xl border border-border bg-card shadow-xl py-1 overflow-hidden"
        style={{ left: x, top: y }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {items.map((item, i) => {
          if ("separator" in item && item.separator) {
            return <div key={i} className="my-1 h-px bg-border/60" />;
          }
          const { icon: Icon, label, action, danger } = item as {
            icon: React.ComponentType<{ className?: string }>;
            label: string;
            action: () => void;
            danger?: boolean;
          };
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
  ```

- [ ] **Step 2: TypeScript check** — `tsc --noEmit`, 0 errors.

- [ ] **Step 3: Commit**
  ```bash
  git add src/components/editor/EditorContextMenu.tsx
  git commit -m "feat(editor): EditorContextMenu portal component"
  ```

---

## Task 5 — Lift `duplicateItem` to `LinkEditor` & update EditorLeftPanel

**Files:**
- Modify: `src/pages/LinkEditor.tsx`
- Modify: `src/components/editor/EditorLeftPanel.tsx`

### 5a — Define `duplicateItem` in `LinkEditor`

- [ ] **Step 1: Add `duplicateItem` callback in `LinkEditor.tsx`**

  Place it alongside `removeItem`:
  ```tsx
  const duplicateItem = useCallback((id: string, kind: 'button' | 'block') => {
    const now = Date.now();
    const allItems = getUnifiedItems(link);
    const original = allItems.find((i) => i.id === id);
    if (!original) return;
    const insertOrder = (original.data.order ?? 0) + 1;
    const bumpedButtons = link.buttons.map((b) =>
      (b.order ?? 0) >= insertOrder ? { ...b, order: (b.order ?? 0) + 1 } : b
    );
    const bumpedBlocks = link.blocks.map((b) =>
      (b.order ?? 0) >= insertOrder ? { ...b, order: (b.order ?? 0) + 1 } : b
    );
    if (kind === 'button') {
      const btn = link.buttons.find((b) => b.id === id);
      if (!btn) return;
      updateLink({
        buttons: [...bumpedButtons, { ...btn, id: `${now}`, order: insertOrder, label: (btn.label || '') + ' (cópia)' }],
        blocks: bumpedBlocks,
      });
    } else {
      const block = link.blocks.find((b) => b.id === id);
      if (!block) return;
      updateLink({
        buttons: bumpedButtons,
        blocks: [...bumpedBlocks, { ...block, id: `${now}`, order: insertOrder }],
      });
    }
  }, [link, updateLink]);
  ```

- [ ] **Step 2: Pass to `EditorLeftPanel`**

  Add `onDuplicateItem={duplicateItem}` prop to `<EditorLeftPanel>`.

### 5b — Update `EditorLeftPanel` to receive the prop

- [ ] **Step 3: Add `onDuplicateItem` to `EditorLeftPanelProps`**

  ```tsx
  interface EditorLeftPanelProps {
    link: SmartLink;
    onUpdateLink: (updates: Partial<SmartLink>) => void;
    onMoveBlock: (id: string, direction: 'up' | 'down') => void;
    onRemoveItem: (id: string, kind: 'button' | 'block') => void;
    onDuplicateItem: (id: string, kind: 'button' | 'block') => void;  // ← new
  }
  ```

- [ ] **Step 4: Remove the local `duplicateItem` definition** that currently lives in `EditorLeftPanel` (the `useCallback` block) and replace with the `onDuplicateItem` prop in `SortableBlockItem` calls:

  ```tsx
  onDuplicate={onDuplicateItem}
  ```

- [ ] **Step 5: TypeScript check** — `tsc --noEmit`, 0 errors.

- [ ] **Step 6: Commit**
  ```bash
  git add src/pages/LinkEditor.tsx src/components/editor/EditorLeftPanel.tsx
  git commit -m "refactor(editor): lift duplicateItem to LinkEditor"
  ```

---

## Task 6 — Right-click on Canvas (`SmartLinkPreview` + `EditorPreview`)

**Files:**
- Modify: `src/components/SmartLinkPreview.tsx`
- Modify: `src/components/editor/EditorPreview.tsx`

### 6a — Add `onContextMenu` to SmartLinkPreview

- [ ] **Step 1: Add prop to `SmartLinkPreviewProps`**

  ```tsx
  interface SmartLinkPreviewProps {
    link: SmartLink;
    selectedId?: string;
    ghostBlockType?: BlockType;
    onSelectElement?: (id: string) => void;
    onContextMenu?: (e: React.MouseEvent, id: string) => void;  // ← new
  }
  ```
  Destructure it in the function signature.

- [ ] **Step 2: Attach to `selectionWrapper`**

  The existing `selectionWrapper` helper (around line 133):
  ```tsx
  const selectionWrapper = (children: React.ReactNode) => (
    <div
      key={itemId}
      onClick={onSelectElement ? (e) => { e.stopPropagation(); onSelectElement(itemId); } : undefined}
      onContextMenu={onContextMenu ? (e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(e, itemId); } : undefined}
      style={isSelected ...}
    >
      {children}
    </div>
  );
  ```

### 6b — Forward through `EditorPreview`

- [ ] **Step 3: Add `onElementContextMenu` to `EditorPreviewProps`**

  ```tsx
  export interface EditorPreviewProps {
    ...
    onElementContextMenu?: (e: React.MouseEvent, id: string) => void;  // ← new
  }
  ```
  Destructure and forward to `SmartLinkPreview`:
  ```tsx
  <SmartLinkPreview
    link={previewLink}
    selectedId={selectedElementId ?? undefined}
    ghostBlockType={ghostBlockType ?? undefined}
    onSelectElement={(id) => setUI({ selectedElementId: id, openDrawer: null })}
    onContextMenu={onElementContextMenu}  // ← new
  />
  ```

- [ ] **Step 4: TypeScript check** — `tsc --noEmit`, 0 errors.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/SmartLinkPreview.tsx \
          src/components/editor/EditorPreview.tsx
  git commit -m "feat(preview): expose onContextMenu prop for editor right-click"
  ```

---

## Task 7 — Right-click on Sidebar Items (`EditorLeftPanel`)

**Files:**
- Modify: `src/components/editor/EditorLeftPanel.tsx`

- [ ] **Step 1: Add `onContextMenu` handler to `SortableBlockItem`**

  Inside `SortableBlockItem`, get `setUI` from the store:
  ```tsx
  const setUI = useEditorStore((s) => s.setUI);
  ```
  Add `onContextMenu` to the root `div`:
  ```tsx
  onContextMenu={(e) => {
    e.preventDefault();
    e.stopPropagation();
    setUI({ contextMenu: { x: e.clientX, y: e.clientY, itemId: item.id, itemKind: item.kind } });
  }}
  ```

- [ ] **Step 2: TypeScript check** — `tsc --noEmit`, 0 errors.

- [ ] **Step 3: Commit**
  ```bash
  git add src/components/editor/EditorLeftPanel.tsx
  git commit -m "feat(editor): right-click context menu on sidebar items"
  ```

---

## Task 8 — Wire Everything in `LinkEditor` + Render `EditorContextMenu`

**Files:**
- Modify: `src/pages/LinkEditor.tsx`

- [ ] **Step 1: Import `EditorContextMenu`**

  ```tsx
  import { EditorContextMenu } from '@/components/editor/EditorContextMenu';
  ```

- [ ] **Step 2: Define `handleElementContextMenu`**

  This handler resolves `itemKind` by looking up the id in `link.buttons` / `link.blocks`:
  ```tsx
  const handleElementContextMenu = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const kind = link.buttons.some((b) => b.id === id) ? 'button' : 'block';
    setUI({ contextMenu: { x: e.clientX, y: e.clientY, itemId: id, itemKind: kind } });
  }, [link.buttons, setUI]);
  ```

- [ ] **Step 3: Pass `onElementContextMenu` to `EditorPreview`**

  ```tsx
  <EditorPreview
    ...
    onElementContextMenu={handleElementContextMenu}
  />
  ```

- [ ] **Step 4: Define context-menu operation callbacks**

  ```tsx
  const handleContextEditProperties = useCallback((id: string) => {
    setUI({ selectedElementId: id, openDrawer: null, contextMenu: null });
  }, [setUI]);

  const handleContextMoveUp = useCallback((id: string) => {
    moveBlock(id, 'up');
  }, [moveBlock]);

  const handleContextMoveDown = useCallback((id: string) => {
    moveBlock(id, 'down');
  }, [moveBlock]);
  ```

- [ ] **Step 5: Render `EditorContextMenu`** inside the main return, at the bottom of the JSX (after `<ShortcutsModal />`):

  ```tsx
  <EditorContextMenu
    onDuplicate={duplicateItem}
    onRemove={removeItem}
    onEditProperties={handleContextEditProperties}
    onMoveUp={handleContextMoveUp}
    onMoveDown={handleContextMoveDown}
  />
  ```

- [ ] **Step 6: TypeScript check** — `tsc --noEmit`, 0 errors.

- [ ] **Step 7: Commit**
  ```bash
  git add src/pages/LinkEditor.tsx
  git commit -m "feat(editor): wire right-click context menu end-to-end"
  ```

---

## Task 9 — Quality & Consistency Pass

- [ ] **Step 1: Verify no `contextmenu` conflict with dnd-kit drag**

  The dnd-kit `PointerSensor` only activates on `pointerdown` with `distance: 5`. Right-click fires a `contextmenu` event (button 2), which dnd-kit does not intercept. No conflict.

- [ ] **Step 2: Confirm context menu closes on drag start**

  Inside `EditorLeftPanel.handleDragEnd`, add a guard before any state change:
  ```tsx
  setUI({ contextMenu: null });  // ensure menu closes on any drag
  ```
  (Add at the top of the callback.)

- [ ] **Step 3: Check touch / secondary-tap (trackpad)**

  On macOS trackpads, two-finger tap fires `contextmenu`. The existing `onContextMenu` handler captures this correctly since it uses the DOM `contextmenu` event (not mouse-specific). No extra work needed.

- [ ] **Step 4: Final TypeScript check across all changed files** — `tsc --noEmit`, 0 errors.

- [ ] **Step 5: Push to origin**
  ```bash
  git push origin master
  ```

---

## Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Context menu state in Zustand | Both canvas and sidebar trigger it from different tree depths; store avoids deep prop drilling. |
| `SmartLinkPreview` stays context-agnostic | The component is also used on the public `PublicLinkPage`; adding an optional `onContextMenu` prop keeps it generic without leaking editor logic. |
| `duplicateItem` lifted to `LinkEditor` | Needed by both the sidebar hover-actions AND the context menu. Lifting once, passing as prop, avoids duplication. |
| "Trazer para frente / Enviar para trás" = move up/down | Elements have no `z-index`; the visual stack IS the order list. Moving in order is the correct semantic equivalent. |
| "Aplicar a todos" uses stored `gradientColor` | After any color-picker change, `onUpdate` fires synchronously; `button.gradientColor` is always current. Avoids syncing separate local state. |
| Single `EditorContextMenu` portal | Prevents stacking multiple menus; portal ensures correct stacking context above all editor panels. |
