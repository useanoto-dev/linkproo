/**
 * Generates a stable device fingerprint from browser properties.
 * Not 100% perfect, but catches the vast majority of multi-account abuse
 * without requiring any native APIs or third-party libs.
 */
export async function getDeviceFingerprint(): Promise<string> {
  const parts: string[] = [
    navigator.userAgent,
    navigator.language,
    navigator.languages?.join(",") ?? "",
    String(screen.width) + "x" + String(screen.height),
    String(screen.colorDepth),
    String(screen.pixelDepth ?? ""),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    String(navigator.hardwareConcurrency ?? ""),
    String(navigator.maxTouchPoints ?? ""),
    // Platform/OS hint
    (navigator as { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform ?? "",
  ];

  // Canvas fingerprint — drawing produces slightly different output per GPU/driver
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.font = "14px 'Arial'";
      ctx.fillText("LinkPRO 🔑 #ident", 2, 15);
      ctx.fillStyle = "rgba(102,204,0,0.7)";
      ctx.font = "11px 'Times New Roman'";
      ctx.fillText("fp-canvas", 4, 35);
      parts.push(canvas.toDataURL().slice(0, 200));
    }
  } catch {
    // ignore — canvas blocked
  }

  // WebGL renderer — differs by GPU
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        parts.push(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) as string);
        parts.push(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string);
      }
    }
  } catch {
    // ignore
  }

  const raw = parts.filter(Boolean).join("|");
  return hashString(raw);
}

/** djb2-like hash, returns a base-36 string */
function hashString(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const combined = (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0;
  return combined.toString(36);
}
