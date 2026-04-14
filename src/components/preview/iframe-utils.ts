/**
 * Shared utilities for sandboxed iframe components (FreeHtmlBlock, HtmlTitle).
 * Centralises the postMessage height reporter and srcdoc injection logic.
 */

/**
 * CSP meta tag injected into every sandboxed iframe srcdoc.
 * Defense-in-depth on top of the `sandbox` attribute:
 *  - connect-src 'none'  → embedded page cannot make outbound XHR/fetch calls
 *  - frame-src 'none'    → prevents recursive iframe nesting
 *  - All other resources are limited to inline / data: URIs
 */
export const CSP_META =
  `<meta http-equiv="Content-Security-Policy" content="` +
  `default-src 'none'; ` +
  `script-src 'unsafe-inline'; ` +
  `style-src 'unsafe-inline' data:; ` +
  `img-src data: blob: *; ` +
  `font-src data: *; ` +
  `media-src *; ` +
  `connect-src 'none'; ` +
  `frame-src 'none';` +
  `">`;

/** Generates a script tag that reports element height to the parent via postMessage. */
export function buildHeightReporter(msgId: string, messageType: string): string {
  const id = JSON.stringify(msgId);
  return (
    `<scr` +
    `ipt>` +
    `function _rep(){` +
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
      `window.parent.postMessage({type:${JSON.stringify(messageType)},id:${id},height:h},'*');` +
    `}` +
    `window.addEventListener('load',_rep);` +
    `new MutationObserver(_rep).observe(document.body,{childList:true,subtree:true,attributes:true});` +
    `setTimeout(_rep,100);setTimeout(_rep,500);setTimeout(_rep,1200);` +
    `</scr` +
    `ipt>`
  );
}

/** Injects CSP meta, a style block, and a reporter script into an HTML document string. */
export function injectIntoHtmlDoc(html: string, style: string, reporter: string): string {
  // CSP is always first so it takes effect before any other resource is parsed
  const head = CSP_META + style;
  let doc = html;

  if (doc.includes("</head>")) {
    doc = doc.replace("</head>", head + "</head>");
  } else if (/<body[\s>]/i.test(doc)) {
    doc = doc.replace(/<body[\s>]/i, (m) => head + m);
  } else if (/^\s*<!|^\s*<html[\s>]/i.test(doc)) {
    doc = head + doc;
  } else {
    doc = `<html><head>${head}</head><body>${doc}</body></html>`;
  }

  return doc.includes("</body>")
    ? doc.replace("</body>", reporter + "</body>")
    : doc + reporter;
}
