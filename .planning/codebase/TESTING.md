# Testing Patterns

**Analysis Date:** 2026-03-23

## Test Framework

**Runner:**
- Vitest 3.x
- Config: `vitest.config.ts`
- Environment: jsdom (browser simulation)
- Globals: enabled (`globals: true` — `describe`, `it`, `expect`, `vi` available without imports, though tests import them explicitly)

**Assertion Library:**
- Vitest built-in assertions (`expect`)
- `@testing-library/jest-dom` matchers extended via setup file (`src/test/setup.ts`)

**Run Commands:**
```bash
npm run test          # Run all tests once (vitest run)
npm run test:watch    # Watch mode (vitest)
# Coverage: not configured — no --coverage script present
```

## Test File Organization

**Location:**
- Centralized in `src/test/` — NOT co-located with source files

**Naming:**
- `{module-name}.test.ts` — e.g., `slug-utils.test.ts`, `color-utils.test.ts`, `link-mappers.test.ts`
- Extension: `.test.ts` for pure utility tests (no JSX); `.test.tsx` would be used for component tests (none currently exist)

**Structure:**
```
src/
└── test/
    ├── setup.ts              # Global test setup
    ├── example.test.ts       # Sanity checks for basic utils
    ├── color-utils.test.ts   # Tests for src/lib/color-utils.ts
    ├── link-mappers.test.ts  # Tests for src/lib/link-mappers.ts
    └── slug-utils.test.ts    # Tests for src/lib/slug-utils.ts
```

## Test Structure

**Suite Organization:**
```typescript
// Explicit imports even though globals are enabled
import { describe, it, expect, vi, beforeEach } from "vitest";
import { functionUnderTest } from "@/lib/module-name";

// Section dividers for grouping within a file
// ---------------------------------------------------------------------------
// functionName
// ---------------------------------------------------------------------------
describe("functionName", () => {
  it("description in Portuguese of what it does", () => {
    expect(functionUnderTest(input)).toBe(expectedOutput);
  });

  it("description of edge case", () => {
    expect(functionUnderTest(edgeInput)).toBeNull();
  });
});
```

**Patterns:**
- Multiple `describe` blocks per file — one per function or exported member
- Test descriptions written in **Brazilian Portuguese**
- One assertion focus per `it` block (though some verify multiple related properties)
- Setup: `beforeEach(() => { vi.clearAllMocks(); })` used when tests share mock state
- Teardown: not used (mocks cleared via `beforeEach`)
- Roundtrip tests to verify bidirectional data integrity — see `link-mappers.test.ts` "roundtrip" describe block

## Mocking

**Framework:** Vitest's built-in `vi` mock utilities

**Module-level mock (top of file):**
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

**Inline spy construction (per-test overrides):**
```typescript
it("encadeia .neq quando excludeId é fornecido", async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  const neqSpy = vi.fn().mockResolvedValue({ count: 0, error: null });
  const eqSpy = vi.fn().mockReturnValue({ neq: neqSpy });
  const selectSpy = vi.fn().mockReturnValue({ eq: eqSpy });
  vi.mocked(supabase.from).mockReturnValue({ select: selectSpy } as any);

  await checkSlugAvailability("meu-link", "some-id-123");
  expect(neqSpy).toHaveBeenCalledWith("id", "some-id-123");
});
```

**Mock reset:**
```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

**What to Mock:**
- External service clients — Supabase client (`@/integrations/supabase/client`) is the primary mock target
- Any function that makes network calls or has side effects

**What NOT to Mock:**
- Pure utility functions under test (e.g., `normalizeSlug`, `extractBgColor`)
- Domain logic that can be tested with plain inputs/outputs

## Fixtures and Factories

**Test Data:**
```typescript
// Module-level fixture constant (SCREAMING_SNAKE_CASE)
const FULL_SMART_LINK: SmartLink = {
  id: "test-id-001",
  slug: "empresa-teste",
  businessName: "Empresa Teste",
  // ... all fields populated
};

// Spread to create variants
const linkWithBubbles: SmartLink = {
  ...FULL_SMART_LINK,
  bubblesEffect: { enabled: true, intensity: 60, color: "#00ff00" },
};

// Minimal fixture for default-value tests
const minimalLink: SmartLink = {
  id: "min-id",
  slug: "minimal",
  // only required fields
};
```

**Location:**
- Fixtures defined inline at the top of each test file (no shared fixture directory)
- Constant name: `FULL_{TYPE_NAME}` for complete fixtures (e.g., `FULL_SMART_LINK`)

## Coverage

**Requirements:** Not enforced — no coverage script, no threshold configuration

**View Coverage:**
```bash
npx vitest run --coverage   # Not configured; would need @vitest/coverage-v8
```

## Test Types

**Unit Tests:**
- All 4 test files are pure unit tests
- Scope: individual exported functions from `src/lib/` utilities
- No component rendering tests (no `@testing-library/react` usage in existing tests)
- No integration tests against real Supabase

**Integration Tests:**
- Not present — Supabase interactions are unit-tested with mocks

**E2E Tests:**
- Not used — no Playwright, Cypress, or similar tool configured

## Common Patterns

**Async Testing:**
```typescript
it("retorna true quando o banco devolve count 0 (slug disponível)", async () => {
  const result = await checkSlugAvailability("slug-disponivel");
  expect(result).toBe(true);
});
```

**Error Testing (non-throw pattern):**
```typescript
// Validate that validation returns an error message string
it("retorna mensagem de erro para slug vazio", () => {
  expect(validateSlug("")).not.toBeNull();
});

// Validate that no exception is thrown
it("não lança erro com row totalmente vazio", () => {
  expect(() => rowToSmartLink({})).not.toThrow();
});
```

**Exhaustive preset/array validation:**
```typescript
// Loop over all known values to assert consistent behavior
it("retorna todos os presets do colorMap sem retornar #000000", () => {
  const knownPresets = ["from-gray-50 to-white", "from-slate-950 to-slate-900", ...];
  for (const preset of knownPresets) {
    const result = extractBgColor(preset);
    expect(result, `Preset "${preset}" deveria ter uma cor mapeada`).not.toBe("#000000");
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
  }
});
```

**Spy call assertions:**
```typescript
// Verify a function was NOT called (fail-fast guard)
expect(supabase.from).not.toHaveBeenCalled();

// Verify called with specific args
expect(neqSpy).toHaveBeenCalledWith("id", "some-id-123");
```

## Global Test Setup

**File:** `src/test/setup.ts`

Imports `@testing-library/jest-dom` for extended matchers and polyfills `window.matchMedia` for jsdom compatibility:

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

## Coverage Gaps

All 4 existing test files cover only `src/lib/` utilities. The following areas have zero test coverage:

- All React components (`src/components/`)
- All pages (`src/pages/`)
- All hooks (`src/hooks/`) — including `use-links.ts`, `use-autosave.ts`, `use-plan-limits.ts`
- All contexts (`src/contexts/AuthContext.tsx`, `src/contexts/ThemeContext.tsx`)
- `src/lib/block-utils.ts`, `src/lib/image-utils.ts`, `src/lib/storage-utils.ts`, `src/lib/device-fingerprint.ts`
- Supabase integrations (`src/integrations/supabase/`)

---

*Testing analysis: 2026-03-23*
