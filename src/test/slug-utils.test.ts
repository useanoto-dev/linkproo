import { describe, it, expect, vi, beforeEach } from "vitest";
import { normalizeSlug, validateSlug, checkSlugAvailability } from "@/lib/slug-utils";

// ---------------------------------------------------------------------------
// Mock do Supabase — isolado por describe para evitar estado compartilhado
// ---------------------------------------------------------------------------
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          neq: vi.fn().mockResolvedValue({ count: 0, error: null }),
        }),
        // chamada sem excludeId não vai encadear .neq, mas a promise final
        // precisa existir; o mock do eq já retorna um objeto resolvível
      }),
    }),
  },
}));

// ---------------------------------------------------------------------------
// normalizeSlug
// ---------------------------------------------------------------------------
describe("normalizeSlug", () => {
  it("converte letras maiúsculas para minúsculas", () => {
    expect(normalizeSlug("MeuLink")).toBe("meulink");
    expect(normalizeSlug("EMPRESA")).toBe("empresa");
  });

  it("substitui espaços por hífens", () => {
    expect(normalizeSlug("meu link")).toBe("meu-link");
    expect(normalizeSlug("nome da empresa")).toBe("nome-da-empresa");
  });

  it("remove acentos e cedilha", () => {
    expect(normalizeSlug("ação")).toBe("acao");
    expect(normalizeSlug("café")).toBe("cafe");
    expect(normalizeSlug("coração")).toBe("coracao");
    expect(normalizeSlug("ções")).toBe("coes");
  });

  it("remove caracteres especiais e os substitui por hífens", () => {
    expect(normalizeSlug("hello@world!")).toBe("hello-world");
    expect(normalizeSlug("empresa&co")).toBe("empresa-co");
    expect(normalizeSlug("link.teste")).toBe("link-teste");
  });

  it("colapsa múltiplos hífens em um único hífen", () => {
    // espaços múltiplos → vários separadores → colapsados pelo regex
    expect(normalizeSlug("meu   link")).toBe("meu-link");
    expect(normalizeSlug("hello---world")).toBe("hello-world");
  });

  it("remove hífens no início e no fim", () => {
    expect(normalizeSlug("-meulink-")).toBe("meulink");
    expect(normalizeSlug("  espacos  ")).toBe("espacos");
  });

  it("trunca para no máximo 50 caracteres", () => {
    const longo = "a".repeat(60);
    expect(normalizeSlug(longo).length).toBe(50);
  });

  it("retorna string vazia para input vazio", () => {
    expect(normalizeSlug("")).toBe("");
  });

  it("retorna string vazia para input somente com caracteres especiais", () => {
    // apenas hífens que são removidos no início/fim
    expect(normalizeSlug("!!!")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// validateSlug
// ---------------------------------------------------------------------------
describe("validateSlug", () => {
  it("retorna mensagem de erro para slug vazio", () => {
    expect(validateSlug("")).not.toBeNull();
  });

  it("retorna mensagem de erro para slug com menos de 3 caracteres", () => {
    expect(validateSlug("ab")).not.toBeNull();
    expect(validateSlug("a")).not.toBeNull();
  });

  it("retorna null para slug válido com exatamente 3 caracteres", () => {
    expect(validateSlug("abc")).toBeNull();
  });

  it("retorna null para slug válido com letras e números", () => {
    expect(validateSlug("meu-link-123")).toBeNull();
    expect(validateSlug("empresa2025")).toBeNull();
  });

  it("retorna mensagem de erro para slug com letras maiúsculas", () => {
    expect(validateSlug("MeuLink")).not.toBeNull();
  });

  it("retorna mensagem de erro para slug com caracteres especiais", () => {
    expect(validateSlug("meu@link")).not.toBeNull();
    expect(validateSlug("link.com")).not.toBeNull();
    expect(validateSlug("link com espaco")).not.toBeNull();
  });

  it("retorna mensagem de erro para hífen no início ou fim", () => {
    expect(validateSlug("-meulink")).not.toBeNull();
    expect(validateSlug("meulink-")).not.toBeNull();
  });

  it("retorna mensagem de erro para hífens consecutivos", () => {
    expect(validateSlug("meu--link")).not.toBeNull();
  });

  it("retorna mensagem de erro para slug com mais de 50 caracteres", () => {
    expect(validateSlug("a".repeat(51))).not.toBeNull();
  });

  it("retorna null para slug com exatamente 50 caracteres", () => {
    // 50 chars: "a" * 50 — letras minúsculas válidas
    expect(validateSlug("a".repeat(50))).toBeNull();
  });

  it("retorna erro para slug reservado: admin", () => {
    expect(validateSlug("admin")).not.toBeNull();
  });

  it("retorna erro para slug reservado: dashboard", () => {
    expect(validateSlug("dashboard")).not.toBeNull();
  });

  it("retorna erro para slug reservado: settings", () => {
    expect(validateSlug("settings")).not.toBeNull();
  });

  it("retorna erro para slug reservado: analytics", () => {
    expect(validateSlug("analytics")).not.toBeNull();
  });

  it("retorna erro para slug reservado: login", () => {
    expect(validateSlug("login")).not.toBeNull();
  });

  it("retorna erro para slug reservado: auth", () => {
    expect(validateSlug("auth")).not.toBeNull();
  });

  it("retorna erro para slug reservado: null", () => {
    expect(validateSlug("null")).not.toBeNull();
  });

  it("retorna erro para slug reservado: undefined", () => {
    expect(validateSlug("undefined")).not.toBeNull();
  });

  it("retorna erro para slug reservado: api", () => {
    expect(validateSlug("api")).not.toBeNull();
  });

  it("retorna erro para slug reservado: www", () => {
    expect(validateSlug("www")).not.toBeNull();
  });

  it("retorna erro para slug reservado: links", () => {
    expect(validateSlug("links")).not.toBeNull();
  });

  it("retorna erro para slug reservado: plans", () => {
    expect(validateSlug("plans")).not.toBeNull();
  });

  it("retorna erro para slug reservado: sitemap", () => {
    expect(validateSlug("sitemap")).not.toBeNull();
  });

  it("não rejeita slugs que apenas contêm palavras reservadas como prefixo/sufixo", () => {
    // "admin" é reservado, mas "adminxyz" não é
    expect(validateSlug("adminxyz")).toBeNull();
    expect(validateSlug("myadmin")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// checkSlugAvailability
// ---------------------------------------------------------------------------
describe("checkSlugAvailability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna false para slug reservado sem consultar o banco", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const result = await checkSlugAvailability("admin");
    expect(result).toBe(false);
    // garantia de fail-fast: from() não deve ter sido chamado
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("retorna false para qualquer slug reservado sem consulta ao banco", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    for (const reserved of ["dashboard", "login", "settings", "api", "www"]) {
      vi.clearAllMocks();
      const result = await checkSlugAvailability(reserved);
      expect(result).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    }
  });

  it("consulta o banco para slug não-reservado", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    await checkSlugAvailability("meu-link-valido");
    expect(supabase.from).toHaveBeenCalledWith("links");
  });

  it("retorna true quando o banco devolve count 0 (slug disponível)", async () => {
    // O mock padrão retorna count: 0
    const result = await checkSlugAvailability("slug-disponivel");
    expect(result).toBe(true);
  });

  it("encadeia .neq quando excludeId é fornecido", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    // Precisamos capturar a chamada encadeada
    const neqSpy = vi.fn().mockResolvedValue({ count: 0, error: null });
    const eqSpy = vi.fn().mockReturnValue({ neq: neqSpy });
    const selectSpy = vi.fn().mockReturnValue({ eq: eqSpy });
    vi.mocked(supabase.from).mockReturnValue({ select: selectSpy } as any);

    await checkSlugAvailability("meu-link", "some-id-123");

    expect(neqSpy).toHaveBeenCalledWith("id", "some-id-123");
  });

  it("não encadeia .neq quando excludeId não é fornecido", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const neqSpy = vi.fn().mockResolvedValue({ count: 0, error: null });
    const eqSpy = vi.fn().mockResolvedValue({ count: 0, error: null });
    // eq retorna diretamente um objeto com then (Promise-like), sem neq
    eqSpy.mockReturnValue({ count: 0, error: null, then: undefined });

    const eqChain = { neq: neqSpy };
    const eqDirectSpy = vi.fn().mockReturnValue(eqChain);
    const selectSpy = vi.fn().mockReturnValue({ eq: eqDirectSpy });
    vi.mocked(supabase.from).mockReturnValue({ select: selectSpy } as any);

    await checkSlugAvailability("meu-link-sem-exclude");
    // neq não deve ser chamado quando não há excludeId
    expect(neqSpy).not.toHaveBeenCalled();
  });
});
