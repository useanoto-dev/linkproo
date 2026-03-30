# Testing Patterns

**Analysis Date:** 2026-03-28

## Test Framework

**Runner:**
- Vitest 3.x
- Config: `vitest.config.ts` (project root)
- Environment: `jsdom` (DOM simulation for browser APIs)
- Globals: `true` — `describe`, `it`, `expect` available without import (but files still import explicitly from `"vitest"`)

**Assertion Library:**
- Vitest built-in (`expect`) — compatible with Jest API
- `@testing-library/jest-dom` — extends `expect` with DOM matchers (`toBeInTheDocument`, etc.); imported in setup file

**Render/Hook utilities:**
- `@testing-library/react` — `renderHook`, `act`

**Run Commands:**
```bash
npm test              # Run all tests once (vitest run)
npm run test:watch    # Watch mode (vitest)
# No coverage script defined — run manually: npx vitest run --coverage
```

## Test File Organization

**Location:** All tests in `src/test/` — centralized, NOT co-located with source files.

**Naming:** `<subject>.test.ts` — matches the module/hook name it tests, using kebab-case.

**Current test files:**
```
src/test/
├── setup.ts                    # Global setup (jest-dom + matchMedia mock)
├── example.test.ts             # Sanity checks for slug-utils and color-utils
├── block-scheduling.test.ts    # Block visibility logic (visibleFrom/visibleUntil)
├── color-utils.test.ts         # extractBgColor, getCustomBgGradient, COLOR_PRESETS
├── link-mappers.test.ts        # rowToSmartLink / smartLinkToRow roundtrip
├── slug-utils.test.ts          # normalizeSlug, validateSlug, async slug uniqueness
├── use-autosave.test.ts        # useAutosave hook — debounce, flush, status states
├── use-editor-history.test.ts  # useEditorHistory hook — undo/redo/reset
├── use-plan-limits.test.ts     # usePlanLimits hook — plan logic, admin override
└── whatsapp-url.test.ts        # WhatsApp URL generation logic (extracted from component)
```

## Test Structure

**Suite and case organization:**
```typescript
import { describe, it, expect } from "vitest";

describe("subjectName", () => {
  it("describes expected behavior in Portuguese", () => {
    expect(result).toBe(expected);
  });
});
```

**Test descriptions are in Portuguese**, matching the project's language convention.

**Multiple `describe` blocks per file** for grouping related functionality:
```typescript
describe("extractBgColor", () => { ... });
describe("getCustomBgGradient", () => { ... });
describe("COLOR_PRESETS", () => { ... });
```

**Setup/Teardown patterns for timer-dependent tests:**
```typescript
describe("useAutosave", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });
  // ...
});
```

**Fixtures defined at file scope** — reusable `BASE` SmartLink object:
```typescript
const BASE: SmartLink = {
  id: "test-id",
  slug: "test-slug",
  businessName: "Empresa",
  // ... all required fields
};
```

## Mocking

**Framework:** Vitest built-in (`vi`)

**Module-level mocks** declared before any imports of the mocked module (required for hoisting):
```typescript
// Mocks declarados antes do import do módulo
vi.mock("@/hooks/use-profile", () => ({ useProfile: vi.fn() }));
vi.mock("@/hooks/use-links",   () => ({ useLinks: vi.fn() }));
vi.mock("@/hooks/use-user-role", () => ({ useUserRole: vi.fn() }));

import { usePlanLimits } from "@/hooks/use-plan-limits";
import { useProfile } from "@/hooks/use-profile";
```

**`vi.mocked()` for typed mock access:**
```typescript
vi.mocked(useProfile).mockReturnValue({ data: { plan } } as ReturnType<typeof useProfile>);
vi.mocked(useLinks).mockReturnValue({ data: links } as ReturnType<typeof useLinks>);
```

**Casting to `ReturnType<typeof hookFn>`** is the pattern for preserving TypeScript type safety while mocking TanStack Query hook returns.

