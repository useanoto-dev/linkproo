import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface LessonMaterial {
  id: string;
  lesson_id: string;
  label: string;
  url: string;
  sort_order: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  video_url: string;
  duration: string;
  sort_order: number;
  materials: LessonMaterial[];
}

export interface CourseModule {
  id: string;
  title: string;
  emoji: string;
  sort_order: number;
  lessons: Lesson[];
}

// useIsAdmin removed — use useUserRole().isAdmin from use-user-role.ts instead

export function useCourseModules() {
  return useQuery({
    queryKey: ["course-modules"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_course_modules");
      if (error) throw error;
      return (data as unknown as CourseModule[]) || [];
    },
  });
}

export function useLessonProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["lesson-progress", user?.id],
    queryFn: async () => {
      if (!user) return new Set<string>();
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id);
      return new Set((data ?? []).map((d) => d.lesson_id));
    },
    enabled: !!user,
  });
}

export function useToggleLessonProgress() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, completed }: { lessonId: string; completed: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      if (completed) {
        await supabase
          .from("lesson_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId);
      } else {
        await supabase
          .from("lesson_progress")
          .insert({ user_id: user.id, lesson_id: lessonId });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lesson-progress"] });
    },
  });
}

// Admin mutations
export function useAddModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; emoji: string; sort_order: number }) => {
      const { error } = await supabase.from("course_modules").insert(data);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-modules"] }),
  });
}

export function useUpdateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; emoji?: string; sort_order?: number }) => {
      const { error } = await supabase.from("course_modules").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-modules"] }),
  });
}

export function useDeleteModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("course_modules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-modules"] }),
  });
}

export function useAddLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { module_id: string; title: string; description?: string; video_url?: string; duration?: string; sort_order: number }) => {
      const { error } = await supabase.from("course_lessons").insert(data);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-modules"] }),
  });
}

export function useUpdateLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; description?: string; video_url?: string; duration?: string }) => {
      const { error } = await supabase.from("course_lessons").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-modules"] }),
  });
}

export function useDeleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("course_lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-modules"] }),
  });
}

export function useAddMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { lesson_id: string; label: string; url: string; sort_order: number }) => {
      const { error } = await supabase.from("lesson_materials").insert(data);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-modules"] }),
  });
}

export function useDeleteMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lesson_materials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-modules"] }),
  });
}
