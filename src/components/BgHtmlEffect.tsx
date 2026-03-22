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
    const base = `<style>*{margin:0;padding:0;box-sizing:border-box;}html,body{width:100%;height:100%;overflow:hidden;}</style>`;
    if (html.includes("</head>")) return html.replace("</head>", base + "</head>");
    if (html.includes("<html")) return html.replace(/>/, ">" + base);
    return base + html;
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
