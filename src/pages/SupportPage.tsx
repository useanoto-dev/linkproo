import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  MessageCircle, Mail, FileText, ChevronDown, ChevronUp,
  ExternalLink, Search, HelpCircle, BookOpen, Zap, Plus, Pencil, Trash2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useUserRole } from "@/hooks/use-user-role";
import {
  useSupportFaqs,
  useSupportContacts,
  useUpsertFaq,
  useDeleteFaq,
  useUpsertContact,
  useDeleteContact,
  type SupportFaq,
  type SupportContact,
} from "@/hooks/use-support";
import { FaqDialog } from "@/components/support/FaqDialog";
import { ContactDialog } from "@/components/support/ContactDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const CHANNEL_ICONS: Record<string, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  email: Mail,
};

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: "bg-emerald-500/10 text-emerald-600",
  email: "bg-blue-500/10 text-blue-600",
};

export default function SupportPage() {
  const { isAdmin } = useUserRole();
  const { data: faqs = [], isLoading: faqsLoading } = useSupportFaqs();
  const { data: contacts = [], isLoading: contactsLoading } = useSupportContacts();
  const upsertFaq = useUpsertFaq();
  const deleteFaqMut = useDeleteFaq();
  const upsertContact = useUpsertContact();
  const deleteContactMut = useDeleteContact();

  const [searchTerm, setSearchTerm] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [faqDialog, setFaqDialog] = useState<{ open: boolean; editing?: SupportFaq }>({ open: false });
  const [contactDialog, setContactDialog] = useState<{ open: boolean; editing?: SupportContact }>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; type: "faq" | "contact"; id: string; label: string }>({ open: false, type: "faq", id: "", label: "" });

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (faqsLoading || contactsLoading) {
    return (
      <DashboardLayout title="Suporte">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero skeleton */}
          <div className="flex flex-col items-center py-8">
            <Skeleton className="w-14 h-14 rounded-2xl mb-4" />
            <Skeleton className="h-7 w-52 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          {/* Search skeleton */}
          <Skeleton className="h-11 w-full max-w-lg mx-auto rounded-lg" />
          {/* Contact cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
          {/* FAQ skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Suporte">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero */}
        <motion.div className="text-center py-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <HelpCircle className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Como podemos ajudar?</h1>
          <p className="text-sm text-muted-foreground mt-2">Encontre respostas rápidas ou entre em contato com nossa equipe</p>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar nas perguntas frequentes..." className="pl-10 h-11 text-sm" />
        </div>

        {/* Contact channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contacts.map((channel) => {
            const Icon = CHANNEL_ICONS[channel.channel_type] || Mail;
            const color = CHANNEL_COLORS[channel.channel_type] || "bg-secondary text-muted-foreground";
            return (
              <div key={channel.id} className="relative group">
                <a href={channel.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all">
                  <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{channel.title}</p>
                    <p className="text-[11px] text-muted-foreground">{channel.description}</p>
                  </div>
                  <span className="text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Abrir <ExternalLink className="h-3 w-3" />
                  </span>
                </a>
                {isAdmin && (
                  <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
                    <button onClick={() => setContactDialog({ open: true, editing: channel })} className="p-1.5 rounded-lg bg-card border border-border/50 hover:bg-secondary">
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <button onClick={() => setConfirmDelete({ open: true, type: "contact", id: channel.id, label: channel.title })} className="p-1.5 rounded-lg bg-card border border-border/50 hover:bg-destructive/10">
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {isAdmin && (
            <button onClick={() => setContactDialog({ open: true })} className="flex items-center justify-center gap-2 p-5 rounded-2xl border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
              <Plus className="h-4 w-4" /> Adicionar canal
            </button>
          )}
        </div>

        {/* FAQ */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Perguntas Frequentes</h2>
            </div>
            {isAdmin && (
              <button onClick={() => setFaqDialog({ open: true })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 transition-colors">
                <Plus className="h-3 w-3" /> Nova pergunta
              </button>
            )}
          </div>

          <div className="space-y-2">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className="rounded-xl border border-border/50 bg-card overflow-hidden group">
                  <button onClick={() => setOpenFaq(isOpen ? null : faq.id)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-secondary/20 transition-colors">
                    <span className="text-sm font-medium text-foreground">{faq.question}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {isAdmin && (
                        <>
                          <span role="button" onClick={(e) => { e.stopPropagation(); setFaqDialog({ open: true, editing: faq }); }} className="hidden group-hover:block p-1 rounded hover:bg-secondary">
                            <Pencil className="h-3 w-3 text-muted-foreground" />
                          </span>
                          <span role="button" onClick={(e) => { e.stopPropagation(); setConfirmDelete({ open: true, type: "faq", id: faq.id, label: faq.question }); }} className="hidden group-hover:block p-1 rounded hover:bg-destructive/10">
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </span>
                        </>
                      )}
                      {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </div>
              );
            })}
            {filteredFaqs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Nenhuma pergunta encontrada</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="flex items-center justify-center gap-4 pb-8">
          <a href="/videoaulas" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
            <BookOpen className="h-3.5 w-3.5" /> Ver Videoaulas
          </a>
          <a href="/plans" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border/50 text-xs font-medium text-foreground hover:border-primary/30 transition-colors">
            <Zap className="h-3.5 w-3.5 text-primary" /> Ver Planos
          </a>
        </div>
      </div>

      <FaqDialog
        open={faqDialog.open}
        onClose={() => setFaqDialog({ open: false })}
        initial={faqDialog.editing}
        onSave={(data) => {
          upsertFaq.mutate(
            { ...data, id: faqDialog.editing?.id, sort_order: faqDialog.editing?.sort_order ?? faqs.length },
            { onSuccess: () => toast.success("Salvo!"), onError: () => toast.error("Erro ao salvar") }
          );
        }}
      />

      <ContactDialog
        open={contactDialog.open}
        onClose={() => setContactDialog({ open: false })}
        initial={contactDialog.editing}
        onSave={(data) => {
          upsertContact.mutate(
            { ...data, id: contactDialog.editing?.id, sort_order: contactDialog.editing?.sort_order ?? contacts.length },
            { onSuccess: () => toast.success("Salvo!"), onError: () => toast.error("Erro ao salvar") }
          );
        }}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(v) => !v && setConfirmDelete((s) => ({ ...s, open: false }))}
        title={`Remover "${confirmDelete.label}"?`}
        description="Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        onConfirm={() => {
          if (confirmDelete.type === "faq") {
            deleteFaqMut.mutate(confirmDelete.id, { onError: () => toast.error("Erro ao remover") });
          } else {
            deleteContactMut.mutate(confirmDelete.id, { onError: () => toast.error("Erro ao remover") });
          }
        }}
      />
    </DashboardLayout>
  );
}
