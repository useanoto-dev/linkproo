/**
 * Creates an image element from a source URL/data URI
 */
export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    // Only set crossOrigin for http/https URLs — blob: and data: URLs don't need it
    // and setting it on blob URLs causes CORS failures in some browsers.
    if (url.startsWith("http://") || url.startsWith("https://")) {
      image.setAttribute("crossOrigin", "anonymous");
    }
    image.src = url;
  });
}

/**
 * Detects the image format from a data URL or defaults to png for transparency support
 */
export function detectImageFormat(dataUrl: string): "image/png" | "image/jpeg" | "image/webp" {
  if (dataUrl.startsWith("data:image/png")) return "image/png";
  if (dataUrl.startsWith("data:image/webp")) return "image/webp";
  if (dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")) return "image/jpeg";
  // Default to PNG to preserve transparency
  return "image/png";
}

/**
 * Returns a cropped canvas from the source image.
 * Automatically detects format to preserve transparency for PNG/WebP.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  outputFormat?: "image/jpeg" | "image/png" | "image/webp",
  quality = 0.85
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No 2d context");

  // Limit max output dimensions to prevent huge base64 strings
  const MAX_DIM = 2400;
  let outW = pixelCrop.width;
  let outH = pixelCrop.height;
  if (outW > MAX_DIM || outH > MAX_DIM) {
    const scale = MAX_DIM / Math.max(outW, outH);
    outW = Math.round(outW * scale);
    outH = Math.round(outH * scale);
  }

  canvas.width = outW;
  canvas.height = outH;

  const format = outputFormat || detectImageFormat(imageSrc);
  
  if (format === "image/jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outW,
    outH
  );

  return canvas.toDataURL(format, quality);
}

/**
 * Reads a file and returns a data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result as string));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}
