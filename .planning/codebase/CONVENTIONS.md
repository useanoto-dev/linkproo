# Coding Conventions

**Analysis Date:** 2026-03-23

## Naming Patterns

**Files:**
- React components: PascalCase with `.tsx` extension — e.g., `BlockRenderer.tsx`, `ImageUploader.tsx`
- React hooks: kebab-case prefixed with `use-` — e.g., `use-links.ts`, `use-autosave.ts`
- Utility/lib files: kebab-case — e.g., `color-utils.ts`, `link-mappers.ts`, `slug-utils.ts`
- Type definition files: kebab-case — e.g., `smart-link.ts`
- Pages: PascalCase with `Page` suffix — e.g., `AnalyticsPage.tsx`, `LinksPage.tsx` (exception: `Dashboard.tsx`)
- Admin pages: PascalCase with `Admin` prefix and `Page` suffix — e.g., `AdminUsersPage.tsx`

**Functions:**
- Regular functions: camelCase — e.g., `normalizeSlug`, `extractBgColor`, `getPublicLinkUrl`
- React components: PascalCase — e.g., `ImageUploader`, `BlockRenderer`, `EmailCaptureBlock`
- React hooks: camelCase prefixed with `use` — e.g., `useLinks`, `useAutosave`, `usePlanLimits`
- Event handlers: `handle` prefix — e.g., `handleSubmit`, `handleUpload`
- Boolean state variables: present-tense or past-tense descriptive — e.g., `submitted`, `loading`, `hasError`

**Variables:**
- Local variables: camelCase
- Constants (module-level): SCREAMING_SNAKE_CASE for pure data constants — e.g., `RESERVED_SLUGS`, `GENERIC_PRESETS`, `FULL_SMART_LINK` (in tests)
- Exported constants used as config/data: SCREAMING_SNAKE_CASE — e.g., `COLOR_PRESETS`, `PUBLISHED_DOMAIN`

**Types/Interfaces:**
- Interfaces: PascalCase — e.g., `SmartLink`, `AspectPreset`, `AuthContextType`
- Type aliases: PascalCase — e.g., `LinkType`, `BlockType`, `SaveStatus`, `Mode`
- Generic parameters: single uppercase letter — e.g., `<T>` in `toJsonb<T>`

## Code Style

**Formatting:**
- Prettier is not explicitly configured (no `.prettierrc` found); formatting appears consistent with default TypeScript/ESLint conventions
- 2-space indentation throughout
- Double quotes for strings in JSX attributes; double quotes in TypeScript
- Trailing commas in multi-line objects/arrays
- Section dividers with ASCII art for long files — e.g., `// ─── Props ────────────────────────` and `// ─── Component ────────────────────`

**Linting:**
- ESLint 9 with flat config at `eslint.config.js`
- Extends `@eslint/js` recommended + `typescript-eslint` recommended
- Plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- `@typescript-eslint/no-unused-vars` is explicitly turned **off** — unused variables do not cause lint errors
- React hooks rules are enforced at recommended level

## Import Organization

**Order (observed pattern — no auto-enforcer configured):**
1. External library imports (React, framer-motion, lucide-react, third-party packages)
2. Internal `@/` path alias imports — contexts, hooks, components, lib, types
3. Relative sibling imports (`./ComponentName`)

**Path Aliases:**
- `@/` maps to `src/` — defined in both `vite.config.ts` (via `@vitejs/plugin-react-swc`) and `vitest.config.ts`
- Used consistently throughout the codebase; no relative `../../` deep traversal

**Import types:**
- `import type` used for type-only imports — e.g., `import type { SmartLink } from "@/types/smart-link"`
- Mixed value+type imports use inline `type` qualifier — e.g., `import { type Json } from "@/integrations/supabase/types"`

## Error Handling

**Patterns:**

**User-facing errors — toast notifications via `sonner`:**
```typescript
import { toast } from "sonner";

// Error feedback
toast.error("E-mail ou senha incorretos");

// Success feedback
toast.success("Conta criada! Verifique seu e-mail.");

// Inline in mutation callbacks
onError: () => toast.error("Erro ao salvar FAQ"),
onSuccess: () => toast.success("FAQ atualizada!"),
```

