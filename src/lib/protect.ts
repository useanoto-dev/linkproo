/**
 * Content protection — blocks devtools shortcuts, right-click and image saving.
 * Shows a branded toast when triggered.
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
    "background:#7C3AED",
    "color:#fff",
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

  el.innerHTML = `<span style="font-size:15px">🔒</span><span>Conteúdo protegido — direitos reservados.</span>`;
  document.body.appendChild(el);

  setTimeout(() => {
    el.style.animation = "_fadeOut 0.3s ease forwards";
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

export function initProtection() {
  // Block right-click
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showProtectToast();
  });

  // Block keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    const ctrl = e.ctrlKey || e.metaKey;

    const blocked =
      e.key === "F12" ||                              // DevTools
      (ctrl && e.shiftKey && ["I","J","C"].includes(e.key.toUpperCase())) || // DevTools panels
      (ctrl && e.key.toUpperCase() === "U") ||        // View source
      (ctrl && e.key.toUpperCase() === "S") ||        // Save page
      (ctrl && e.shiftKey && e.key.toUpperCase() === "S") || // Save as
      e.key === "F5" && ctrl ||                       // Hard refresh (optional)
      e.key === "PrintScreen";                        // Screenshot key

    if (blocked) {
      e.preventDefault();
      e.stopImmediatePropagation();
      showProtectToast();
    }
  }, true);

  // Block drag-to-save on images
  document.addEventListener("dragstart", (e) => {
    if ((e.target as HTMLElement).tagName === "IMG") {
      e.preventDefault();
    }
  });

  // Disable text selection on images only (not input/textarea)
  document.addEventListener("selectstart", (e) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "IMG") e.preventDefault();
  });
}
