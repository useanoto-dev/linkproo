import { SmartLinkButton, LinkType, SubPage } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link2 } from "lucide-react";
import { BrandIcon, linkTypeOptions, generateUrl } from "./shared";

interface Props {
  button: SmartLinkButton;
  onUpdate: (id: string, updates: Partial<SmartLinkButton>) => void;
  pages: SubPage[];
}

export function ButtonDestinationSection({ button, onUpdate, pages }: Props) {
  const currentType = button.linkType || "external";

  return (
    <div className="py-3 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Link2 className="h-3 w-3" /> Destino
      </p>

      <Select
        value={currentType}
        onValueChange={(val: LinkType) => {
          const newUrl = button.linkValue
            ? generateUrl(val, button.linkValue, button.whatsappMessage)
            : "";
          onUpdate(button.id, { linkType: val, url: newUrl });
        }}
      >
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent>
          {linkTypeOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className="flex items-center gap-2">
                <BrandIcon type={opt.value} size={16} />
                {opt.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentType === "page" ? (
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Sub-página</Label>
          <Select
            value={button.pageId || ""}
            onValueChange={(val) => onUpdate(button.id, { pageId: val, url: "" })}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Selecione a página" />
            </SelectTrigger>
            <SelectContent>
              {pages.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {pages.length === 0 && (
            <p className="text-[10px] text-amber-500">
              Crie uma sub-página primeiro no menu "Páginas"
            </p>
          )}
          <p className="text-[10px] text-muted-foreground">
            Ao clicar, abrirá a página selecionada em tela cheia
          </p>
        </div>
      ) : (
        <SmartLinkInput
          button={button}
          currentType={currentType}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

// ── Smart link input (non-page types) ────────────────────────────────────────

function SmartLinkInput({
  button,
  currentType,
  onUpdate,
}: {
  button: SmartLinkButton;
  currentType: LinkType;
  onUpdate: (id: string, updates: Partial<SmartLinkButton>) => void;
}) {
  const opt = linkTypeOptions.find((o) => o.value === currentType)!;

  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-muted-foreground">
        {currentType === "external" ? "URL" : opt.label}
      </Label>
      <div className="relative">
        {currentType !== "external" && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
            {currentType === "whatsapp" || currentType === "phone" ? "+" : "@"}
          </span>
        )}
        <Input
          value={button.linkValue ?? button.url ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            const url = generateUrl(currentType, val, button.whatsappMessage);
            onUpdate(button.id, { linkValue: val, url });
          }}
          placeholder={opt.placeholder}
          className={`text-sm h-9 font-mono ${currentType !== "external" ? "pl-7" : ""}`}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">{opt.helper}</p>

      {currentType === "whatsapp" && (
        <div className="space-y-1.5 pt-1">
          <Label className="text-[11px] text-muted-foreground">
            Mensagem pré-preenchida (opcional)
          </Label>
          <Input
            value={button.whatsappMessage ?? ""}
            onChange={(e) => {
              const msg = e.target.value;
              const linkVal = button.linkValue ?? "";
              const url = generateUrl("whatsapp", linkVal, msg);
              onUpdate(button.id, { whatsappMessage: msg, url });
            }}
            placeholder="Ex: Olá! Gostaria de saber mais sobre..."
            className="text-sm h-9"
          />
          <p className="text-[10px] text-muted-foreground">
            O visitante vai ver essa mensagem pronta no WhatsApp ao clicar
          </p>
        </div>
      )}

      {button.url && (
        <p className="text-[10px] text-primary font-mono truncate">→ {button.url}</p>
      )}
    </div>
  );
}
