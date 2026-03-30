# Coding Conventions

**Analysis Date:** 2026-03-28

## Naming Patterns

**Files:**
- React components: PascalCase matching the exported component name — `BlockEditor.tsx`, `AnimatedButtonBlock.tsx`
- Hooks: kebab-case prefixed with `use-` — `use-autosave.ts`, `use-editor-history.ts`, `use-plan-limits.ts`
- Utilities: kebab-case — `block-utils.ts`, `color-utils.ts`, `link-mappers.ts`, `slug-utils.ts`
- Constants/data files: kebab-case — `templates.ts`, `constants.ts`, `unified-items.ts`
- Preview utilities grouped by domain: `preview-utils.ts` inside `src/components/preview/`

**Functions:**
- Regular functions: camelCase — `extractBgColor`, `normalizeSlug`, `getVideoEmbedUrl`
- React hooks: camelCase prefixed with `use` — `useAutosave`, `useEditorHistory`, `usePlanLimits`
- Event handlers: camelCase prefixed with `handle` — `handleClick`, `onUpdate`, `onRemove`
- Boolean returns: `is`/`can`/`has` prefix — `isAnimStyle`, `isDarkBg`, `canCreateLink`, `isAtLimit`

**Variables/Constants:**
- Module-level constants: SCREAMING_SNAKE_CASE — `MAX_HISTORY`, `THEMES`, `VALID_ANIM_STYLES`, `EDITORS`, `COLOR_PRESETS`, `FONT_LINKS`, `PUBLISHED_DOMAIN`
- Local variables: camelCase
- Unused parameters prefixed with `_` to satisfy the ESLint `argsIgnorePattern: "^_"` rule — `_id`, `_created_at`

**Types:**
- Interfaces: PascalCase suffixed with type context — `SmartLinkButton`, `BlockEditorProps`, `AnimatedButtonBlockProps`
- Type aliases: PascalCase — `LinkType`, `BlockType`, `EntryAnimation`, `SaveStatus`, `AnimStyle`
- Component prop interfaces: Named `<ComponentName>Props` and defined immediately above the component

## TypeScript Usage

**Strict Mode:** Enabled in `tsconfig.app.json` with `"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`.

**Type Definitions:**
- All component props are typed via `interface <Name>Props` — never inline objects or `any`
- Domain types centralized in `src/types/smart-link.ts` — `SmartLink`, `LinkBlock`, `BlockType`, `SmartLinkButton`, etc.
- Supabase row types imported from `src/integrations/supabase/types.ts` — `Tables<"links">`, `TablesInsert<"links">`
- Type narrowing via type guard functions: `function isAnimStyle(value: unknown): value is AnimStyle`
- `as const` on readonly arrays for discriminated unions — `VALID_ANIM_STYLES as readonly AnimStyle[]`
- `satisfies Config` used in `tailwind.config.ts` for type-checked config objects
- `unknown` used for catch clause errors; cast to `Error` before accessing `.message`
- `ReturnType<typeof hookFn>` used in test mocks for accurate typing — `ReturnType<typeof useProfile>`

**Import Aliases:**
- `@/` maps to `src/` — used consistently across all files: `import { cn } from "@/lib/utils"`
- No relative `../..` paths — all cross-directory imports use the `@/` alias

## Import Organization

**Order (observed pattern):**
1. React and React primitives — `import React, { memo, useState, useCallback } from "react"`
2. Third-party libraries — `framer-motion`, `@tanstack/react-query`, `sonner`, `lucide-react`, `react-icons`
3. Internal `@/` imports — types, hooks, components, utilities, integrations
4. Relative imports — sibling/child files within the same directory

**Named exports only from utilities and hooks** — no default exports from `src/lib/` or `src/hooks/`. Default exports are used only for pages (required by `React.lazy`).

## Component Patterns

**Functional components with named export:**
```typescript
export function PageTransition({ children, className }: PageTransitionProps) { ... }
```

