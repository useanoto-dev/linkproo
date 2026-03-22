import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SupportFaq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface SupportContact {
  id: string;
  channel_type: string;
  title: string;
  description: string;
  url: string;
  sort_order: number;
}

export function useSupportFaqs() {
  return useQuery({
    queryKey: ["support-faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_faqs")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as SupportFaq[];
    },
  });
}

export function useSupportContacts() {
  return useQuery({
    queryKey: ["support-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_contacts")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as SupportContact[];
    },
  });
}

export function useUpsertFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (faq: Partial<SupportFaq> & { question: string; answer: string }) => {
      if (faq.id) {
        const { error } = await supabase
          .from("support_faqs")
          .update({ question: faq.question, answer: faq.answer, sort_order: faq.sort_order })
          .eq("id", faq.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("support_faqs")
          .insert({ question: faq.question, answer: faq.answer, sort_order: faq.sort_order ?? 0 });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support-faqs"] }),
  });
}

export function useDeleteFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("support_faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support-faqs"] }),
  });
}

export function useUpsertContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contact: Partial<SupportContact> & { channel_type: string; title: string; url: string }) => {
      if (contact.id) {
        const { error } = await supabase
          .from("support_contacts")
          .update({ title: contact.title, description: contact.description, url: contact.url, channel_type: contact.channel_type })
          .eq("id", contact.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("support_contacts")
          .insert({ title: contact.title, description: contact.description ?? '', url: contact.url, channel_type: contact.channel_type, sort_order: contact.sort_order ?? 0 });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support-contacts"] }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("support_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support-contacts"] }),
  });
}
