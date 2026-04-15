import { useState, useRef, useMemo, useEffect } from "react";
import { injectIntoHtmlDoc } from "@/components/preview/iframe-utils";

interface HtmlTitleProps {
  html: string;
  scale: number;
  align?: "left" | "center" | "right";
  textColor?: string;
}

const MSG_TYPE = "html-title-height";

export function HtmlTitle({ html, scale, align = "center", textColor = "#111" }: HtmlTitleProps) {
  const [height, setHeight] = useState(1);
  const msgIdRef = useRef(`ht-${Math.random().toString(36).slice(2)}`);
  const msgId = msgIdRef.current;

  const srcDoc = useMemo(() => {
    // Full HTML document (user wrote <!DOCTYPE or <html>) → inject ONLY the height fix.
    // Do NOT override their CSS (color, text-align, margins, width, etc.)
    // Partial HTML → inject safe defaults so the text renders with correct color/align.
    const isFullDoc = /^\s*<!DOCTYPE|^\s*<html/i.test(html);
    // Full document: only fix height cascade + propagate the editor's align setting.
    // We use !important ONLY on height (prevents cascade bug) and text-align on html
    // (centers inline-block body elements without touching the user's body/content styles).
    // Partial HTML: inject full safe defaults so plain text renders with correct color/align.
    const style = isFullDoc
      ? [
          `<style>`,
          `html{height:auto!important;text-align:${align}!important;}`,
          `body{height:auto!important;}`,
          `</style>`,
        ].join("")
      : [
          `<style>`,
          `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}`,
          `html,body{height:auto;margin:0;padding:0;background:transparent;`,
          `color:${textColor};text-align:${align};}`,
          `</style>`,
        ].join("");

    const id = JSON.stringify(msgId);
    const type = JSON.stringify(MSG_TYPE);
    // Reporter: body.scrollHeight only (never documentElement → no cascade).
    // resize listener: re-measures when mobile/desktop container width changes.
    const reporter = [
      `<scr`, `ipt>`,
      `function _r(){`,
        `var h=0;`,
        `try{`,
          `var b=document.body;`,
          `h=b?Math.max(b.scrollHeight,b.offsetHeight):0;`,
          `if(h<4){var ch=b?b.children:[];`,
            `for(var i=0;i<ch.length;i++){var r=ch[i].getBoundingClientRect();h=Math.max(h,r.bottom+(window.pageYOffset||0));}`,
          `}`,
          `if(h<4)h=32;`,
        `}catch(e){h=32;}`,
        `window.parent.postMessage({type:${type},id:${id},height:h},'*');`,
      `}`,
      `window.addEventListener('load',_r);`,
      `window.addEventListener('resize',_r);`,
      `new MutationObserver(_r).observe(document.documentElement,{childList:true,subtree:true,attributes:true});`,
      `setTimeout(_r,50);setTimeout(_r,300);setTimeout(_r,900);`,
      `</scr`, `ipt>`,
    ].join("");

    return injectIntoHtmlDoc(html, style, reporter);
  }, [html, align, textColor, msgId]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin && e.origin !== "null") return;
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === MSG_TYPE && e.data.id === msgId && typeof e.data.height === "number") {
        setHeight(Math.max(20, e.data.height + 4));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [msgId]);

  return (
    // No overflow:hidden → content never clipped.
    // scale applied to iframe via transform (visual zoom only, no layout clip).
    <div style={{ height: height * scale, width: "100%", position: "relative" }}>
      <iframe
        key={srcDoc}
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        scrolling="no"
        style={{
          width: "100%",
          height,
          border: "none",
          background: "transparent",
          display: "block",
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: "top center",
        }}
        title="business-name"
      />
    </div>
  );
}
