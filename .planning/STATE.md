---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: — Silicon Valley Quality Overhaul
status: unknown
stopped_at: Completed 04-02-PLAN.md
last_updated: "2026-03-25T23:23:58.854Z"
progress:
  total_phases: 10
  completed_phases: 4
  total_plans: 11
  completed_plans: 11
---

# State: Sistema Link PRO

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-23)

**Core value:** Qualquer negócio brasileiro deve conseguir criar uma página de link profissional e bonita em menos de 5 minutos.
**Current focus:** Phase 04 — analytics-rpc

## Current Position

Phase: 5
Plan: Not started

## Decisions

- [01-01] Glass tokens as CSS custom properties in :root/.dark for runtime theme switching
- [01-01] Removed .dark .glass override block — dark mode handled by CSS variable token switch
- [Phase 01]: SmartLinkRow is a manual type (not from generated Supabase types) because generated types are stale — missing 4 columns
- [Phase 01]: tsc --noEmit: 0 errors with strict:true — codebase was already defensively written, no suppressions backlog for Plan 03
- [Phase 01-03]: Pick<Tables<>> for Supabase result typing — matches only .select() columns; as unknown as ReturnType<> for test mocks; no ts-expect-error suppressions needed
- [Phase 02-03]: No consent pop-up for fingerprint data — LGPD Art. 7, IX legitimate interest basis does not require opt-in consent
- [Phase 02-03]: Privacy footer placed inside DashboardLayout main with flex-col so it appears on every dashboard page
- [Phase 02-security]: Using Faca without cedilla in RAISE EXCEPTION to avoid encoding issues in Supabase environments
- [Phase 02-security]: Slug reserved list is 43 entries (not 38 as documented in plan) - all entries from slug-utils.ts RESERVED_SLUGS included
- [02-01]: initProtection scoped to PublicLinkPage only — admins and editors no longer blocked from DevTools
- [02-01]: BgHtmlEffect sandbox without allow-same-origin — HTML background script cannot access parent origin
- [02-01]: Video/Spotify/LessonPlayer iframes get allow-same-origin — required for external video player APIs
- [03-01]: Preserved ref={block.type === 'text' ? textareaRef : undefined} pattern — cta type does not attach the textarea ref, matching original BlockEditor.tsx behavior
- [03-01]: No Lucide align icons needed in TextBlockEditor — alignment rendered with emoji strings (⬅/↔/➡)
- [Phase 03]: BusinessInfoPanel extracted from BlockEditor.tsx to meet <=300 line target — slug state collocated with its UI
- [Phase 03]: SortableList receives lazy editors via GroupEditorComponents props — avoids circular imports, keeps React.lazy in BlockEditor.tsx per D-07
- [Phase 04-analytics-rpc]: Admin guard uses has_role(auth.uid(), 'admin'::app_role) for get_admin_analytics; user guard uses auth.uid() <> user_uuid direct comparison for get_user_analytics
- [Phase 04-analytics-rpc]: referrer_top5 null/empty normalized to Direto server-side; URL hostname parsing stays client-side
- [Phase 04-analytics-rpc]: parseISO used for date formatting in analytics pages because RPC returns YYYY-MM-DD strings from Postgres

## Last Session

- **Stopped at:** Completed 04-02-PLAN.md
- **Timestamp:** 2026-03-24T04:47:00Z

## Accumulated Context

**Codebase mapped:** `.planning/codebase/` — STACK, ARCHITECTURE, STRUCTURE, CONVENTIONS, TESTING, INTEGRATIONS, CONCERNS (1444 lines total)

**Key findings from codebase map:**

- BlockEditor.tsx é um monolito de 1944 linhas — split em editores por tipo é prioridade de performance
- Analytics faz fetch client-side de até 5000 rows — mover para RPC Supabase
- Pagamento não implementado (só UI estática — Stripe não instalado)
- Custom domains é stub sem UI (listado em planos mas sem implementação)
- protect.ts bloqueia DevTools para todos — deve ser escopado ao PublicLinkPage
- Plan limits têm race condition — enforçar via Postgres trigger
- Framer Motion já instalado mas subutilizado
- TypeScript strict: false — múltiplos `as any` pelo codebase
- LGPD: device fingerprint sem disclosure para usuário
