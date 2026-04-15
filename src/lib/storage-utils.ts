import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

const BUCKET = "link-images";

async function compressImage(
  dataUrl: string,
  maxWidth = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));
      ctx.drawImage(img, 0, 0, width, height);
      const supportsWebP = canvas.toDataURL("image/webp").startsWith("data:image/webp");
      const format = supportsWebP ? "image/webp" : "image/jpeg";
      resolve(canvas.toDataURL(format, quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Convert a base64 data URL to a Blob without using fetch().
 * fetch(dataUrl) is unreliable on iOS/Safari and some mobile browsers.
 * atob() is universally supported.
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

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

  if (!dataUrl.startsWith("data:")) {
    throw new Error("Formato de imagem inválido. Selecione um arquivo PNG, JPG ou WebP.");
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
      logger.warn("[storage] Failed to delete old image:", err);
      // Continue upload even if delete fails
    }
  }

  // Comprimir antes de converter para blob
  if (dataUrl.startsWith("data:")) {
    dataUrl = await compressImage(dataUrl, 1200, 0.82);
  }

  // Convert data URL to blob — uses atob, not fetch(), for iOS/Safari compatibility
  const blob = dataUrlToBlob(dataUrl);

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
