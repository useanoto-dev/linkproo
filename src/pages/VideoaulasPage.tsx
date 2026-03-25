import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CourseSidebar } from "@/components/course/CourseSidebar";
import { LessonPlayer } from "@/components/course/LessonPlayer";
import { ModuleDialog, LessonDialog, MaterialDialog } from "@/components/course/CourseDialogs";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useUserRole } from "@/hooks/use-user-role";
import {
  useCourseModules,
  useLessonProgress,
  useToggleLessonProgress,
  useAddModule,
  useUpdateModule,
  useDeleteModule,
  useAddLesson,
  useUpdateLesson,
  useDeleteLesson,
  useAddMaterial,
  useDeleteMaterial,
  type Lesson,
  type CourseModule,
} from "@/hooks/use-course";

export default function VideoaulasPage() {
  const { data: modules = [], isLoading } = useCourseModules();
  const { data: completedLessons = new Set<string>() } = useLessonProgress();
  const { isAdmin } = useUserRole();
  const toggleProgress = useToggleLessonProgress();

  const addModule = useAddModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();
  const addLesson = useAddLesson();
  const updateLessonMut = useUpdateLesson();
  const deleteLessonMut = useDeleteLesson();
  const addMaterial = useAddMaterial();
  const deleteMaterial = useDeleteMaterial();

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [moduleDialog, setModuleDialog] = useState<{ open: boolean; editing?: CourseModule }>({ open: false });
  const [lessonDialog, setLessonDialog] = useState<{ open: boolean; moduleId?: string; editing?: Lesson }>({ open: false });
  const [materialDialog, setMaterialDialog] = useState<{ open: boolean; lessonId?: string }>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; type: "module" | "lesson"; id: string; label: string }>({ open: false, type: "module", id: "", label: "" });

  const currentLesson = activeLesson || (modules.length > 0 && modules[0].lessons.length > 0 ? modules[0].lessons[0] : null);

  const handleToggleComplete = useCallback(() => {
    if (!currentLesson) return;
    toggleProgress.mutate(
      { lessonId: currentLesson.id, completed: completedLessons.has(currentLesson.id) },
      { onError: () => toast.error("Erro ao atualizar progresso") }
    );
  }, [currentLesson, completedLessons, toggleProgress]);

  if (isLoading) {
    return (
      <DashboardLayout title="Videoaulas">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar skeleton */}
          <div className="w-full lg:w-72 shrink-0 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
          {/* Player area skeleton */}
          <div className="flex-1 space-y-4">
            <Skeleton className="w-full aspect-video rounded-xl" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (modules.length === 0) {
    return (
      <DashboardLayout title="Videoaulas">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Nenhum conteúdo disponível ainda.</p>
          {isAdmin && (
            <button
              onClick={() => setModuleDialog({ open: true })}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Criar primeiro módulo
            </button>
          )}
        </div>
        <ModuleDialog
          open={moduleDialog.open}
          onClose={() => setModuleDialog({ open: false })}
          onSave={(data) => addModule.mutate({ ...data, sort_order: 0 }, { onError: () => toast.error("Erro ao criar módulo") })}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Videoaulas">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)]">
        {currentLesson && (
          <LessonPlayer
            lesson={currentLesson}
            isCompleted={completedLessons.has(currentLesson.id)}
            onToggleComplete={handleToggleComplete}
            isAdmin={isAdmin}
            onEditLesson={() => setLessonDialog({ open: true, editing: currentLesson })}
            onAddMaterial={() => setMaterialDialog({ open: true, lessonId: currentLesson.id })}
            onDeleteMaterial={(id) => deleteMaterial.mutate(id, { onError: () => toast.error("Erro ao remover material") })}
          />
        )}

        <CourseSidebar
          modules={modules}
          activeLesson={currentLesson}
          completedLessons={completedLessons}
          onSelectLesson={setActiveLesson}
          isAdmin={isAdmin}
          onAddModule={() => setModuleDialog({ open: true })}
          onEditModule={(mod) => setModuleDialog({ open: true, editing: mod })}
          onDeleteModule={(id) => {
            const mod = modules.find((m) => m.id === id);
            setConfirmDelete({ open: true, type: "module", id, label: mod?.title || "módulo" });
          }}
          onAddLesson={(moduleId) => setLessonDialog({ open: true, moduleId })}
          onDeleteLesson={(id) => {
            const lesson = modules.flatMap((m) => m.lessons).find((l) => l.id === id);
            setConfirmDelete({ open: true, type: "lesson", id, label: lesson?.title || "aula" });
          }}
        />
      </div>

      <ModuleDialog
        open={moduleDialog.open}
        onClose={() => setModuleDialog({ open: false })}
        initial={moduleDialog.editing ? { title: moduleDialog.editing.title, emoji: moduleDialog.editing.emoji } : undefined}
        onSave={(data) => {
          if (moduleDialog.editing) {
            updateModule.mutate({ id: moduleDialog.editing.id, ...data }, { onError: () => toast.error("Erro ao editar módulo") });
          } else {
            addModule.mutate({ ...data, sort_order: modules.length }, { onError: () => toast.error("Erro ao criar módulo") });
          }
        }}
      />

      <LessonDialog
        open={lessonDialog.open}
        onClose={() => setLessonDialog({ open: false })}
        initial={lessonDialog.editing ? {
          title: lessonDialog.editing.title,
          description: lessonDialog.editing.description,
          video_url: lessonDialog.editing.video_url,
          duration: lessonDialog.editing.duration,
        } : undefined}
        onSave={(data) => {
          if (lessonDialog.editing) {
            updateLessonMut.mutate({ id: lessonDialog.editing.id, ...data }, { onError: () => toast.error("Erro ao editar aula") });
          } else if (lessonDialog.moduleId) {
            const mod = modules.find((m) => m.id === lessonDialog.moduleId);
            addLesson.mutate(
              { module_id: lessonDialog.moduleId, ...data, sort_order: mod?.lessons.length || 0 },
              { onError: () => toast.error("Erro ao criar aula") }
            );
          }
        }}
      />

      <MaterialDialog
        open={materialDialog.open}
        onClose={() => setMaterialDialog({ open: false })}
        onSave={(data) => {
          if (materialDialog.lessonId) {
            const lesson = modules.flatMap((m) => m.lessons).find((l) => l.id === materialDialog.lessonId);
            addMaterial.mutate(
              { lesson_id: materialDialog.lessonId, ...data, sort_order: lesson?.materials.length || 0 },
              { onError: () => toast.error("Erro ao adicionar material") }
            );
          }
        }}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(v) => !v && setConfirmDelete((s) => ({ ...s, open: false }))}
        title={confirmDelete.type === "module" ? `Remover módulo "${confirmDelete.label}" e todas as aulas?` : `Remover aula "${confirmDelete.label}"?`}
        description="Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        onConfirm={() => {
          if (confirmDelete.type === "module") {
            deleteModule.mutate(confirmDelete.id, { onError: () => toast.error("Erro ao remover módulo") });
          } else {
            deleteLessonMut.mutate(confirmDelete.id, { onError: () => toast.error("Erro ao remover aula") });
          }
        }}
      />
    </DashboardLayout>
  );
}
