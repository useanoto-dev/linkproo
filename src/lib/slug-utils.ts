import { supabase } from "@/integrations/supabase/client";

// Slugs reservados pelo sistema — nunca podem ser usados por usuários
const RESERVED_SLUGS = new Set([
  // Rotas do sistema
  'admin', 'auth', 'api', 'dashboard', 'links', 'settings',
  'analytics', 'plans', 'suporte', 'support', 'reset-password',
  'login', 'signup', 'register', 'logout', 'profile', 'billing',
  'pricing', 'help', 'docs', 'blog', 'about', 'contact',
  'terms', 'privacy', 'status',
  // Domínios/subdomínios comuns
  'app', 'www', 'mail', 'ftp', 'smtp', 'pop', 'imap',
  // Arquivos estáticos
  'static', 'assets', 'public', 'favicon', 'robots', 'sitemap',
  // Palavras reservadas web
  'null', 'undefined', 'true', 'false',
]);

// Validate slug format and reserved words
export function validateSlug(slug: string): string | null {
  if (!slug) return "O endereço é obrigatório";
  if (slug.length < 3) return "Mínimo 3 caracteres";
  if (slug.length > 50) return "Máximo 50 caracteres";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "Use apenas letras minúsculas, números e hífens";
  }
  if (RESERVED_SLUGS.has(slug)) {
    return "Este endereço está reservado pelo sistema";
  }
  return null;
}

// Normalize slug: lowercase, replace spaces/special chars with hyphens
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

// Check if slug is already taken (exclude current link id).
// Reserved slugs are rejected before any DB query (fail fast).
export async function checkSlugAvailability(slug: string, excludeId?: string): Promise<boolean> {
  if (RESERVED_SLUGS.has(slug)) return false;
  let query = supabase.from("links").select("id", { count: "exact", head: true }).eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);
  const { count } = await query;
  return (count ?? 0) === 0;
}
