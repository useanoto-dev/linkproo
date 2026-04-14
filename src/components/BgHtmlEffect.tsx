import { useMemo } from "react";
import { CSP_META } from "@/components/preview/iframe-utils";

interface Props { html: string; }

export function BgHtmlEffect({ html }: Props) {
  const srcDoc = useMemo(() => {
    const patchedHtml = html
      .replace(/window\.innerWidth/g, '(document.documentElement.clientWidth||400)')
      .replace(/window\.innerHeight/g, '(document.documentElement.clientHeight||700)');
    const base = CSP_META + `<style>*{margin:0;padding:0;box-sizing:border-box;}html,body{width:100%;height:100%;overflow:hidden;background:transparent!important;}canvas{position:absolute;width:100%!important;height:100%!important;}</style>`;
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

  // Use position:fixed so the iframe covers the visible viewport, not the full
  // document height. Inside a CSS transform (e.g. DeviceFrame scale), fixed
  // elements are contained to the transformed ancestor — giving the correct
  // visible area in both the editor preview and the public page.
  return (
    <div
      className="pointer-events-none z-0"
      style={{ position: "fixed", inset: 0, overflow: "hidden" }}
    >
      <iframe
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        allow=""
        referrerPolicy="no-referrer"
        scrolling="no"
        loading="eager"
        title="background-html"
        style={{ display: "block", width: "100%", height: "100%", background: "transparent", border: "none" }}
      />
    </div>
  );
}
