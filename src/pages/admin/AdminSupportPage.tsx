import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, MessageCircle, Mail, ExternalLink, Loader2, HelpCircle, Phone } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/DashboardLayout";
import { FaqDialog } from "@/components/support/FaqDialog";
import { ContactDialog } from "@/components/support/ContactDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

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

// ─── helpers ────────────────────────────────────────────────────────────────

function ChannelIcon({ type }: { type: string }) {
  if (type === "whatsapp") return <MessageCircle className="h-5 w-5 text-green-500" />;
  if (type === "email") return <Mail className="h-5 w-5 text-blue-500" />;
  if (type === "phone") return <Phone className="h-5 w-5 text-orange-500" />;
  return <ExternalLink className="h-5 w-5 text-muted-foreground" />;
}

function ChannelBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    whatsapp: "bg-green-500/10 text-green-600",
    email: "bg-blue-500/10 text-blue-600",
    phone: "bg-orange-500/10 text-orange-600",
  };
  const style = styles[type] ?? "bg-secondary text-muted-foreground";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${style}`}>
      {type}
    </span>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function AdminSupportPage() {
  const [tab, setTab] = useState<"faqs" | "contacts">("faqs");

  // dialogs
  const [faqDialog, setFaqDialog] = useState<{ open: boolean; editing?: SupportFaq }>({ open: false });
  const [contactDialog, setContactDialog] = useState<{ open: boolean; editing?: SupportContact }>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    type: "faq" | "contact";
    id: string;
    label: string;
  }>({ open: false, type: "faq", id: "", label: "" });

  // data
  const { data: faqs = [], isLoading: loadingFaqs } = useSupportFaqs();
  const { data: contacts = [], isLoading: loadingContacts } = useSupportContacts();

  // mutations
  const upsertFaq = useUpsertFaq();
  const deleteFaq = useDeleteFaq();
  const upsertContact = useUpsertContact();
  const deleteContact = useDeleteContact();

  // ── handlers ────────────────────────────────────────────────────────────

  function handleSaveFaq(data: { question: string; answer: string }) {
    const payload = faqDialog.editing
      ? { ...faqDialog.editing, ...data }
      : { question: data.question, answer: data.answer };
    upsertFaq.mutate(payload as any, {
      onSuccess: () => toast.success(faqDialog.editing ? "FAQ atualizada!" : "FAQ criada!"),
      onError: () => toast.error("Erro ao salvar FAQ"),
    });
  }

  function handleSaveContact(data: { channel_type: string; title: string; description: string; url: string }) {
    const payload = contactDialog.editing
      ? { ...contactDialog.editing, ...data }
      : data;
    upsertContact.mutate(payload as any, {
      onSuccess: () => toast.success(contactDialog.editing ? "Canal atualizado!" : "Canal criado!"),
      onError: () => toast.error("Erro ao salvar canal"),
    });
  }

  function handleConfirmDelete() {
    if (confirmDelete.type === "faq") {
      deleteFaq.mutate(confirmDelete.id, {
        onSuccess: () => toast.success("FAQ removida!"),
        onError: () => toast.error("Erro ao remover FAQ"),
      });
    } else {
      deleteContact.mutate(confirmDelete.id, {
        onSuccess: () => toast.success("Canal removido!"),
        onError: () => toast.error("Erro ao remover canal"),
      });
    }
    setConfirmDelete({ open: false, type: "faq", id: "", label: "" });
  }

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <DashboardLayout title="Gerenciar Suporte">
      <div className="space-y-6">
        {/* page heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-2"
        >
          <HelpCircle className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Suporte</h1>
        </motion.div>

        {/* tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="flex gap-1 p-1 rounded-xl bg-secondary/30 border border-border/50 w-fit"
        >
          {(["faqs", "contacts"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                tab === t
                  ? "bg-background text-foreground shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "faqs" ? "Perguntas Frequentes" : "Canais de Contato"}
            </button>
          ))}
        </motion.div>

        {/* ── FAQs tab ──────────────────────────────────────────────────────── */}
        {tab === "faqs" && (
          <motion.div
            key="faqs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* header row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Perguntas Frequentes</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  {faqs.length}
                </span>
              </div>
              <button
                onClick={() => setFaqDialog({ open: true, editing: undefined })}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm hover:bg-primary/90 transition-colors duration-150"
              >
                <Plus className="h-4 w-4" />
                Nova Pergunta
              </button>
            </div>

            {/* table */}
            {loadingFaqs ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : faqs.length === 0 ? (
              <div className="rounded-2xl border border-border/50 bg-card flex flex-col items-center justify-center gap-3 py-16 text-center">
                <HelpCircle className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nenhuma FAQ cadastrada</p>
                <button
                  onClick={() => setFaqDialog({ open: true, editing: undefined })}
                  className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm hover:bg-primary/90 transition-colors duration-150"
                >
                  <Plus className="h-4 w-4" />
                  Criar primeira FAQ
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-secondary/20">
                        <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">#</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Pergunta</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Resposta</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faqs.map((faq, i) => (
                        <motion.tr
                          key={faq.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: Math.min(i, 20) * 0.02 }}
                          className="border-b border-border/30 last:border-b-0 hover:bg-secondary/10 transition-colors"
                        >
                          <td className="px-5 py-3 text-muted-foreground text-xs font-mono">{faq.sort_order}</td>
                          <td className="px-5 py-3">
                            <span className="font-medium text-foreground max-w-xs truncate block">{faq.question}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-muted-foreground text-xs max-w-sm truncate block">{faq.answer}</span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setFaqDialog({ open: true, editing: faq })}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors duration-150"
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmDelete({ open: true, type: "faq", id: faq.id, label: faq.question })
                                }
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
                                title="Remover"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Contacts tab ──────────────────────────────────────────────────── */}
        {tab === "contacts" && (
          <motion.div
            key="contacts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* header row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Canais de Contato</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  {contacts.length}
                </span>
              </div>
              <button
                onClick={() => setContactDialog({ open: true, editing: undefined })}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm hover:bg-primary/90 transition-colors duration-150"
              >
                <Plus className="h-4 w-4" />
                Novo Canal
              </button>
            </div>

            {/* grid */}
            {loadingContacts ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="rounded-2xl border border-border/50 bg-card flex flex-col items-center justify-center gap-3 py-16 text-center">
                <MessageCircle className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nenhum canal cadastrado</p>
                <button
                  onClick={() => setContactDialog({ open: true, editing: undefined })}
                  className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm hover:bg-primary/90 transition-colors duration-150"
                >
                  <Plus className="h-4 w-4" />
                  Criar primeiro canal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contacts.map((contact, i) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 10) * 0.04 }}
                    className="rounded-2xl border border-border/50 bg-card p-5 flex flex-col gap-3"
                  >
                    {/* top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-secondary/40">
                          <ChannelIcon type={contact.channel_type} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{contact.title}</p>
                          <ChannelBadge type={contact.channel_type} />
                        </div>
                      </div>
                      {/* actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setContactDialog({ open: true, editing: contact })}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors duration-150"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDelete({ open: true, type: "contact", id: contact.id, label: contact.title })
                          }
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* description */}
                    {contact.description && (
                      <p className="text-xs text-muted-foreground">{contact.description}</p>
                    )}

                    {/* url */}
                    <a
                      href={contact.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline truncate"
                      title={contact.url}
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="truncate">{contact.url}</span>
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── dialogs ───────────────────────────────────────────────────────── */}

      <FaqDialog
        open={faqDialog.open}
        onClose={() => setFaqDialog({ open: false })}
        initial={faqDialog.editing}
        onSave={handleSaveFaq}
      />

      <ContactDialog
        open={contactDialog.open}
        onClose={() => setContactDialog({ open: false })}
        initial={contactDialog.editing}
        onSave={handleSaveContact}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(v) => setConfirmDelete((s) => ({ ...s, open: v }))}
        title="Remover item?"
        description={`"${confirmDelete.label}" será removido permanentemente. Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  );
}
