import { useState, useRef, useCallback, useLayoutEffect, useEffect } from "react";
import { Loader2 } from "lucide-react";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface CropRect {
  x: number;  // natural px from left
  y: number;  // natural px from top
  w: number;  // natural px width
  h: number;  // natural px height
}

interface CropEditorProps {
  imageSrc: string;
  /** null = free crop (no ratio lock) */
  aspect: number | null;
  onChange: (crop: CropRect) => void;
}

// ─── Internal types ───────────────────────────────────────────────────────────

type HandleId = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "move";

interface Layout {
  imgX: number;  // image rendered left inside container
  imgY: number;  // image rendered top inside container
  imgW: number;  // image rendered width
  imgH: number;  // image rendered height
  natW: number;  // natural width
  natH: number;  // natural height
  cW: number;    // container width
  cH: number;    // container height
}

interface DragState {
  handle: HandleId;
  startCX: number;
  startCY: number;
  startCrop: CropRect;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTAINER_HEIGHT = 360;
const HS = 7;   // handle half-size in screen px
const MIN = 16; // minimum crop dimension in natural px

const CURSORS: Record<HandleId, string> = {
  nw: "nwse-resize", n: "ns-resize",  ne: "nesw-resize",
  e:  "ew-resize",   se: "nwse-resize", s: "ns-resize",
  sw: "nesw-resize", w: "ew-resize",  move: "move",
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function buildLayout(
  container: HTMLDivElement,
  img: HTMLImageElement
): Layout | null {
  const cW = container.clientWidth;
  const cH = container.clientHeight;
  if (!cW || !cH || !img.naturalWidth) return null;

  const nW = img.naturalWidth;
  const nH = img.naturalHeight;
  const imgAr = nW / nH;
  const contAr = cW / cH;

  let imgW: number, imgH: number, imgX: number, imgY: number;
  if (imgAr > contAr) {
    imgW = cW;        imgH = cW / imgAr;
    imgX = 0;         imgY = (cH - imgH) / 2;
  } else {
    imgH = cH;        imgW = cH * imgAr;
    imgX = (cW - imgW) / 2; imgY = 0;
  }
  return { imgX, imgY, imgW, imgH, natW: nW, natH: nH, cW, cH };
}

/** Map natural-pixel crop rect to SVG/screen coords */
function toScreen(c: CropRect, l: Layout) {
  const scX = l.imgW / l.natW;
  const scY = l.imgH / l.natH;
  return {
    x: l.imgX + c.x * scX,
    y: l.imgY + c.y * scY,
    w: c.w * scX,
    h: c.h * scY,
  };
}

/** Clamp crop to stay inside image bounds, respecting MIN */
function clampCrop(c: CropRect, l: Layout): CropRect {
  let { x, y, w, h } = c;
  w = Math.max(MIN, w);
  h = Math.max(MIN, h);
  x = Math.max(0, Math.min(l.natW - w, x));
  y = Math.max(0, Math.min(l.natH - h, y));
  w = Math.min(l.natW - x, w);
  h = Math.min(l.natH - y, h);
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}

/** Initial crop centred for a given aspect ratio, or full image if free */
function initialCrop(l: Layout, ar: number | null): CropRect {
  if (!ar) return { x: 0, y: 0, w: l.natW, h: l.natH };
  const natAr = l.natW / l.natH;
  if (ar > natAr) {
    const h = Math.round(l.natW / ar);
    return { x: 0, y: Math.round((l.natH - h) / 2), w: l.natW, h };
  } else {
    const w = Math.round(l.natH * ar);
    return { x: Math.round((l.natW - w) / 2), y: 0, w, h: l.natH };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CropEditor({ imageSrc, aspect, onChange }: CropEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);
  const dragRef      = useRef<DragState | null>(null);
  const onChangeRef  = useRef(onChange);
  onChangeRef.current = onChange;

  const [layout, setLayout] = useState<Layout | null>(null);
  const [crop,   setCrop]   = useState<CropRect | null>(null);
  const [loaded, setLoaded] = useState(false);

  // ── Layout computation ──────────────────────────────────────────────────────

  const recompute = useCallback(() => {
    const c = containerRef.current;
    const i = imgRef.current;
    if (!c || !i) return;
    const l = buildLayout(c, i);
    if (!l) return;
    setLayout(l);
    setCrop((prev) => {
      const next = prev ? clampCrop(prev, l) : initialCrop(l, aspect);
      onChangeRef.current(next);
      return next;
    });
  }, [aspect]);

  // Attach ResizeObserver once
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(recompute);
    ro.observe(container);
    return () => ro.disconnect();
  }, [recompute]);

  // Re-initialise crop when aspect changes
  useEffect(() => {
    if (!layout) return;
    const next = initialCrop(layout, aspect);
    setCrop(next);
    onChangeRef.current(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect]);

  function onImgLoad() {
    setLoaded(true);
    recompute();
  }

  // ── Drag handlers ───────────────────────────────────────────────────────────

  function startDrag(e: React.PointerEvent, handle: HandleId) {
    e.preventDefault();
    e.stopPropagation();
    if (!crop) return;
    dragRef.current = {
      handle,
      startCX: e.clientX,
      startCY: e.clientY,
      startCrop: { ...crop },
    };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current || !layout) return;
    const { handle, startCX, startCY, startCrop } = dragRef.current;

    // Scale mouse-delta from screen px → natural px
    const scX = layout.natW / layout.imgW;
    const scY = layout.natH / layout.imgH;
    const dX  = (e.clientX - startCX) * scX;
    const dY  = (e.clientY - startCY) * scY;

    let { x, y, w, h } = startCrop;

    switch (handle) {
      case "nw": x += dX; y += dY; w -= dX; h -= dY; break;
      case "n":             y += dY;          h -= dY; break;
      case "ne":   y += dY; w += dX; h -= dY; break;
      case "e":             w += dX;           break;
      case "se":   w += dX; h += dY;           break;
      case "s":             h += dY;           break;
      case "sw": x += dX; w -= dX; h += dY; break;
      case "w":  x += dX; w -= dX;           break;
      case "move": x += dX; y += dY;          break;
    }

    // Enforce aspect ratio on resize handles
    if (aspect && handle !== "move") {
      if (handle === "e" || handle === "w") {
        h = w / aspect;
      } else if (handle === "n" || handle === "s") {
        w = h * aspect;
      } else {
        // Corner: follow the larger delta
        if (Math.abs(dX) >= Math.abs(dY)) h = w / aspect;
        else                              w = h * aspect;
      }
    }

    const next = clampCrop({ x, y, w, h }, layout);
    setCrop(next);
    onChangeRef.current(next);
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const s = layout && crop ? toScreen(crop, layout) : null;
  const { cW = 500, cH = CONTAINER_HEIGHT } = layout ?? {};

  const handles: { id: HandleId; cx: number; cy: number }[] = s
    ? [
        { id: "nw", cx: s.x,           cy: s.y           },
        { id: "n",  cx: s.x + s.w / 2, cy: s.y           },
        { id: "ne", cx: s.x + s.w,     cy: s.y           },
        { id: "e",  cx: s.x + s.w,     cy: s.y + s.h / 2 },
        { id: "se", cx: s.x + s.w,     cy: s.y + s.h     },
        { id: "s",  cx: s.x + s.w / 2, cy: s.y + s.h     },
        { id: "sw", cx: s.x,           cy: s.y + s.h     },
        { id: "w",  cx: s.x,           cy: s.y + s.h / 2 },
      ]
    : [];

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black select-none overflow-hidden"
      style={{ height: CONTAINER_HEIGHT, touchAction: "none" }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Image */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt=""
        onLoad={onImgLoad}
        draggable={false}
        style={{
          position: "absolute",
          visibility: loaded ? "visible" : "hidden",
          ...(layout
            ? { left: layout.imgX, top: layout.imgY, width: layout.imgW, height: layout.imgH }
            : {}),
          objectFit: "fill",  // dimensions are exact — no letter-boxing here
          pointerEvents: "none",
        }}
      />

      {/* Loading spinner */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      )}

      {s && (
        <>
          {/* ── Decorative SVG (no pointer events) ── */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={cW}
            height={cH}
            overflow="visible"
          >
            {/* Dark mask with crop punch-hole */}
            <path
              fillRule="evenodd"
              fill="rgba(0,0,0,0.58)"
              d={`M0,0 H${cW} V${cH} H0 Z M${s.x},${s.y} H${s.x + s.w} V${s.y + s.h} H${s.x} Z`}
            />

            {/* Crop border */}
            <rect
              x={s.x} y={s.y} width={s.w} height={s.h}
              fill="none" stroke="white" strokeWidth={1.5}
            />

            {/* Rule of thirds */}
            {[1 / 3, 2 / 3].map((t) => (
              <g key={t}>
                <line
                  x1={s.x + s.w * t} y1={s.y}
                  x2={s.x + s.w * t} y2={s.y + s.h}
                  stroke="rgba(255,255,255,0.28)" strokeWidth={0.8}
                />
                <line
                  x1={s.x}      y1={s.y + s.h * t}
                  x2={s.x + s.w} y2={s.y + s.h * t}
                  stroke="rgba(255,255,255,0.28)" strokeWidth={0.8}
                />
              </g>
            ))}

            {/* Corner accent lines */}
            {[
              [s.x, s.y, s.x + 18, s.y],
              [s.x, s.y, s.x, s.y + 18],
              [s.x + s.w, s.y, s.x + s.w - 18, s.y],
              [s.x + s.w, s.y, s.x + s.w, s.y + 18],
              [s.x, s.y + s.h, s.x + 18, s.y + s.h],
              [s.x, s.y + s.h, s.x, s.y + s.h - 18],
              [s.x + s.w, s.y + s.h, s.x + s.w - 18, s.y + s.h],
              [s.x + s.w, s.y + s.h, s.x + s.w, s.y + s.h - 18],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="white" strokeWidth={2.5} strokeLinecap="round"
              />
            ))}
          </svg>

          {/* ── Interactive SVG (pointer events ON) ── */}
          <svg
            className="absolute inset-0"
            width={cW}
            height={cH}
            overflow="visible"
            style={{ touchAction: "none" }}
          >
            {/* Move target — interior of crop area */}
            <rect
              x={s.x + HS} y={s.y + HS}
              width={Math.max(0, s.w - HS * 2)}
              height={Math.max(0, s.h - HS * 2)}
              fill="transparent"
              style={{ cursor: CURSORS.move }}
              onPointerDown={(e) => startDrag(e, "move")}
            />

            {/* 8 resize handles */}
            {handles.map(({ id, cx, cy }) => (
              <rect
                key={id}
                x={cx - HS} y={cy - HS}
                width={HS * 2} height={HS * 2}
                fill="white"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth={1}
                rx={2}
                style={{ cursor: CURSORS[id] }}
                onPointerDown={(e) => startDrag(e, id)}
              />
            ))}
          </svg>
        </>
      )}

      {/* Pixel-dimensions badge */}
      {crop && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-[11px] font-mono pointer-events-none whitespace-nowrap tabular-nums">
          {crop.w} × {crop.h} px
        </div>
      )}
    </div>
  );
}
