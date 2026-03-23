import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("PUBLIC_DOMAIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data: link } = await supabase
    .from("links")
    .select("business_name, tagline, hero_image, logo_url, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!link) {
    return new Response("Not found", { status: 404 });
  }

  const title = link.business_name || "LinkPro";
  const description = link.tagline || `${title} - Página de links inteligente`;
  const image = link.hero_image || link.logo_url || "";
  const baseDomain = Deno.env.get("PUBLIC_DOMAIN");
  if (!baseDomain) {
    return new Response("PUBLIC_DOMAIN not configured", { status: 500 });
  }
  const pageUrl = `${baseDomain}/l/${encodeURIComponent(link.slug)}`;
  const pageUrlEscaped = escapeHtml(pageUrl);

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} | LinkPro</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${pageUrlEscaped}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ""}
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="LinkPro" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ""}

  <!-- Canonical -->
  <link rel="canonical" href="${pageUrlEscaped}" />

  <!-- Redirect to SPA -->
  <meta http-equiv="refresh" content="0;url=${pageUrlEscaped}" />
  <script>window.location.href = ${JSON.stringify(pageUrl)};</script>
</head>
<body>
  <p>Redirecionando para <a href="${pageUrlEscaped}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