**Silent errors with console logging (non-critical paths):**
```typescript
// Analytics failures are swallowed — never block UX
try {
  await recordClick(...);
} catch (err) {
  console.error("[analytics] recordClick failed:", err);
}
```

**Async mutation error handling:**
- React Query `useMutation` is used with `onError`/`onSuccess` callbacks
- Errors thrown in `queryFn` propagate to React Query's error state
- Critical errors that should not block UX are caught and logged with `console.error`

**ErrorBoundary:**
- Class component `ErrorBoundary` wraps the entire app at `src/components/ErrorBoundary.tsx`
- Catches runtime render errors; displays a Portuguese-language fallback UI with a reload button
- Logs to `console.error("ErrorBoundary caught:", error, info)`

**Validation pattern:**
- Validation functions return `string | null` — `null` means valid, string is the error message
- Example: `validateSlug(slug: string): string | null`

## Logging

**Framework:** Native `console` API only (no structured logging library)

**Patterns:**
- `console.error` for caught exceptions in non-critical paths — tagged with module prefix in brackets: `"[analytics]"`, `"[storage]"`, `"[EmailCapture]"`
- `console.warn` for non-fatal degraded states — e.g., failed old image deletion
- `console.error` in `ErrorBoundary.componentDidCatch` and `NotFound` 404 handler
- No logging in the hot-path business logic (mappers, validators)

## Comments

**When to Comment:**
- JSDoc-style block comments on exported functions with non-obvious behavior — e.g., `link-mappers.ts` documents the `toJsonb` helper and the "single source of truth" intent
- Inline comments explain domain context and non-obvious decisions — e.g., reserved slugs list, Supabase SECURITY DEFINER note
- Section dividers (`// ─── Section Name ───`) used in large component files to demarcate logical blocks
- Portuguese-language comments are present in domain logic (project's working language is Brazilian Portuguese)
- Test file headers use a horizontal rule + section name pattern: `// ---------------------------------------------------------------------------`

**JSDoc/TSDoc:**
- Used selectively on utility functions with important behavioral contracts
- Not applied uniformly to all exports — only where behavior needs explanation

## Function Design

**Size:**
- Utility functions are small and focused (`normalizeSlug`, `extractBgColor`, `validateSlug`)
- Component functions can be large (e.g., `BlockRenderer.tsx` exports many block sub-components in one file)
- Large files use section dividers (`// ───`) to manage readability

**Parameters:**
- Functions with many optional fields use a single object parameter with interface type — e.g., `ImageUploaderProps`
- Hooks that need auth context retrieve it internally via `useAuth()` rather than receiving it as a prop
- Optional parameters use `?` suffix in TypeScript — e.g., `excludeId?: string`

**Return Values:**
- Validation functions return `string | null` (null = valid, string = error message)
- Async functions return `Promise<{ error: Error | null }>` for auth operations
- Mapper functions return typed domain objects directly

## Module Design

**Exports:**
- Pages use `export default function PageName()` as the primary export
- Libraries/utils use named exports exclusively — no default exports in `src/lib/`
- Hooks use named exports — e.g., `export function useLinks()`
- Components in `src/components/` use both named exports (`export function ImageUploader`) and default exports
- Re-exports used for backward compatibility — e.g., `use-links.ts` re-exports mapper functions

**Barrel Files:**
- Not used — no `index.ts` barrel files found in any directory
- Imports reference specific file paths directly

## TypeScript Usage

**Strict typing:**
- TypeScript 5.8 with project-level tsconfig; no `any` suppression beyond interop with Supabase row shapes
- Domain model in `src/types/smart-link.ts` as the canonical type source
- Supabase-generated types in `src/integrations/supabase/types.ts`
- Type assertions used at DB boundary: `(row.logo_shape as SmartLink['logoShape'])`
- `row: any` accepted in mapper functions that work with raw DB rows

**Utility types:**
- `cn()` helper in `src/lib/utils.ts` combines `clsx` + `tailwind-merge` for conditional className composition
- Used universally in components: `className={cn("base-classes", conditionalClass)}`

---

*Convention analysis: 2026-03-23*
