import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon, Upload, X, Crop, Check, Trash2, Link2,
  RectangleHorizontal, Square, RectangleVertical,
  Loader2, Info, Maximize2,
} from "lucide-react";
import { CropEditor, CropRect } from "./CropEditor";
import { getCroppedImg, readFileAsDataURL } from "@/lib/image-utils";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/lib/storage-utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ─── Preset types ──────────────────────────────────────────────────────────────

export interface AspectPreset {
  label: string;
  /** null = free crop */
  value: number | null;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  /** Pixel hint shown in the info banner, e.g. "1920×1080" */
  pixelHint?: string;
}

/** Default generic presets (hero, gallery, logo…) */
const GENERIC_PRESETS: AspectPreset[] = [
  { label: "Livre",  value: null,    icon: Maximize2,          description: "Sem proporção fixa" },
  { label: "16:9",   value: 16 / 9,  icon: RectangleHorizontal, description: "Widescreen",  pixelHint: "1920×1080" },
  { label: "4:3",    value: 4 / 3,   icon: RectangleHorizontal, description: "Paisagem",    pixelHint: "1200×900"  },
  { label: "1:1",    value: 1,        icon: Square,              description: "Quadrado",    pixelHint: "1080×1080" },
  { label: "3:4",    value: 3 / 4,   icon: RectangleVertical,   description: "Retrato",     pixelHint: "900×1200"  },
];

