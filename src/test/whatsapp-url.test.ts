/**
 * Testes da lógica de geração de URL WhatsApp implementada na Phase 9.
 * Reproduz a função generateUrl do ButtonBlockEditor.tsx (linha 36-45).
 */
import { describe, it, expect } from "vitest";

// Espelha exatamente a função generateUrl do ButtonBlockEditor para linkType='whatsapp':
//   const base = `https://wa.me/${value.replace(/\D/g, "")}`;
//   return whatsappMessage?.trim()
//     ? `${base}?text=${encodeURIComponent(whatsappMessage.trim())}`
//     : base;
function generateWhatsAppUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${phone.replace(/\D/g, "")}`;
  return message?.trim()
    ? `${base}?text=${encodeURIComponent(message.trim())}`
    : base;
}

describe("geração de URL WhatsApp com mensagem pré-preenchida (Phase 9)", () => {
  it("gera URL básica sem mensagem", () => {
    expect(generateWhatsAppUrl("5511999999999"))
      .toBe("https://wa.me/5511999999999");
  });

  it("remove caracteres não-numéricos do número (máscara)", () => {
    expect(generateWhatsAppUrl("+55 (11) 99999-9999"))
      .toBe("https://wa.me/5511999999999");
  });

  it("appends ?text= quando mensagem é fornecida", () => {
    const url = generateWhatsAppUrl("5511999999999", "Olá, quero saber mais!");
    expect(url).toContain("?text=");
    expect(url).toBe(
      `https://wa.me/5511999999999?text=${encodeURIComponent("Olá, quero saber mais!")}`
    );
  });

  it("não adiciona ?text= quando mensagem é string vazia", () => {
    expect(generateWhatsAppUrl("5511999999999", ""))
      .toBe("https://wa.me/5511999999999");
  });

  it("não adiciona ?text= quando mensagem é só espaços", () => {
    expect(generateWhatsAppUrl("5511999999999", "   "))
      .toBe("https://wa.me/5511999999999");
  });

  it("faz trim da mensagem antes de codificar", () => {
    const url = generateWhatsAppUrl("5511999999999", "  Olá  ");
    expect(url).toBe(
      `https://wa.me/5511999999999?text=${encodeURIComponent("Olá")}`
    );
  });

  it("codifica caracteres especiais e acentos na mensagem", () => {
    const msg = "Olá! Gostaria de saber mais & fazer um orçamento 🙂";
    const url = generateWhatsAppUrl("5511999999999", msg);
    expect(url).not.toContain(" ");
    expect(url).toContain(encodeURIComponent(msg));
  });

  it("codifica quebras de linha na mensagem", () => {
    const url = generateWhatsAppUrl("5511999999999", "Linha 1\nLinha 2");
    expect(url).toContain(encodeURIComponent("Linha 1\nLinha 2"));
  });

  it("URL resultante não contém espaços", () => {
    const url = generateWhatsAppUrl("5511999999999", "mensagem com espaços");
    expect(url).not.toContain(" ");
  });
});
