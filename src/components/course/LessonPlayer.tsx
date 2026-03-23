import { memo } from "react";
import { CheckCircle2, Download, Pencil, Plus, Trash2 } from "lucide-react";
import type { Lesson } from "@/hooks/use-course";

interface LessonPlayerProps {
  lesson: Lesson;
  isCompleted: boolean;
  onToggleComplete: () => void;
  isAdmin: boolean;
  onEditLesson?: () => void;
  onAddMaterial?: () => void;
  onDeleteMaterial?: (id: string) => void;
}

export const LessonPlayer = memo(function LessonPlayer({
  lesson,
  isCompleted,
  onToggleComplete,
  isAdmin,
  onEditLesson,
  onAddMaterial,
  onDeleteMaterial,
}: LessonPlayerProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Video */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl border border-border/30">
        {lesson.video_url ? (
          <iframe
            src={lesson.video_url}
            title={lesson.title}
            className="absolute inset-0 w-full h-full"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            Nenhum vídeo configurado
          </div>
        )}
      </div>

      {/* Lesson info */}
      <div className="mt-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{lesson.title}</h2>
              {isAdmin && (
                <button onClick={onEditLesson} className="p-1 rounded hover:bg-secondary">
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
          </div>
          <button
            onClick={onToggleComplete}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              isCompleted
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                : "bg-secondary text-muted-foreground border border-border/50 hover:border-primary/30"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isCompleted ? "Concluída" : "Marcar concluída"}
          </button>
        </div>

        {/* Materials */}
        {(lesson.materials.length > 0 || isAdmin) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {lesson.materials.map((mat) => (
              <div key={mat.id} className="flex items-center gap-1">
                <a
                  href={mat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  {mat.label}
                </a>
                {isAdmin && (
                  <button
                    onClick={() => onDeleteMaterial?.(mat.id)}
                    className="p-1 rounded hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                )}
              </div>
            ))}
            {isAdmin && (
              <button
                onClick={onAddMaterial}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Material
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
