import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SmartLinkPreview } from "@/components/SmartLinkPreview";
import { usePublicLink, recordView } from "@/hooks/use-links";
import { useEffect, useRef, useState } from "react";
import { extractBgColor, getCustomBgGradient } from "@/lib/color-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { SubPageModal } from "@/components/SubPageModal";
import { initProtection } from "@/lib/protect";

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

  // Content protection — only on public pages (per D-02)
  useEffect(() => {
    const cleanup = initProtection();
    return cleanup;
  }, []);

  if (isLoading) {
    return (
      <div className="public-minisite bg-background flex justify-center" style={{ minHeight: '100dvh' }}>
        <div className="w-full max-w-[480px] p-5 space-y-4" style={{ minHeight: '100dvh' }}>
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

  const seoDescription = link.tagline || `${link.businessName} - Página de links`;
  const pageUrl = `${window.location.origin}/${link.slug}`;
  const ogImage = link.heroImage || link.logoUrl;

  return (
    <>
      <Helmet>
        <title>{link.businessName} | LinkPro</title>
        <meta name="description" content={seoDescription} />
        {/* Open Graph */}
        <meta property="og:title" content={link.businessName} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={link.businessName} />
        <meta name="twitter:description" content={seoDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        {/* Canonical */}
        <link rel="canonical" href={pageUrl} />
      </Helmet>
    <div
      className="public-minisite flex justify-center"
      style={{ background: customBg || bgColor, minHeight: '100dvh' }}
    >
      <div className="w-full max-w-[480px] relative" style={{ minHeight: '100dvh' }}>
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
    </>
  );
}
