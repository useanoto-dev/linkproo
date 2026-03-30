---
phase: 10
phase_slug: test-coverage
date: 2026-03-29
---

# Validation Matrix — Phase 10: Test Coverage

## Validation Commands per Plan

| Plan | Verification Command | Expected Result |
|------|---------------------|-----------------|
| 10-01 | `npx vitest run src/test/autosave-subscriber.test.ts` | 0 failures, 8+ tests pass |
| 10-01 | `npm run test:coverage -- --reporter=verbose 2>&1 \| head -5` | exits 0, coverage report generated |
| 10-02 | `npx vitest run src/test/editor-store.test.ts` | 0 failures, 12+ tests pass |
| 10-03 | `npx vitest run src/test/public-link-page.test.tsx` | 0 failures, 6+ tests pass |
| 10-03 | `npm run test:coverage` | exits 0 |
| 10-04 | `npx vitest run src/test/use-block-operations.test.ts` | 0 failures, 10+ tests pass |

## Full Suite Gate

```bash
npx vitest run
```
Expected: 0 failures across all test files (existing 129 + new 36+).

## Coverage Gate

```bash
npm run test:coverage
```
Expected: exits 0. Critical files appear in report:
- `src/stores/editor-store.ts`
- `src/stores/autosave-subscriber.ts`
- `src/pages/PublicLinkPage.tsx`

## File Existence Checks

```bash
test -f src/test/autosave-subscriber.test.ts && echo "OK" || echo "MISSING"
test -f src/test/editor-store.test.ts && echo "OK" || echo "MISSING"
test -f src/test/public-link-page.test.tsx && echo "OK" || echo "MISSING"
test -f src/test/use-block-operations.test.ts && echo "OK" || echo "MISSING"
! test -f src/test/use-autosave.test.ts && echo "OK (deleted)" || echo "STILL EXISTS"
```

## Infrastructure Checks

```bash
grep -r "@vitest/coverage-v8" package.json && echo "installed" || echo "MISSING"
grep "test:coverage" package.json && echo "script exists" || echo "MISSING"
grep -A 5 "coverage:" vite.config.ts && echo "config exists" || echo "MISSING"
```
