import React, { memo } from "react";
import { LinkBlock, FaqItem, GalleryImage, StatItem, ContactItem } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "../ImageUploader";
import { Trash2 } from "lucide-react";

interface ListBlockEditorProps {
  block: LinkBlock;
  onUpdate: (id: string, updates: Partial<LinkBlock>) => void;
}

export const ListBlockEditor = memo(function ListBlockEditor({ block, onUpdate }: ListBlockEditorProps) {
  return (
    <>
      {/* FAQ */}
      {block.type === "faq" && (
        <div className="space-y-3">
          {(block.faqItems || []).map((item, fi) => (
            <div key={item.id} className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground">#{fi + 1}</span>
                <button
                  onClick={() => {
                    const items = (block.faqItems || []).filter((f) => f.id !== item.id);
                    onUpdate(block.id, { faqItems: items });
                  }}
                  className="ml-auto p-1 text-destructive/60 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <Input
                value={item.question}
                onChange={(e) => {
                  const items = (block.faqItems || []).map((f) =>
                    f.id === item.id ? { ...f, question: e.target.value } : f
                  );
                  onUpdate(block.id, { faqItems: items });
                }}
                placeholder="Pergunta"
                className="text-sm h-8"
              />
              <Textarea
                value={item.answer}
                onChange={(e) => {
                  const items = (block.faqItems || []).map((f) =>
                    f.id === item.id ? { ...f, answer: e.target.value } : f
                  );
                  onUpdate(block.id, { faqItems: items });
                }}
                placeholder="Resposta"
                className="text-sm min-h-[50px]"
              />
            </div>
          ))}
          <button
            onClick={() => {
              const newItem: FaqItem = { id: `faq-${Date.now()}`, question: "", answer: "" };
              onUpdate(block.id, { faqItems: [...(block.faqItems || []), newItem] });
            }}
            className="w-full py-2 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            + Adicionar pergunta
          </button>
        </div>
      )}

      {/* Gallery */}
      {block.type === "gallery" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(block.galleryImages || []).map((img) => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border/40">
                <img src={img.url} alt="" className="w-full h-16 object-cover" />
                <button
                  onClick={() => {
                    const images = (block.galleryImages || []).filter((g) => g.id !== img.id);
                    onUpdate(block.id, { galleryImages: images });
                  }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            ))}
          </div>
          <ImageUploader
            value=""
            onChange={(url) => {
              const newImg: GalleryImage = { id: `gal-${Date.now()}`, url };
              onUpdate(block.id, { galleryImages: [...(block.galleryImages || []), newImg] });
            }}
            aspectRatio={1}
            label="Adicionar foto"
            compact
          />
        </div>
      )}

      {/* Testimonial */}
      {block.type === "testimonial" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nome</Label>
              <Input
                value={block.testimonialName || ""}
                onChange={e => onUpdate(block.id, { testimonialName: e.target.value })}
                placeholder="Maria Silva"
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Cargo / Empresa</Label>
              <Input
                value={block.testimonialRole || ""}
                onChange={e => onUpdate(block.id, { testimonialRole: e.target.value })}
                placeholder="CEO, Empresa X"
                className="text-sm h-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Depoimento</Label>
            <Textarea
              value={block.content || ""}
              onChange={e => onUpdate(block.id, { content: e.target.value })}
              placeholder="Produto incrível, mudou minha vida..."
              className="text-sm min-h-[70px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Avaliação (estrelas)</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => onUpdate(block.id, { testimonialRating: n })}
                  className={`text-xl transition-transform hover:scale-110 cursor-pointer ${n <= (block.testimonialRating ?? 5) ? "opacity-100" : "opacity-30"}`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
          <ImageUploader
            value={block.testimonialAvatar || ""}
            onChange={url => onUpdate(block.id, { testimonialAvatar: url })}
            aspectRatio={1}
            label="Foto (opcional)"
            compact
          />
        </div>
      )}

      {/* Stats */}
      {block.type === "stats" && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground">Ex: "10k" + "Clientes", "4.9★" + "Avaliação"</p>
          {(block.statItems || []).map((stat) => (
            <div key={stat.id} className="flex gap-2 items-center">
              <Input
                value={stat.value}
                onChange={e => {
                  const items = (block.statItems || []).map(s => s.id === stat.id ? { ...s, value: e.target.value } : s);
                  onUpdate(block.id, { statItems: items });
                }}
                placeholder="10k"
                className="text-sm h-8 w-20 text-center font-bold"
              />
              <Input
                value={stat.label}
                onChange={e => {
                  const items = (block.statItems || []).map(s => s.id === stat.id ? { ...s, label: e.target.value } : s);
                  onUpdate(block.id, { statItems: items });
                }}
                placeholder="Clientes"
                className="text-sm h-8 flex-1"
              />
              <button
                onClick={() => onUpdate(block.id, { statItems: (block.statItems || []).filter(s => s.id !== stat.id) })}
                className="p-1.5 text-destructive/60 hover:text-destructive cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newItem: StatItem = { id: `stat-${Date.now()}`, value: "", label: "" };
              onUpdate(block.id, { statItems: [...(block.statItems || []), newItem] });
            }}
            className="w-full py-2 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer"
          >
            + Adicionar stat
          </button>
        </div>
      )}

      {/* Product */}
      {block.type === "product" && (
        <div className="space-y-3">
          <ImageUploader
            value={block.productImage || ""}
            onChange={url => onUpdate(block.id, { productImage: url })}
            aspectRatio={4 / 3}
            label="Imagem do produto"
          />
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nome do Produto</Label>
            <Input
              value={block.productName || ""}
              onChange={e => onUpdate(block.id, { productName: e.target.value })}
              placeholder="Camiseta Premium"
              className="text-sm h-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Preço</Label>
              <Input
                value={block.productPrice || ""}
                onChange={e => onUpdate(block.id, { productPrice: e.target.value })}
                placeholder="R$ 89,90"
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Preço antigo (riscado)</Label>
              <Input
                value={block.productOldPrice || ""}
                onChange={e => onUpdate(block.id, { productOldPrice: e.target.value })}
                placeholder="R$ 129,90"
                className="text-sm h-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Descrição curta</Label>
            <Textarea
              value={block.productDescription || ""}
              onChange={e => onUpdate(block.id, { productDescription: e.target.value })}
              placeholder="Material 100% algodão..."
              className="text-sm min-h-[50px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Texto do botão</Label>
              <Input
                value={block.productButtonLabel || ""}
                onChange={e => onUpdate(block.id, { productButtonLabel: e.target.value })}
                placeholder="Comprar agora"
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Link do botão</Label>
              <Input
                value={block.productButtonUrl || ""}
                onChange={e => onUpdate(block.id, { productButtonUrl: e.target.value })}
                placeholder="https://..."
                className="text-sm h-9 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Contacts Block */}
      {block.type === "contacts" && (() => {
        const contacts: ContactItem[] = block.contactsList || [];
        const mode = block.contactsMode || 1;

        const updateContact = (idx: number, updates: Partial<ContactItem>) => {
          const updated = contacts.map((c, i) => i === idx ? { ...c, ...updates } : c);
          onUpdate(block.id, { contactsList: updated });
        };

        const addContact = () => {
          if (contacts.length >= 2) return;
          const newContact: ContactItem = {
            id: `contact-${Date.now()}`,
            name: "Novo Contato",
            role: "",
            photo: "",
            whatsappNumber: "",
            whatsappMessage: "Olá! Vim pelo seu link.",
          };
          onUpdate(block.id, { contactsList: [...contacts, newContact], contactsMode: 2 });
        };

        const removeContact = (idx: number) => {
          const updated = contacts.filter((_, i) => i !== idx);
          onUpdate(block.id, { contactsList: updated, contactsMode: updated.length === 1 ? 1 : mode });
        };

        return (
          <div className="space-y-4">
            {/* Mode toggle */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Modo</Label>
              <div className="flex gap-1 p-0.5 rounded-lg bg-secondary/50">
                {([1, 2] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      if (m === 2 && contacts.length < 2) addContact();
                      else onUpdate(block.id, { contactsMode: m });
                    }}
                    className={`flex-1 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      mode === m ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {m === 1 ? '1 Contato' : '2 Contatos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact cards */}
            {contacts.slice(0, mode).map((contact, idx) => (
              <div key={contact.id} className="space-y-3 p-3 rounded-xl border border-border/60 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Contato {idx + 1}</span>
                  {contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(idx)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    >
                      Remover
                    </button>
                  )}
                </div>

                {/* Photo */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Foto</Label>
                  <ImageUploader
                    value={contact.photo || ""}
                    onChange={(url) => updateContact(idx, { photo: url })}
                    compact
                    aspectRatio={1}
                    label="Foto do contato"
                  />
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  <Input
                    value={contact.name}
                    onChange={e => updateContact(idx, { name: e.target.value })}
                    placeholder="Nome do contato"
                    className="text-sm h-9"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Cargo / Função (opcional)</Label>
                  <Input
                    value={contact.role || ""}
                    onChange={e => updateContact(idx, { role: e.target.value })}
                    placeholder="Ex: Atendimento, Vendas..."
                    className="text-sm h-9"
                  />
                </div>

                {/* WhatsApp number */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Número WhatsApp</Label>
                  <Input
                    value={contact.whatsappNumber || ""}
                    onChange={e => updateContact(idx, { whatsappNumber: e.target.value })}
                    placeholder="5511999999999"
                    className="text-sm h-9 font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">DDI + DDD + número, sem espaços (ex: 5511999999999)</p>
                </div>

                {/* WhatsApp message */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Mensagem inicial do WhatsApp</Label>
                  <Input
                    value={contact.whatsappMessage || ""}
                    onChange={e => updateContact(idx, { whatsappMessage: e.target.value })}
                    placeholder="Olá! Vim pelo seu link."
                    className="text-sm h-9"
                  />
                </div>
              </div>
            ))}

            {/* Add second contact */}
            {mode === 1 && contacts.length < 2 && (
              <button
                type="button"
                onClick={addContact}
                className="w-full py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all cursor-pointer"
              >
                + Adicionar 2º contato
              </button>
            )}
          </div>
        );
      })()}
    </>
  );
});
