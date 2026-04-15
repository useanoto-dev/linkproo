/**
 * Content protection — prevents right-click context menu and image dragging/saving.
 * Shows a branded toast when triggered.
 * Scoped to PublicLinkPage only (per D-02).
 *
 * Note: keyboard shortcut blocking (F12, DevTools, Ctrl+U) was intentionally
 * removed — it is trivial to bypass and creates a frustrating UX for legitimate
 * users (e.g. a11y tools, power users).  The protection here is UX-level only.
 */

let toastTimeout: ReturnType<typeof setTimeout> | null = null;

function showProtectToast() {
  // Debounce so rapid key mashing only fires once
  if (toastTimeout) return;
  toastTimeout = setTimeout(() => { toastTimeout = null; }, 2000);

  // Inject a one-off toast styled to match the brand (violet + white text)
  const el = document.createElement("div");
  el.setAttribute("role", "status");
  el.style.cssText = [
    "position:fixed",
    "bottom:20px",
    "right:20px",
    "z-index:99999",
    "background:var(--primary,#7C3AED)",
    "color:var(--primary-foreground,#fff)",
    "font-family:Inter,sans-serif",
    "font-size:13px",
    "font-weight:500",
    "padding:10px 16px",
    "border-radius:10px",
    "box-shadow:0 4px 20px rgba(0,0,0,0.25)",
    "display:flex",
    "align-items:center",
    "gap:8px",
    "animation:_fadeInUp 0.25s ease",
    "pointer-events:none",
    "max-width:320px",
    "line-height:1.4",
  ].join(";");

  // Inject keyframes once
  if (!document.getElementById("_protect-style")) {
    const s = document.createElement("style");
    s.id = "_protect-style";
    s.textContent = `
      @keyframes _fadeInUp {
        from { opacity:0; transform:translateY(10px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes _fadeOut {
        from { opacity:1; }
        to   { opacity:0; }
      }
    `;
    document.head.appendChild(s);
  }

  const lockIcon = document.createElement("span");
  lockIcon.style.fontSize = "15px";
  lockIcon.textContent = "🔒";
  const lockMsg = document.createElement("span");
  lockMsg.textContent = "Conteúdo protegido — direitos reservados.";
  el.appendChild(lockIcon);
  el.appendChild(lockMsg);
  document.body.appendChild(el);

  setTimeout(() => {
    el.style.animation = "_fadeOut 0.3s ease forwards";
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

export function initProtection(): () => void {
  function onContextMenu(e: MouseEvent) {
    e.preventDefault();
    showProtectToast();
  }

  function onDragStart(e: DragEvent) {
    if ((e.target as HTMLElement).tagName === "IMG") {
      e.preventDefault();
    }
  }

  function onSelectStart(e: Event) {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "IMG") e.preventDefault();
  }

  document.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("dragstart", onDragStart);
  document.addEventListener("selectstart", onSelectStart);

  return () => {
    document.removeEventListener("contextmenu", onContextMenu);
    document.removeEventListener("dragstart", onDragStart);
    document.removeEventListener("selectstart", onSelectStart);
  };
}