**`memo` with named function for DevTools display:**
```typescript
export const BlockRenderer = memo(function BlockRenderer({ ... }: BlockRendererProps) { ... });
export const ButtonPreview = memo(function ButtonPreview({ ... }: ButtonPreviewProps) { ... });
```
Applied broadly to editor sub-panels, preview blocks, and list items where re-renders are expensive.

**`React.lazy` for route-level and heavy editor modules:**
```typescript
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TextBlockEditor = React.lazy(() =>
  import("./blocks/TextBlockEditor").then(m => ({ default: m.TextBlockEditor }))
);
```
All pages and large editor group panels are lazy-loaded. Named exports from lazy modules require the `.then(m => ({ default: m.X }))` re-wrap.

**Class components reserved for error boundaries only:**
- `src/components/ErrorBoundary.tsx` — top-level, wraps entire app
- `src/components/editor/blocks/BlockErrorBoundary.tsx` — per-block isolation in the editor

**Stable module-level objects to prevent memo invalidation:**
```typescript
// Stable object — created once at module level so SortableList never re-renders
const EDITORS = { TextBlockEditor, MediaBlockEditor, ... } as const;
```

## Tailwind CSS Usage

**Utility-first with `cn()` for conditional classes:**
```typescript
import { cn } from "@/lib/utils";
// cn() = twMerge(clsx(...)) — resolves Tailwind class conflicts
className={cn("base-classes", condition && "conditional-class", className)}
```

**Semantic tokens via CSS variables** — never hard-code colors in Tailwind for themed UI:
- `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-destructive`
- Custom tokens: `bg-surface`, `bg-surface-hover`, `text-surface-foreground`, `bg-glow`

**Inline `style` props for dynamic/runtime values** — Tailwind classes only for static layout:
```typescript
// Dynamic colors from user config → inline style
style={{ background: theme.bg, minHeight: minH, color: theme.textColor }}
// Static layout → Tailwind
className="flex items-center justify-center flex-shrink-0"
```

