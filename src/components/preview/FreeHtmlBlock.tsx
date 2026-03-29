import { useState, useEffect, useMemo, useRef } from "react";
import { buildHeightReporter, injectIntoHtmlDoc } from "@/components/preview/iframe-utils";

interface FreeHtmlBlockProps {
  htmlContent: string;
  fixedHeight?: number;
}

const MSG_TYPE = "fhb-height";
const BASE_STYLE = `<style>*{box-sizing:border-box;}html,body{margin:0;padding:0;width:100%;background:transparent;}</style>`;

/**
 * Renders user-provided HTML/CSS/scripts inside an isolated iframe.
 * - sandbox="allow-scripts": JS runs but cannot access parent DOM or cookies.
 * - Auto-height: postMessage reports body.scrollHeight when no fixed height set.
 * - Fixed height: renders with scrollbar if content overflows.
 */
export function FreeHtmlBlock({ htmlContent, fixedHeight }: FreeHtmlBlockProps) {
  const [autoHeight, setAutoHeight] = useState(150);
  // useRef gives a stable ID that never triggers useMemo/useEffect deps changes
  const msgIdRef = useRef(`fhb-${Math.random().toString(36).slice(2)}`);
  const msgId = msgIdRef.current;

  useEffect(() => {
    if (fixedHeight) return;
    function onMsg(e: MessageEvent) {
      // Only accept messages from same origin or sandboxed iframes (origin === 'null')
      if (e.origin !== window.location.origin && e.origin !== 'null') return;
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === MSG_TYPE && e.data.id === msgId && typeof e.data.height === "number") {
        setAutoHeight(Math.max(40, Math.min(e.data.height + 4, 2400)));
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [fixedHeight, msgId]);

  const srcDoc = useMemo(() => {
    const reporter = fixedHeight ? "" : buildHeightReporter(msgId, MSG_TYPE);
    return injectIntoHtmlDoc(htmlContent, BASE_STYLE, reporter);
  }, [htmlContent, fixedHeight, msgId]);

  const height = fixedHeight || autoHeight;

  return (
    // key=srcDoc forces a full iframe remount whenever HTML changes (reliable across all browsers)
    <iframe
      key={srcDoc}
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      scrolling={fixedHeight ? "yes" : "no"}
      title="html-livre"
      style={{
        width: "100%",
        height,
        border: "none",
        display: "block",
        borderRadius: 12,
        overflow: "hidden",
        background: "transparent",
      }}
    />
  );
}
