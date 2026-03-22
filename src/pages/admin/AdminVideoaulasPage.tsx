import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  PlayCircle,
  Paperclip,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/DashboardLayout";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  ModuleDialog,
  LessonDialog,
  MaterialDialog,
} from "@/components/course/CourseDialogs";
import {
  useCourseModules,
  useAddModule,
  useUpdateModule,
  useDeleteModule,
  useAddLesson,
  useUpdateLesson,
  useDeleteLesson,
  useAddMaterial,
  useDeleteMaterial,
  CourseModule,
  Lesson,
} from "@/hooks/use-course";

// ─── Dialog state types ────────────────────────────────────────────────────────

interface ModuleDialogState {
  open: boolean;
  editing?: CourseModule;
}

interface LessonDialogState {
  open: boolean;
  moduleId?: string;
  editing?: Lesson;
}

interface MaterialDialogState {
  open: boolean;
  lessonId?: string;
}

interface ConfirmDeleteState {
  open: boolean;
  type: "module" | "lesson" | "material";
  id: string;
  label: string;
}

const CONFIRM_CLOSED: ConfirmDeleteState = {
  open: false,
  type: "module",
  id: "",
  label: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminVideoaulasPage() {
  const { data: modules = [], isLoading } = useCourseModules();

  const addModule = useAddModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();
  const addLesson = useAddLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const addMaterial = useAddMaterial();
  const deleteMaterial = useDeleteMaterial();

  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const [moduleDialog, setModuleDialog] = useState<ModuleDialogState>({
    open: false,
  });
  const [lessonDialog, setLessonDialog] = useState<LessonDialogState>({
    open: false,
  });
  const [materialDialog, setMaterialDialog] = useState<MaterialDialogState>({
    open: false,
  });
  const [confirmDelete, setConfirmDelete] =
    useState<ConfirmDeleteState>(CONFIRM_CLOSED);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const selectedModule = modules.find((m) => m.id === selectedModuleId) ?? null;

  function toggleModule(id: string) {
    setSelectedModuleId((prev) => (prev === id ? null : id));
  }

  // ── Module handlers ────────────────────────────────────────────────────────

  function handleSaveModule(data: { title: string; emoji: string }) {
    if (moduleDialog.editing) {
      updateModule.mutate(
        { id: moduleDialog.editing.id, ...data },
        {
          onSuccess: () => toast.success("Módulo atualizado"),
          onError: () => toast.error("Erro ao atualizar módulo"),
        }
      );
    } else {
      const nextOrder = modules.length > 0
        ? Math.max(...modules.map((m) => m.sort_order)) + 1
        : 1;
      addModule.mutate(
        { ...data, sort_order: nextOrder },
        {
          onSuccess: () => toast.success("Módulo criado"),
          onError: () => toast.error("Erro ao criar módulo"),
        }
      );
    }
  }

  function handleConfirmDelete() {
    if (confirmDelete.type === "module") {
      deleteModule.mutate(confirmDelete.id, {
        onSuccess: () => {
          toast.success("Módulo removido");
          if (selectedModuleId === confirmDelete.id) setSelectedModuleId(null);
        },
        onError: () => toast.error("Erro ao remover módulo"),
      });
    } else if (confirmDelete.type === "lesson") {
      deleteLesson.mutate(confirmDelete.id, {
        onSuccess: () => toast.success("Aula removida"),
        onError: () => toast.error("Erro ao remover aula"),
      });
    } else {
      deleteMaterial.mutate(confirmDelete.id, {
        onSuccess: () => toast.success("Material removido"),
        onError: () => toast.error("Erro ao remover material"),
      });
    }
    setConfirmDelete(CONFIRM_CLOSED);
  }

  // ── Lesson handlers ────────────────────────────────────────────────────────

  function handleSaveLesson(data: {
    title: string;
    description: string;
    video_url: string;
    duration: string;
  }) {
    if (lessonDialog.editing) {
      updateLesson.mutate(
        { id: lessonDialog.editing.id, ...data },
        {
          onSuccess: () => toast.success("Aula atualizada"),
          onError: () => toast.error("Erro ao atualizar aula"),
        }
      );
    } else if (lessonDialog.moduleId) {
      const mod = modules.find((m) => m.id === lessonDialog.moduleId);
      const nextOrder = mod && mod.lessons.length > 0
        ? Math.max(...mod.lessons.map((l) => l.sort_order)) + 1
        : 1;
      addLesson.mutate(
        { module_id: lessonDialog.moduleId, ...data, sort_order: nextOrder },
        {
          onSuccess: () => toast.success("Aula criada"),
          onError: () => toast.error("Erro ao criar aula"),
        }
      );
    }
  }

  // ── Material handler ───────────────────────────────────────────────────────

  function handleSaveMaterial(data: { label: string; url: string }) {
    if (!materialDialog.lessonId) return;
    const lesson = selectedModule?.lessons.find(
      (l) => l.id === materialDialog.lessonId
    );
    const nextOrder = lesson && lesson.materials.length > 0
      ? Math.max(...lesson.materials.map((m) => m.sort_order)) + 1
      : 1;
    addMaterial.mutate(
      { lesson_id: materialDialog.lessonId, ...data, sort_order: nextOrder },
      {
        onSuccess: () => toast.success("Material adicionado"),
        onError: () => toast.error("Erro ao adicionar material"),
      }
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <DashboardLayout title="Admin — Videoaulas">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin — Videoaulas">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* ── Section: Módulos ── */}
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground text-base">
                Módulos do Curso
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {modules.length}
              </span>
            </div>
            <button
              onClick={() => setModuleDialog({ open: true })}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Novo Módulo
            </button>
          </div>

          {/* Modules list */}
          {modules.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Nenhum módulo criado ainda.
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {modules
                .slice()
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((mod) => (
                  <div key={mod.id}>
                    {/* Module row */}
                    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/10 transition-colors group">
                      {/* Emoji + title */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="text-xl leading-none">{mod.emoji}</span>
                        <span className="font-medium text-foreground text-sm truncate">
                          {mod.title}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="hidden sm:flex items-center gap-6 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {mod.lessons.length}{" "}
                          {mod.lessons.length === 1 ? "aula" : "aulas"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Ordem: {mod.sort_order}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          title="Editar módulo"
                          onClick={() =>
                            setModuleDialog({ open: true, editing: mod })
                          }
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          title="Gerenciar aulas"
                          onClick={() => toggleModule(mod.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            selectedModuleId === mod.id
                              ? "text-primary bg-primary/10"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                          }`}
                        >
                          {selectedModuleId === mod.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          title="Remover módulo"
                          onClick={() =>
                            setConfirmDelete({
                              open: true,
                              type: "module",
                              id: mod.id,
                              label: mod.title,
                            })
                          }
                          className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* ── Expanded: Lessons ── */}
                    <AnimatePresence initial={false}>
                      {selectedModuleId === mod.id && (
                        <motion.div
                          key="lessons"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-secondary/10 border-t border-border/30">
                            {/* Lessons header */}
                            <div className="flex items-center justify-between px-6 py-3 border-b border-border/20">
                              <div className="flex items-center gap-2">
                                <PlayCircle className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold text-foreground">
                                  Aulas
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                  {mod.lessons.length}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  setLessonDialog({
                                    open: true,
                                    moduleId: mod.id,
                                  })
                                }
                                className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-3 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Nova Aula
                              </button>
                            </div>

                            {/* Lessons list */}
                            {mod.lessons.length === 0 ? (
                              <div className="py-8 text-center text-muted-foreground text-xs">
                                Nenhuma aula neste módulo.
                              </div>
                            ) : (
                              <div className="divide-y divide-border/20">
                                {mod.lessons
                                  .slice()
                                  .sort(
                                    (a, b) => a.sort_order - b.sort_order
                                  )
                                  .map((lesson) => (
                                    <div
                                      key={lesson.id}
                                      className="px-6 py-3 flex items-start gap-3 hover:bg-secondary/20 transition-colors group"
                                    >
                                      {/* Lesson info */}
                                      <div className="flex-1 min-w-0 space-y-0.5">
                                        <p className="text-sm font-medium text-foreground truncate">
                                          {lesson.title}
                                        </p>
                                        <div className="flex items-center gap-3 flex-wrap">
                                          {lesson.duration && (
                                            <span className="text-xs text-muted-foreground">
                                              {lesson.duration}
                                            </span>
                                          )}
                                          {lesson.video_url && (
                                            <span
                                              className="text-xs text-muted-foreground truncate max-w-[200px]"
                                              title={lesson.video_url}
                                            >
                                              {lesson.video_url.length > 40
                                                ? lesson.video_url.slice(0, 40) +
                                                  "…"
                                                : lesson.video_url}
                                            </span>
                                          )}
                                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Paperclip className="h-3 w-3" />
                                            {lesson.materials.length}{" "}
                                            {lesson.materials.length === 1
                                              ? "material"
                                              : "materiais"}
                                          </span>
                                        </div>

                                        {/* Materials list */}
                                        {lesson.materials.length > 0 && (
                                          <div className="flex flex-wrap gap-2 pt-1">
                                            {lesson.materials.map((mat) => (
                                              <div
                                                key={mat.id}
                                                className="flex items-center gap-1.5 bg-secondary/40 rounded-lg px-2.5 py-1 text-xs"
                                              >
                                                <a
                                                  href={mat.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-primary hover:underline"
                                                >
                                                  {mat.label}
                                                </a>
                                                <button
                                                  onClick={() =>
                                                    setConfirmDelete({
                                                      open: true,
                                                      type: "material",
                                                      id: mat.id,
                                                      label: mat.label,
                                                    })
                                                  }
                                                  className="text-destructive hover:text-destructive/80 transition-colors ml-1"
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* Lesson actions */}
                                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                        <button
                                          title="Editar aula"
                                          onClick={() =>
                                            setLessonDialog({
                                              open: true,
                                              moduleId: mod.id,
                                              editing: lesson,
                                            })
                                          }
                                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          title="Adicionar material"
                                          onClick={() =>
                                            setMaterialDialog({
                                              open: true,
                                              lessonId: lesson.id,
                                            })
                                          }
                                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                                        >
                                          <Paperclip className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          title="Remover aula"
                                          onClick={() =>
                                            setConfirmDelete({
                                              open: true,
                                              type: "lesson",
                                              id: lesson.id,
                                              label: lesson.title,
                                            })
                                          }
                                          className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Dialogs ── */}

      <ModuleDialog
        open={moduleDialog.open}
        onClose={() => setModuleDialog({ open: false })}
        initial={
          moduleDialog.editing
            ? {
                title: moduleDialog.editing.title,
                emoji: moduleDialog.editing.emoji,
              }
            : undefined
        }
        onSave={handleSaveModule}
      />

      <LessonDialog
        open={lessonDialog.open}
        onClose={() => setLessonDialog({ open: false })}
        initial={
          lessonDialog.editing
            ? {
                title: lessonDialog.editing.title,
                description: lessonDialog.editing.description,
                video_url: lessonDialog.editing.video_url,
                duration: lessonDialog.editing.duration,
              }
            : undefined
        }
        onSave={handleSaveLesson}
      />

      <MaterialDialog
        open={materialDialog.open}
        onClose={() => setMaterialDialog({ open: false })}
        onSave={handleSaveMaterial}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(v) =>
          !v && setConfirmDelete(CONFIRM_CLOSED)
        }
        title={
          confirmDelete.type === "module"
            ? "Remover módulo?"
            : confirmDelete.type === "lesson"
            ? "Remover aula?"
            : "Remover material?"
        }
        description={`"${confirmDelete.label}" será removido permanentemente. Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  );
}
