import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { SupportFaq } from "@/hooks/use-support";

interface FaqDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { question: string; answer: string }) => void;
  initial?: SupportFaq;
}

export function FaqDialog({ open, onClose, onSave, initial }: FaqDialogProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (open) {
      setQuestion(initial?.question || "");
      setAnswer(initial?.answer || "");
    }
  }, [open, initial]);

  const handleSave = () => {
    if (!question.trim() || !answer.trim()) return;
    onSave({ question: question.trim(), answer: answer.trim() });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Pergunta" : "Nova Pergunta"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Pergunta" value={question} onChange={(e) => setQuestion(e.target.value)} />
          <Textarea placeholder="Resposta" value={answer} onChange={(e) => setAnswer(e.target.value)} rows={3} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!question.trim() || !answer.trim()}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
