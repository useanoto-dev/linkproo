import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ModuleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; emoji: string }) => void;
  initial?: { title: string; emoji: string };
}

export function ModuleDialog({ open, onClose, onSave, initial }: ModuleDialogProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [emoji, setEmoji] = useState(initial?.emoji || "📚");

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), emoji });
    setTitle("");
    setEmoji("📚");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Módulo" : "Novo Módulo"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Emoji (ex: 🚀)" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} />
          <Input placeholder="Nome do módulo" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!title.trim()}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface LessonDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string; video_url: string; duration: string }) => void;
  initial?: { title: string; description: string; video_url: string; duration: string };
}

export function LessonDialog({ open, onClose, onSave, initial }: LessonDialogProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [videoUrl, setVideoUrl] = useState(initial?.video_url || "");
  const [duration, setDuration] = useState(initial?.duration || "0:00");

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), description, video_url: videoUrl, duration });
    setTitle(""); setDescription(""); setVideoUrl(""); setDuration("0:00");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Aula" : "Nova Aula"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Título da aula" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          <Input placeholder="URL do vídeo (embed)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          <Input placeholder="Duração (ex: 5:30)" value={duration} onChange={(e) => setDuration(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!title.trim()}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface MaterialDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { label: string; url: string }) => void;
}

export function MaterialDialog({ open, onClose, onSave }: MaterialDialogProps) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const handleSave = () => {
    if (!label.trim() || !url.trim()) return;
    onSave({ label: label.trim(), url: url.trim() });
    setLabel(""); setUrl("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Material</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Nome do material" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Input placeholder="URL do arquivo ou link" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!label.trim() || !url.trim()}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