**Custom Tailwind extensions defined in `tailwind.config.ts`:**
- Custom keyframes: `float`, `pulse-glow`, `accordion-down`, `accordion-up`
- Extended `backdropBlur` scale: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`
- Design tokens: `surface`, `glow`, `success`, `warning`, `sidebar.*`
- Border radius via CSS vars: `rounded-lg`, `rounded-md`, `rounded-sm` → `--radius`

**Dark mode:** Class-based (`darkMode: ["class"]`). All colors use `hsl(var(--token))` CSS variables that swap automatically.

## Framer Motion Animation Patterns

**Page transitions via `<PageTransition>` wrapper** (`src/components/PageTransition.tsx`):
```typescript
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -4 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
```

**Entry animations via `getEntryVariants()` in `src/components/preview/preview-utils.ts`** — returns `{ initial, animate, transition }` spread onto `<motion.div>`. Supports: `none`, `fade-up`, `slide-left`, `slide-right`, `scale`, `bounce`. Spring physics used for most variants.

**Continuous looping animations on animated blocks:**
```typescript
animate={{ boxShadow: cardShadow }}
transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
// Shimmer sweep
animate={{ x: ["-100%", "250%"] }}
transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 4.5, ease: "easeInOut" }}
// Floating icon bob
animate={{ y: [0, -7, 0] }}
transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
```

**`whileHover` / `whileTap` for interactive feedback:**
```typescript
whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
whileTap={{ scale: 0.985, transition: { duration: 0.1 } }}
```

**`AnimatePresence` with `mode="wait"` for route transitions** in `src/App.tsx` — keyed by `location.pathname`.

## State Management

**Server state via TanStack Query** (`@tanstack/react-query`):
- Query keys follow `["entity", id?]` pattern — `["links", user?.id]`, `["link", id]`, `["public-link", slug]`
- Mutations centralized in `src/hooks/use-links.ts` — not co-located with components
- `onSuccess` handlers call `queryClient.invalidateQueries` to refresh related queries
- `onError` handlers call `toast.error(err.message || "fallback message")`
- Global config: `staleTime: 2min`, `gcTime: 10min`, `refetchOnWindowFocus: false`, `retry: 1`

**Editor undo/redo state via `useEditorHistory`** (`src/hooks/use-editor-history.ts`):
- `set(state | updater)` — pushes current state to past, clears future
- `undo()` / `redo()` — navigate history stack (max 50 entries)
- `reset(state)` — clears history entirely (used on initial load)
- Returns stable object via `useMemo` to avoid unnecessary re-renders

**Autosave debounce via `useAutosave`** (`src/hooks/use-autosave.ts`):
- Status: `'idle' | 'saving' | 'saved' | 'error'`
- Volatile fields (`views`, `clicks`, `createdAt`) excluded from dirty-check serialization
- `initializeRef(link)` must be called after initial data load to prevent immediate save
- `flush()` saves immediately, bypassing the debounce timer

**Context providers** (in `src/contexts/`): `AuthContext` (Supabase session), `ThemeContext` (dark/light)

## Error Handling

**Async errors in mutations — surfaced via `toast.error()`:**
```typescript
onError: (err: Error) => {
  toast.error(err.message || "Erro ao salvar o link. Tente novamente.");
}
```
The `||` fallback Portuguese string is the standard pattern for user-facing errors.

**Async errors in queries — thrown and handled by React Query** (not manually caught).

**Fire-and-forget analytics — silent `try/catch` with `console.error`:**
```typescript
try {
  await supabase.from("link_views").insert({ ... });
} catch (err) {
  console.error("[analytics] recordView failed:", err);
}
```

**Catch clauses for non-critical paths omit the variable entirely:**
```typescript
try { ... } catch { /* Erro de rede — padrão é "free" */ }
```

**React error boundaries** — two tiers:
1. `<ErrorBoundary>` in `src/components/ErrorBoundary.tsx` — wraps entire app, shows full-page reload UI
2. `<BlockErrorBoundary>` in `src/components/editor/blocks/BlockErrorBoundary.tsx` — wraps each block editor, shows inline remove button

**Security — user HTML sanitized via DOMPurify** before render; user iframe HTML runs in `sandbox="allow-scripts"` to prevent parent DOM access.

## shadcn/ui Component Usage

**Pattern — import from `@/components/ui/` barrel:**
```typescript
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
```

**`cva` + `cn` for variant composition** (as seen in `src/components/ui/button.tsx`):
```typescript
const buttonVariants = cva("base-classes", { variants: { variant: {...}, size: {...} }, defaultVariants: {...} });
// Consumer:
<Comp className={cn(buttonVariants({ variant, size, className }))} />
```

**Radix primitives used directly** for patterns not covered by shadcn components — e.g., `@radix-ui/react-slot` via shadcn Button's `asChild` prop.

**Lucide React for icons** — `lucide-react` package. `react-icons` (`FaWhatsapp`, `FaInstagram`, etc.) used for brand/social icons.

## Comments

**JSDoc-style block comments on exported utility functions and hooks:**
```typescript
/** Fetch all links for current user (with aggregated view/click counts via RPC) */
export function useLinks() { ... }
/** Returns the full public URL for a published link slug — always uses current origin */
export function getPublicLinkUrl(slug: string): string { ... }
```

**Inline section dividers for long files:**
```typescript
// ─── Queries ────────────────────────────────────────────────
// ─── Mutations ──────────────────────────────────────────────
// ─── Analytics Helpers ──────────────────────────────────────
```

**Context comments on non-obvious decisions:**
```typescript
// useRef gives a stable ID that never triggers useMemo/useEffect deps changes
// Stable object — created once at module level so SortableList never re-renders
// No PageTransition here — these use getEntryVariants stagger per D-03
```

**Portuguese comments** appear in domain-logic explaining business rules; English used for technical/architectural comments.

---

*Convention analysis: 2026-03-28*
