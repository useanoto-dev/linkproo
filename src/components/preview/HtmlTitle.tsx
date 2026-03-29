import { useState, useRef, useMemo, useEffect } from "react";
import { buildHeightReporter, injectIntoHtmlDoc } from "@/components/preview/iframe-utils";

interface HtmlTitleProps {
  html: string;
  scale: number;
  align?: "left" | "center" | "right";
  textColor?: string;
}

const MSG_TYPE = "html-title-height";

/** Renders user-supplied HTML inside an isolated sandboxed iframe with auto height. */
export function HtmlTitle({ html, scale, align = "center", textColor = "#111" }: HtmlTitleProps) {
  const [height, setHeight] = useState(300);
  // useRef gives a stable ID that never triggers useMemo/useEffect deps changes
  const msgIdRef = useRef(`ht-${Math.random().toString(36).slice(2)}`);
  const msgId = msgIdRef.current;

  const srcDoc = useMemo(() => {
    const style = `<style>html,body{margin:0;padding:0;box-sizing:border-box;background:transparent;color:${textColor};text-align:${align};}</style>`;
    const reporter = buildHeightReporter(msgId, MSG_TYPE);
    return injectIntoHtmlDoc(html, style, reporter);
  }, [html, align, textColor, msgId]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      // Only accept messages from same origin or sandboxed iframes (origin === 'null')
      if (e.origin !== window.location.origin && e.origin !== 'null') return;
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === MSG_TYPE && e.data.id === msgId && typeof e.data.height === "number") {
        setHeight(Math.max(40, e.data.height + 8));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [msgId]);

  return (
    // Outer div reserves the SCALED layout height so content below isn't overlapped
    <div style={{ height: height * scale, width: "100%", overflow: "hidden" }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top center", height, width: "100%" }}>
        {/* key=srcDoc forces iframe remount when HTML changes */}
        <iframe
          key={srcDoc}
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          scrolling="no"
          style={{ width: "100%", height, border: "none", background: "transparent", display: "block" }}
          title="business-name"
        />
      </div>
    </div>
  );
}
