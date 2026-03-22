import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, CheckCircle2, ChevronDown, ChevronRight, BookOpen, Plus, Trash2, Pencil } from "lucide-react";
import type { CourseModule, Lesson } from "@/hooks/use-course";

interface CourseSidebarProps {
  modules: CourseModule[];
  activeLesson: Lesson | null;
  completedLessons: Set<string>;
  onSelectLesson: (lesson: Lesson) => void;
  isAdmin: boolean;
  onAddModule?: () => void;
  onEditModule?: (mod: CourseModule) => void;
  onDeleteModule?: (id: string) => void;
  onAddLesson?: (moduleId: string) => void;
  onDeleteLesson?: (id: string) => void;
}

export const CourseSidebar = memo(function CourseSidebar({
  modules,
  activeLesson,
  completedLessons,
  onSelectLesson,
  isAdmin,
  onAddModule,
  onEditModule,
  onDeleteModule,
  onAddLesson,
  onDeleteLesson,
}: CourseSidebarProps) {
  const [expandedModule, setExpandedModule] = useState<string>(modules[0]?.id || "");

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const progress = totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0;

  return (
    <div className="w-full lg:w-[340px] shrink-0 flex flex-col bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Progress header */}
      <div className="p-4 border-b border-border/50 bg-secondary/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Conteúdo do Curso</span>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            {completedLessons.size}/{totalLessons} aulas
          </span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">{progress}% concluído</p>
      </div>

      {/* Modules */}
      <div className="flex-1 overflow-y-auto custom-scroll">
        {modules.map((mod) => {
          const isExpanded = expandedModule === mod.id;
          const modCompleted = mod.lessons.filter((l) => completedLessons.has(l.id)).length;

          return (
            <div key={mod.id} className="border-b border-border/30 last:border-b-0">
              <button
                onClick={() => setExpandedModule(isExpanded ? "" : mod.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors text-left group"
              >
                <span className="text-lg">{mod.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{mod.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {modCompleted}/{mod.lessons.length} aulas concluídas
                  </p>
                </div>
                {isAdmin && (
                  <div className="hidden group-hover:flex items-center gap-1">
                    <span
                      role="button"
                      onClick={(e) => { e.stopPropagation(); onEditModule?.(mod); }}
                      className="p-1 rounded hover:bg-secondary"
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </span>
                    <span
                      role="button"
                      onClick={(e) => { e.stopPropagation(); onDeleteModule?.(mod.id); }}
                      className="p-1 rounded hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </span>
                  </div>
                )}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {mod.lessons.map((lesson) => {
                      const isActive = activeLesson?.id === lesson.id;
                      const isDone = completedLessons.has(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => onSelectLesson(lesson)}
                          className={`w-full flex items-center gap-3 px-4 pl-6 py-2.5 text-left transition-colors group/lesson ${
                            isActive
                              ? "bg-primary/10 border-l-2 border-primary"
                              : "hover:bg-secondary/20 border-l-2 border-transparent"
                          }`}
                        >
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${
                            isDone
                              ? "bg-emerald-500/10 text-emerald-600"
                              : isActive
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground"
                          }`}>
                            {isDone ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs truncate ${isActive ? "font-semibold text-foreground" : "text-foreground/80"}`}>
                              {lesson.title}
                            </p>
                          </div>
                          {isAdmin && (
                            <span
                              role="button"
                              onClick={(e) => { e.stopPropagation(); onDeleteLesson?.(lesson.id); }}
                              className="hidden group-hover/lesson:block p-1 rounded hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {lesson.duration}
                          </span>
                        </button>
                      );
                    })}

                    {isAdmin && (
                      <button
                        onClick={() => onAddLesson?.(mod.id)}
                        className="w-full flex items-center gap-2 px-4 pl-6 py-2 text-xs text-muted-foreground hover:text-primary hover:bg-secondary/20 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        Adicionar aula
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {isAdmin && (
          <button
            onClick={onAddModule}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-primary hover:bg-secondary/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Adicionar módulo
          </button>
        )}
      </div>
    </div>
  );
});
