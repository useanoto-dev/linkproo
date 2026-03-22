import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { SupportContact } from "@/hooks/use-support";

interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { channel_type: string; title: string; description: string; url: string }) => void;
  initial?: SupportContact;
}

export function ContactDialog({ open, onClose, onSave, initial }: ContactDialogProps) {
  const [channelType, setChannelType] = useState("whatsapp");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (open) {
      setChannelType(initial?.channel_type || "whatsapp");
      setTitle(initial?.title || "");
      setDescription(initial?.description || "");
      setUrl(initial?.url || "");
    }
  }, [open, initial]);

  const handleSave = () => {
    if (!title.trim() || !url.trim()) return;
    onSave({ channel_type: channelType, title: title.trim(), description: description.trim(), url: url.trim() });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Canal" : "Novo Canal"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <select value={channelType} onChange={(e) => setChannelType(e.target.value)} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
            <option value="whatsapp">WhatsApp</option>
            <option value="email">E-mail</option>
          </select>
          <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Descrição (ex: Resposta em 2h)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input placeholder="URL (ex: https://wa.me/55...)" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!title.trim() || !url.trim()}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