/** Build a single preset locked to the button's exact dimensions */
export function buildButtonPresets(buttonHeight: number): AspectPreset[] {
  const containerWidth = 348;
  const ratio = containerWidth / buttonHeight;
  return [
    {
      label: "Botão",
      value: ratio,
      icon: RectangleHorizontal,
      description: "Tamanho exato do botão",
      pixelHint: `${containerWidth}×${buttonHeight}`,
    },
  ];
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: number | null;
  label?: string;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  allowOriginal?: boolean;
  /** Custom presets. When omitted, uses GENERIC_PRESETS. */
  presets?: AspectPreset[];
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ImageUploader({
  value,
  onChange,
  aspectRatio = 16 / 9,
  label = "Imagem",
  className = "",
  compact = false,
  allowOriginal = true,
  presets,
}: ImageUploaderProps): JSX.Element {
  const activePresets = presets ?? GENERIC_PRESETS;

  type Mode = "idle" | "choosing" | "cropping" | "preview";
  const [mode,           setMode]           = useState<Mode>("idle");
  const [rawImage,       setRawImage]       = useState<string | null>(null);
  const [rawFile,        setRawFile]        = useState<File | null>(null);
  const [cropRect,       setCropRect]       = useState<CropRect | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [selectedAspect, setSelectedAspect] = useState<number | null>(aspectRatio ?? null);
  const [urlMode,        setUrlMode]        = useState(false);
  const [urlInput,       setUrlInput]       = useState("");
  const [uploading,      setUploading]      = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user }  = useAuth();

  const currentPreset = activePresets.find((p) => p.value === selectedAspect);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ── Upload & save ───────────────────────────────────────────────────────────

  const uploadAndSave = useCallback(async (dataUrl: string): Promise<boolean> => {
    if (user) {
      try {
        const publicUrl = await uploadImage(dataUrl, user.id, "links", value || undefined);
        onChange(publicUrl);
        return true;
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Erro no upload da imagem. Tente novamente.");
        return false;
      }
    } else {
      onChange(dataUrl);
      return true;
    }
  }, [user, onChange, value]);

  // ── File intake ─────────────────────────────────────────────────────────────

  const handleFileReady = useCallback(async (file: File) => {
    const accepted = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!accepted.includes(file.type)) {
      toast.error("Formato não suportado. Use PNG, JPG ou WebP.");
      return;
    }
    const dataUrl = await readFileAsDataURL(file);

    // Compact mode: skip the modal and upload directly (simpler UX)
    if (compact) {
      setUploading(true);
      try {
        await uploadAndSave(dataUrl);
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
      return;
    }

    setRawImage(dataUrl);
    setRawFile(file);
    setCropRect(null);
    setSelectedAspect(aspectRatio ?? null);
    setMode(allowOriginal ? "choosing" : "cropping");
  }, [aspectRatio, allowOriginal, compact, uploadAndSave]);

  const onFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileReady(file);
    if (inputRef.current) inputRef.current.value = "";
  }, [handleFileReady]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    await handleFileReady(file);
  }, [handleFileReady]);

  // ── Use original ────────────────────────────────────────────────────────────

  const handleUseOriginal = useCallback(async () => {
    if (!rawImage) return;
    try {
      setUploading(true);
      const success = await uploadAndSave(rawImage);
      if (success) closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }, [rawImage, uploadAndSave]);

  // ── Confirm crop → preview ──────────────────────────────────────────────────

  const handleConfirmCrop = useCallback(async () => {
    if (!rawImage || !cropRect) return;
    try {
      setUploading(true);
      const cropped = await getCroppedImg(rawImage, {
        x: cropRect.x,
        y: cropRect.y,
        width:  cropRect.w,
        height: cropRect.h,
      });
      setCroppedPreview(cropped);
      setMode("preview");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao recortar imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }, [rawImage, cropRect]);

  // ── Save cropped ────────────────────────────────────────────────────────────

  const handleSaveCropped = useCallback(async () => {
    if (!croppedPreview) return;
    try {
      setUploading(true);
      const success = await uploadAndSave(croppedPreview);
      if (success) closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }, [croppedPreview, uploadAndSave]);

  // ── URL mode ────────────────────────────────────────────────────────────────

  const handleUrlSubmit = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith("https://") && !url.startsWith("http://")) {
      toast.error("Use uma URL válida começando com https://");
      return;
    }
    onChange(url);
    setUrlInput("");
    setUrlMode(false);
  };

  // ── Reset ───────────────────────────────────────────────────────────────────

  const closeModal = () => {
    setMode("idle");
    setRawImage(null);
    setRawFile(null);
    setCropRect(null);
    setCroppedPreview(null);
  };

  const handleRemove = () => {
    onChange("");
    closeModal();
  };

  const handleAspectChange = (v: number | null) => {
    setSelectedAspect(v);
  };

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className={className}>
      {/* Label row */}
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            {label}
          </label>
          <button
            type="button"
            onClick={() => setUrlMode(!urlMode)}
            className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
          >
            <Link2 className="h-2.5 w-2.5" />
            {urlMode ? "Upload" : "URL"}
          </button>
        </div>
      )}

      {/* URL mode */}
      {urlMode && (
        <div className="flex gap-1.5 mb-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            className="text-xs h-8 font-mono flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
          />
          <button
            onClick={handleUrlSubmit}
            className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 shrink-0"
          >
            OK
          </button>
        </div>
      )}

      {/* Upload zone / preview */}
      {!urlMode && (
        <>
          {value ? (
            <div
              className={`relative group rounded-xl overflow-hidden border border-border/50 ${compact ? "flex items-center gap-3" : ""}`}
              style={
                !compact
                  ? {
                      backgroundImage:
                        "linear-gradient(45deg,hsl(var(--muted)) 25%,transparent 25%),linear-gradient(-45deg,hsl(var(--muted)) 25%,transparent 25%),linear-gradient(45deg,transparent 75%,hsl(var(--muted)) 75%),linear-gradient(-45deg,transparent 75%,hsl(var(--muted)) 75%)",
                      backgroundSize: "16px 16px",
                      backgroundPosition: "0 0,0 8px,8px -8px,-8px 0px",
                    }
                  : undefined
              }
            >
              <img
                src={value}
                alt="Preview"
                className={
                  compact
                    ? "w-16 h-16 object-cover rounded-lg shrink-0"
                    : "w-full object-contain max-h-48"
                }
              />
              {compact ? (
                <div className="flex-1 flex items-center gap-2 pr-2">
                  <span className="text-[10px] text-muted-foreground truncate flex-1">
                    Imagem adicionada
                  </span>
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="Trocar"
                  >
                    <Upload className="h-3 w-3" />
                  </button>
                  <button
                    onClick={handleRemove}
                    className="p-1.5 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setRawImage(value);
                      setCropRect(null);
                      setSelectedAspect(aspectRatio ?? null);
                      setMode("cropping");
                    }}
                    className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                    title="Editar/Recortar"
                  >
                    <Crop className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                    title="Trocar imagem"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleRemove}
                    className="p-2 rounded-xl bg-destructive/50 backdrop-blur-sm text-white hover:bg-destructive/70 transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => !uploading && inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`flex ${compact ? "flex-row items-center gap-3 p-3" : "flex-col items-center justify-center gap-2 p-6"} rounded-xl border-2 border-dashed border-border/60 bg-secondary/20 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group ${uploading ? "pointer-events-none opacity-70" : ""}`}
            >
              <div className={`${compact ? "p-2 rounded-xl" : "p-3 rounded-2xl"} bg-primary/10 text-primary group-hover:scale-110 transition-transform`}>
                {uploading
                  ? <Loader2 className={compact ? "h-4 w-4 animate-spin" : "h-5 w-5 animate-spin"} />
                  : <Upload   className={compact ? "h-4 w-4" : "h-5 w-5"} />
                }
              </div>
              <div className={compact ? "" : "text-center"}>
                <p className={`${compact ? "text-[11px]" : "text-xs"} font-medium text-foreground`}>
                  {uploading ? "Enviando…" : "Clique ou arraste"}
                </p>
                {rawFile && !uploading ? (
                  <p className="text-[10px] text-primary mt-0.5 font-medium">
                    {formatFileSize(rawFile.size)} — será comprimida
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WebP</p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={onFileSelect}
        className="hidden"
      />

      {/* ── Choosing modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mode === "choosing" && rawImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              className="w-full max-w-md bg-card rounded-2xl overflow-hidden shadow-2xl border border-border/50"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Como usar esta imagem?</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Escolha como aplicar</p>
                </div>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-5 py-4">
                <div className="rounded-xl overflow-hidden border border-border/30 bg-secondary/20 flex items-center justify-center" style={{ maxHeight: 200 }}>
                  <img src={rawImage} alt="Preview" className="max-w-full max-h-[200px] object-contain" />
                </div>
              </div>

              <div className="px-5 pb-5 space-y-2">
                <button
                  onClick={handleUseOriginal}
                  disabled={uploading}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border/50 bg-secondary/20 hover:border-primary/50 hover:bg-primary/5 transition-all group text-left disabled:opacity-50"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform shrink-0">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Usar original</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Manter a imagem completa, sem corte</p>
                  </div>
                </button>

                <button
                  onClick={() => setMode("cropping")}
                  disabled={uploading}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border/50 bg-secondary/20 hover:border-primary/50 hover:bg-primary/5 transition-all group text-left disabled:opacity-50"
                >
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform shrink-0">
                    <Crop className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Recortar e ajustar</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Arraste os handles para definir o enquadramento</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Crop modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mode === "cropping" && rawImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-lg bg-card rounded-2xl overflow-hidden shadow-2xl border border-border/50"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <Crop className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Recortar Imagem</span>
                </div>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Pixel hint */}
              {currentPreset?.pixelHint && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b border-border/30">
                  <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                  <p className="text-[11px] text-muted-foreground">
                    Tamanho ideal:{" "}
                    <span className="font-bold text-foreground font-mono">{currentPreset.pixelHint}px</span>
                    <span className="ml-1.5 opacity-70">— Use no Canva ou editor</span>
                  </p>
                </div>
              )}

              {/* Preset tabs — only when more than 1 option */}
              {activePresets.length > 1 && (
                <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-b border-border/30 bg-secondary/20">
                  {activePresets.map((preset) => {
                    const active = selectedAspect === preset.value;
                    return (
                      <button
                        key={preset.label}
                        onClick={() => handleAspectChange(preset.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/40"
                        }`}
                        title={preset.description + (preset.pixelHint ? ` (${preset.pixelHint})` : "")}
                      >
                        <preset.icon className="h-3 w-3" />
                        <span>{preset.label}</span>
                        {preset.pixelHint && active && (
                          <span className="text-[9px] opacity-80 font-mono">{preset.pixelHint}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Crop editor */}
              <CropEditor
                imageSrc={rawImage}
                aspect={selectedAspect}
                onChange={setCropRect}
              />

              {/* Actions */}
              <div className="p-4 border-t border-border/50 flex gap-2">
                {allowOriginal && (
                  <button
                    onClick={() => setMode("choosing")}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 transition-colors"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    Original
                  </button>
                )}
                <button
                  onClick={handleConfirmCrop}
                  disabled={uploading || !cropRect}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {uploading
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processando…</>
                    : <><Crop className="h-3.5 w-3.5" /> Ver Preview</>
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Preview / confirm modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {mode === "preview" && croppedPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              className="w-full max-w-md bg-card rounded-2xl overflow-hidden shadow-2xl border border-border/50"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Preview do Recorte</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Confirme antes de salvar</p>
                </div>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-5 py-4">
                <div
                  className="rounded-xl overflow-hidden border border-border/30 bg-secondary/20 flex items-center justify-center"
                  style={{ minHeight: 200 }}
                >
                  <img src={croppedPreview} alt="Crop preview" className="max-w-full object-contain rounded-lg" />
                </div>
              </div>

              <div className="px-5 pb-5 flex gap-2">
                <button
                  onClick={() => setMode("cropping")}
                  disabled={uploading}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 transition-colors disabled:opacity-50"
                >
                  <Crop className="h-3.5 w-3.5" />
                  Ajustar
                </button>
                <button
                  onClick={handleSaveCropped}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {uploading
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enviando…</>
                    : <><Check className="h-3.5 w-3.5" /> Salvar Imagem</>
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
