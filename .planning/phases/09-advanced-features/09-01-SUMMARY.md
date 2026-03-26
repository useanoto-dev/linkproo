---
plan: 09-01
phase: 09-advanced-features
status: complete
completed: 2026-03-26
---

# Summary: WhatsApp Button with Pre-filled Message

## Changes

- `src/types/smart-link.ts`: Added `whatsappMessage?: string` to `SmartLinkButton`
- `src/components/editor/ButtonBlockEditor.tsx`:
  - `generateUrl` now accepts optional `whatsappMessage` param — appends `?text=ENCODED` to wa.me URL when set
  - Both linkType change and linkValue change handlers pass `whatsappMessage` through
  - Added "Mensagem pré-preenchida" input field that appears only when `linkType === 'whatsapp'`
  - Changing the message updates `url` in real-time

## Behavior

When user sets linkType=whatsapp and enters a message, the generated URL becomes:
`https://wa.me/5511999999999?text=Ol%C3%A1%21%20Gostaria%20de%20saber%20mais...`

The visitor clicks the button → WhatsApp opens with the message pre-typed.

## Verification

- `npx tsc --noEmit` — 0 errors