**Supabase client mocked via `vi.mock` with chained builder pattern:**
```typescript
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          neq: vi.fn().mockResolvedValue({ count: 0, error: null }),
        }),
      }),
    }),
  },
}));
```
Per-test overrides use `vi.mocked(supabase.from).mockReturnValue(...)`.

**`vi.fn()` for callback/function props** — passed directly to `renderHook` or component under test:
```typescript
const saveFn = vi.fn().mockResolvedValue(undefined);
renderHook(() => useAutosave(BASE, saveFn, true));
expect(saveFn).toHaveBeenCalledOnce();
```

**What to mock:**
- Supabase client when testing hooks that depend on it
- Peer hooks when testing a hook that composes others (e.g., `usePlanLimits` mocks `useProfile`, `useLinks`, `useUserRole`)
- Async callback functions passed as arguments to hooks

**What NOT to mock:**
- The hook/utility under test itself
- Pure utility functions with no I/O (`extractBgColor`, `normalizeSlug`, etc.) — tested directly without mocking

## Hook Testing

**`renderHook` + `act` pattern** for stateful hooks:
```typescript
import { renderHook, act } from "@testing-library/react";
import { useEditorHistory } from "@/hooks/use-editor-history";

const { result } = renderHook(() => useEditorHistory(BASE));

act(() => { result.current.set({ ...BASE, businessName: "V2" }); });
expect(result.current.state.businessName).toBe("V2");
expect(result.current.canUndo).toBe(true);
```

**Async `act` with fake timers** for debounce/delay testing:
```typescript
beforeEach(() => { vi.useFakeTimers(); });

await act(async () => { vi.advanceTimersByTime(800); });
expect(saveFn).not.toHaveBeenCalled();  // before debounce fires

await act(async () => { vi.advanceTimersByTime(300); });
expect(saveFn).toHaveBeenCalledOnce(); // after debounce fires
```

**`rerender` for prop changes** on hooks:
```typescript
const { result, rerender } = renderHook(
  ({ link }) => useAutosave(link, saveFn, true, 1000),
  { initialProps: { link: BASE } }
);
rerender({ link: { ...BASE, businessName: "Novo Nome" } });
```

## Pure Logic Testing

**Inline re-implementation pattern** — for testing logic extracted from components where the function is not directly exported:
```typescript
// Espelha exatamente a função generateUrl do ButtonBlockEditor.tsx (linha 36-45)
function generateWhatsAppUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${phone.replace(/\D/g, "")}`;
  return message?.trim()
    ? `${base}?text=${encodeURIComponent(message.trim())}`
    : base;
}
// Tests then exercise this inline implementation
```
Used in `whatsapp-url.test.ts` and `block-scheduling.test.ts`.

**Direct unit testing of pure utils:**
```typescript
expect(extractBgColor("from-gray-50 to-white")).toBe("#ffffff");
expect(normalizeSlug("Meu Link Incrível")).toBe("meu-link-incrivel");
expect(getCustomBgGradient("custom:#ff6b6b:#4ecdc4"))
  .toBe("linear-gradient(180deg, #ff6b6b, #4ecdc4)");
```

## Global Test Setup

**File:** `src/test/setup.ts`

```typescript
import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
```

Referenced in `vitest.config.ts` via `setupFiles: ["./src/test/setup.ts"]`.

## Coverage

**Requirements:** None enforced — no `coverage` threshold configured.

**View coverage:**
```bash
npx vitest run --coverage
```

## Test Types

**Unit Tests (all current tests):**
- Pure utility functions in `src/lib/`
- Custom React hooks in `src/hooks/`
- Isolated logic extracted inline from components

**Integration Tests:** Not present.

**E2E Tests:** Not used — no Playwright/Cypress configuration found.

**Component render tests:** Not present — `@testing-library/react` is installed but no component tests exist yet. Setup is ready (`renderHook` is used for hooks; component `render` is available).

## Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],           // SWC-based React plugin
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },  // mirrors tsconfig paths
  },
});
```

The `@/` alias must be declared in both `tsconfig.app.json` AND `vitest.config.ts` to work in tests.

---

*Testing analysis: 2026-03-28*
