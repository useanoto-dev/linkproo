import { useParams } from "react-router-dom";
import { SmartLinkPreview } from "@/components/SmartLinkPreview";
import { usePublicLink, recordView } from "@/hooks/use-links";
import { useEffect, useRef, useState } from "react";
import { extractBgColor, getCustomBgGradient } from "@/lib/color-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { SubPageModal } from "@/components/SubPageModal";

export default function PublicLinkPage() {
  const { slug, pageSlug } = useParams<{ slug: string; pageSlug?: string }>();
  const { data: link, isLoading } = usePublicLink(slug);
  const [forcedPageId, setForcedPageId] = useState<string | null>(null);
  const viewRecorded = useRef(false);

  // Record view once
  useEffect(() => {
    if (link && !viewRecorded.current) {
      viewRecorded.current = true;
      recordView(link.id);
    }
  }, [link]);

  // Auto-open sub-page when pageSlug is present in the URL
  useEffect(() => {
    if (link && pageSlug) {
      const targetPage = (link.pages || []).find((p) => p.slug === pageSlug);
      if (targetPage) {
        setForcedPageId(targetPage.id);
      }
    }
  }, [link, pageSlug]);

  // Dynamic SEO meta tags with proper cleanup
  useEffect(() => {
    if (!link) return;
    document.title = `${link.businessName} | LinkPro`;

    const createdMetas: HTMLMetaElement[] = [];
    let canonicalEl: HTMLLinkElement | null = null;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        if (property.startsWith("og:")) {
          el.setAttribute("property", property);
        } else {
          el.setAttribute("name", property);
        }
        document.head.appendChild(el);
        createdMetas.push(el as HTMLMetaElement);
      }
      el.setAttribute("content", content);
    };

    const description = link.tagline || `${link.businessName} - Página de links`;
    const pageUrl = `${window.location.origin}/l/${link.slug}`;
    const ogImage = link.heroImage || link.logoUrl;

    setMeta("description", description);

    // Open Graph
    setMeta("og:title", link.businessName);
    setMeta("og:description", description);
    setMeta("og:type", "website");
    setMeta("og:url", pageUrl);
    if (ogImage) setMeta("og:image", ogImage);

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", link.businessName);
    setMeta("twitter:description", description);
    if (ogImage) setMeta("twitter:image", ogImage);

    // Canonical URL
    canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", pageUrl);

    return () => {
      document.title = "LinkPro";
      createdMetas.forEach((el) => el.remove());
      // Restore canonical to root
      if (canonicalEl) {
        canonicalEl.setAttribute("href", "https://liinkpro.lovable.app");
      }
    };
  }, [link]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center">
        <div className="w-full max-w-[480px] min-h-screen p-5 space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="flex flex-col items-center gap-3 px-2">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="space-y-3 px-2">
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Link não encontrado</h1>
          <p className="text-muted-foreground">Esse link inteligente não existe ou foi desativado.</p>
        </div>
      </div>
    );
  }

  const bgColor = extractBgColor(link.backgroundColor);
  const customBg = getCustomBgGradient(link.backgroundColor);

  const forcedPage = forcedPageId
    ? (link.pages || []).find((p) => p.id === forcedPageId) ?? null
    : null;

  return (
    <div
      className="min-h-screen flex justify-center"
      style={{ background: customBg || bgColor }}
    >
      <div className="w-full max-w-[480px] min-h-screen relative">
        <SmartLinkPreview link={link} />
        {forcedPage && (
          <SubPageModal
            page={forcedPage}
            link={link}
            onClose={() => setForcedPageId(null)}
          />
        )}
      </div>
    </div>
  );
}
