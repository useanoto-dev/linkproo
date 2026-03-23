import { supabase } from "@/integrations/supabase/client";

const BUCKET = "link-images";

/**
 * Upload an image (base64 data URL or blob) to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadImage(
  dataUrl: string,
  userId: string,
  folder: string = "general",
  oldUrl?: string  // URL pública da imagem antiga para deletar
): Promise<string> {
  // If it's already a remote URL (not base64), return as-is
  if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
    return dataUrl;
  }

  // Deletar imagem antiga do Storage (se pertencer a este bucket)
  if (oldUrl && oldUrl.includes("/storage/v1/object/public/link-images/")) {
    try {
      // Extrai o path após o bucket name
      const pathMatch = oldUrl.match(/\/link-images\/(.+)$/);
      if (pathMatch?.[1]) {
        await supabase.storage.from(BUCKET).remove([decodeURIComponent(pathMatch[1])]);
      }
    } catch (err) {
      console.warn("[storage] Failed to delete old image:", err);
      // Continue upload even if delete fails
    }
  }

  // Convert data URL to blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();

  // Validate file size
  if (blob.size > MAX_FILE_SIZE) {
    throw new Error("Imagem muito grande. Tamanho máximo: 5MB");
  }

  // Determine extension from mime type
  const mimeToExt: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
  };
  const ext = mimeToExt[blob.type] || "png";
  const fileName = `${userId}/${folder}/${Date.now()}.${ext}`;

  // Retry upload up to 3 times on transient failures
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 800));
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, blob, {
        contentType: blob.type,
        upsert: true,
      });
    if (!error) {
      // success — get public URL and return
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName);
      return urlData.publicUrl;
    }
    lastError = error;
  }
  throw lastError;
}
