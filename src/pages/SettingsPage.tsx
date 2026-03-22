import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { User, Building2, Save, Loader2, Camera } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/storage-utils";
import { useQueryClient } from "@tanstack/react-query";

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    display_name: "",
    avatar_url: "",
    company: "",
  });

  // Load profile from Supabase
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, company")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        setProfile({
          display_name: data.display_name || "",
          avatar_url: data.avatar_url || "",
          company: data.company || "",
        });
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const update = (key: string, value: string) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const accepted = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!accepted.includes(file.type)) {
      toast.error("Use PNG, JPG ou WebP");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const url = await uploadImage(dataUrl, user.id, "avatars");
      update("avatar_url", url);
      toast.success("Avatar atualizado!");
    } catch {
      toast.error("Erro ao enviar avatar");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        company: profile.company,
      })
      .eq("user_id", user.id);
    setSaving(false);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      await supabase.auth.updateUser({
        data: { display_name: profile.display_name },
      });
      // Refresh sidebar profile data immediately
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil salvo com sucesso! 🎉");
    }
  };

  const initials = profile.display_name
    ? profile.display_name.charAt(0).toUpperCase()
    : (user?.email?.charAt(0) || "?").toUpperCase();

  return (
    <DashboardLayout title="Configurações">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Perfil</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="h-16 w-16 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-border">
                      <span className="text-xl font-bold text-primary">{initials}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    {uploading ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{profile.display_name || "Sem nome"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  <Input
                    value={profile.display_name}
                    onChange={(e) => update("display_name", e.target.value)}
                    className="h-9 text-sm"
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">E-mail</Label>
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="h-9 text-sm opacity-60"
                  />
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Company */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Empresa</h2>
          </div>
          {loading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nome da Empresa</Label>
              <Input
                value={profile.company}
                onChange={(e) => update("company", e.target.value)}
                className="h-9 text-sm"
                placeholder="Sua empresa"
              />
            </div>
          )}
        </motion.div>

        {/* Save */}
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onClick={handleSave}
          disabled={saving || loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 cursor-pointer select-none disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Salvando..." : "Salvar Perfil"}
        </motion.button>
      </div>
    </DashboardLayout>
  );
}
