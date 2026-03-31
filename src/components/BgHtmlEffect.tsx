import { useEffect, useMemo, useRef } from "react";

interface Props { html: string; }

export function BgHtmlEffect({ html }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const srcDoc = useMemo(() => {
    const patchedHtml = html
      .replace(/window\.innerWidth/g, '(document.documentElement.clientWidth||400)')
      .replace(/window\.innerHeight/g, '(document.documentElement.clientHeight||700)');
    const base = `<style>*{margin:0;padding:0;box-sizing:border-box;}html,body{width:100%;height:100%;overflow:hidden;background:transparent!important;}canvas{position:absolute;width:100%!important;height:100%!important;}</style>`;
    const fixScript = `<script>window.addEventListener('load',function(){var W=document.documentElement.clientWidth||400,H=document.documentElement.clientHeight||700;document.querySelectorAll('canvas').forEach(function(c){if(c.width<2){c.width=c.offsetWidth||W}if(c.height<2){c.height=c.offsetHeight||H}});window.dispatchEvent(new Event('resize'))});<\/script>`;
    let doc: string;
    if (patchedHtml.includes("</head>")) {
      doc = patchedHtml.replace("</head>", base + "</head>");
    } else if (patchedHtml.includes("<html")) {
      doc = patchedHtml.replace(/>/, ">" + base);
    } else {
      doc = base + patchedHtml;
    }
    if (doc.includes("</body>")) {
      doc = doc.replace("</body>", fixScript + "</body>");
    } else {
      doc = doc + fixScript;
    }
    return doc;
  }, [html]);

  // Imperatively reload iframe when srcDoc changes — changing srcDoc attribute
  // in-place doesn't always restart canvas scripts in all browsers.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const load = () => {
      try {
        const doc = iframe.contentDocument;
        if (doc) { doc.open(); doc.write(srcDoc); doc.close(); }
      } catch { /* sandboxed cross-origin, ignore */ }
    };
    // If already loaded, write immediately; otherwise wait for load event
    if (iframe.contentDocument?.readyState === 'complete' || iframe.contentDocument?.readyState === 'interactive') {
      load();
    } else {
      iframe.addEventListener('load', load, { once: true });
      return () => iframe.removeEventListener('load', load);
    }
  }, [srcDoc]);

  useEffect(() => {
    return () => {
      try {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.stop?.();
        }
      } catch { /* ignore */ }
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      allow=""
      referrerPolicy="no-referrer"
      scrolling="no"
      title="background-html"
      className="absolute inset-0 w-full h-full pointer-events-none z-0 border-none"
      style={{ display: "block", background: "transparent" }}
    />
  );
}
