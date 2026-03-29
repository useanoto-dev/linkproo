import { useState, useRef, useMemo, useEffect } from "react";

interface HtmlTitleProps {
  html: string;
  scale: number;
  align?: "left" | "center" | "right";
  textColor?: string;
}

/** Renders user-supplied HTML inside an isolated sandboxed iframe with auto height. */
export function HtmlTitle({ html, scale, align = "center", textColor = "#111" }: HtmlTitleProps) {
  const [height, setHeight] = useState(300);

  // useRef gives a stable ID — more reliable than useMemo([]) which React can discard
  const msgIdRef = useRef(`ht-${Math.random().toString(36).slice(2)}`);
  const msgId = msgIdRef.current;

  // Inject style + postMessage height reporter with MutationObserver for dynamic content
  const srcDoc = useMemo(() => {
    const id = JSON.stringify(msgId);
    // background:transparent → page theme shows through; color fallback for unstyled snippets
    const defaultStyle = `<style>html,body{margin:0;padding:0;box-sizing:border-box;background:transparent;color:${textColor};text-align:${align};}</style>`;
    // Robust height measurement: handles absolute/fixed/flex/grid layouts
    const reporter =
      `<scr` +
      `ipt>` +
      `function _r(){` +
        `var h=0;` +
        `try{` +
          `h=Math.max(` +
            `document.body?document.body.scrollHeight:0,` +
            `document.body?document.body.offsetHeight:0,` +
            `document.documentElement?document.documentElement.scrollHeight:0,` +
            `document.documentElement?document.documentElement.offsetHeight:0` +
          `);` +
          // Fallback: scan all top-level children via bounding rects (catches abs/fixed)
          `if(h<10){var els=document.querySelectorAll("body > *");for(var i=0;i<els.length;i++){var r=els[i].getBoundingClientRect();h=Math.max(h,r.bottom+(window.pageYOffset||0));}}` +
          // Last resort: use viewport height (full-page designs)
          `if(h<10)h=window.innerHeight||200;` +
        `}catch(e){h=200;}` +
        `window.parent.postMessage({type:'html-title-height',id:${id},height:h},'*');` +
      `}` +
      `window.addEventListener('load',_r);` +
      `new MutationObserver(_r).observe(document.body,{childList:true,subtree:true,attributes:true});` +
      `setTimeout(_r,100);setTimeout(_r,500);setTimeout(_r,1200);` +
      `</scr` +
      `ipt>`;

    let doc = html;
    if (doc.includes("</head>")) {
      doc = doc.replace("</head>", defaultStyle + "</head>");
    } else if (/<body[\s>]/i.test(doc)) {
      doc = doc.replace(/<body[\s>]/i, (m) => defaultStyle + m);
    } else if (/^\s*<!|^\s*<html[\s>]/i.test(doc)) {
      doc = defaultStyle + doc;
    } else {
      doc = `<html><head>${defaultStyle}</head><body>${doc}</body></html>`;
    }

    return doc.includes("</body>")
      ? doc.replace("</body>", reporter + "</body>")
      : doc + reporter;
  }, [html, align, textColor, msgId]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      // Only accept messages from same origin or sandboxed iframes (origin === 'null')
      if (e.origin !== window.location.origin && e.origin !== 'null') return;
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === "html-title-height" && e.data.id === msgId && typeof e.data.height === "number") {
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
        {/* key=srcDoc forces iframe remount when HTML changes — browsers don't always
            reload an existing iframe when srcdoc attribute is updated dynamically */}
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
