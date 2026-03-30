import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Mocks ANTES do import do componente
const mockUsePublicLink = vi.fn();
const mockRecordView = vi.fn();
const mockInitProtection = vi.fn(() => vi.fn());

vi.mock("@/hooks/use-links", () => ({
  usePublicLink: (...args: unknown[]) => mockUsePublicLink(...args),
  recordView: (...args: unknown[]) => mockRecordView(...args),
}));

vi.mock("@/lib/protect", () => ({
  initProtection: () => mockInitProtection(),
}));

vi.mock("@/components/SmartLinkPreview", () => ({
  SmartLinkPreview: ({ link }: { link: { businessName: string } }) => (
    <div data-testid="smart-link-preview">{link.businessName}</div>
  ),
}));

vi.mock("@/components/SubPageModal", () => ({
  SubPageModal: () => <div data-testid="sub-page-modal" />,
}));

import PublicLinkPage from "@/pages/PublicLinkPage";

const LINK_DATA = {
  id: "link-1",
  slug: "test-slug",
  businessName: "Minha Empresa",
  tagline: "Melhor tagline",
  heroImage: "",
  logoUrl: "",
  backgroundColor: "from-gray-50 to-white",
  textColor: "text-white",
  accentColor: "#f59e0b",
  buttons: [],
  pages: [],
  badges: [],
  floatingEmojis: [],
  blocks: [],
  views: 10,
  clicks: 5,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

function renderWithSlug(slug: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/${slug}`]}>
        <Routes>
          <Route path="/:slug" element={<PublicLinkPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PublicLinkPage", () => {
  it("renderiza estado de loading sem mostrar link ou not-found", () => {
    mockUsePublicLink.mockReturnValue({ data: undefined, isLoading: true });
    renderWithSlug("test-slug");

    expect(screen.queryByText(/link n.o encontrado/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("smart-link-preview")).not.toBeInTheDocument();
    // A estrutura de loading é renderizada (container público)
    expect(document.querySelector(".public-minisite")).toBeInTheDocument();
  });

  it("renderiza 'Link não encontrado' quando link é null", () => {
    mockUsePublicLink.mockReturnValue({ data: null, isLoading: false });
    renderWithSlug("nonexistent");

    expect(screen.getByText(/link n.o encontrado/i)).toBeInTheDocument();
    expect(screen.queryByTestId("smart-link-preview")).not.toBeInTheDocument();
  });

  it("renderiza SmartLinkPreview quando link existe", () => {
    mockUsePublicLink.mockReturnValue({ data: LINK_DATA, isLoading: false });
    renderWithSlug("test-slug");

    expect(screen.getByTestId("smart-link-preview")).toBeInTheDocument();
    expect(screen.getByText("Minha Empresa")).toBeInTheDocument();
  });

  it("chama recordView exatamente uma vez quando o link carrega", () => {
    mockUsePublicLink.mockReturnValue({ data: LINK_DATA, isLoading: false });
    renderWithSlug("test-slug");

    expect(mockRecordView).toHaveBeenCalledTimes(1);
    expect(mockRecordView).toHaveBeenCalledWith("link-1");
  });

  it("NÃO chama recordView quando link é null", () => {
    mockUsePublicLink.mockReturnValue({ data: null, isLoading: false });
    renderWithSlug("nothing");

    expect(mockRecordView).not.toHaveBeenCalled();
  });

  it("chama initProtection no mount", () => {
    mockUsePublicLink.mockReturnValue({ data: LINK_DATA, isLoading: false });
    renderWithSlug("test-slug");

    expect(mockInitProtection).toHaveBeenCalledTimes(1);
  });

  it("passa o slug correto para usePublicLink", () => {
    mockUsePublicLink.mockReturnValue({ data: null, isLoading: true });
    renderWithSlug("meu-slug-customizado");

    expect(mockUsePublicLink).toHaveBeenCalledWith("meu-slug-customizado");
  });
});
