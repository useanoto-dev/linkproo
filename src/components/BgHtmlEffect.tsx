import { useEffect, useMemo, useRef } from "react";

interface Props { html: string; }

export function BgHtmlEffect({ html }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    return () => {
      // Stop scripts in the iframe on unmount
      try {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.stop?.();
        }
      } catch {
        // Cross-origin errors are expected in some cases, ignore
      }
    };
  }, []);

  const srcDoc = useMemo(() => {
    const base = `<style>*{margin:0;padding:0;box-sizing:border-box;}html,body{width:100%;height:100%;overflow:hidden;}canvas{position:absolute;width:100%!important;height:100%!important;}</style>`;
    const fixScript = `<script>window.addEventListener('load',function(){var cs=document.querySelectorAll('canvas');cs.forEach(function(c){if(!c.hasAttribute('width')||c.width<2){c.width=window.innerWidth||document.documentElement.offsetWidth||400}if(!c.hasAttribute('height')||c.height<2){c.height=window.innerHeight||document.documentElement.offsetHeight||700}})});<\/script>`;
    let doc: string;
    if (html.includes("</head>")) {
      doc = html.replace("</head>", base + "</head>");
    } else if (html.includes("<html")) {
      doc = html.replace(/>/, ">" + base);
    } else {
      doc = base + html;
    }
    if (doc.includes("</body>")) {
      doc = doc.replace("</body>", fixScript + "</body>");
    } else {
      doc = doc + fixScript;
    }
    return doc;
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      scrolling="no"
      title="background-html"
      className="absolute inset-0 w-full h-full pointer-events-none z-0 border-none"
      style={{ display: "block" }}
    />
  );
}
