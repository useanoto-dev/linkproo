import { ReactNode, memo, useMemo, useCallback, CSSProperties } from "react";

export type DeviceType = "iphone15" | "pixel8" | "galaxy";

export const DEVICE_LABELS: Record<DeviceType, string> = {
  iphone15: "iPhone 15",
  pixel8: "Pixel 8",
  galaxy: "Galaxy S24",
};

interface DeviceSpec {
  screenW: number;
  screenH: number;
  frameColor: string;
  frameHighlight: string;
  frameShadow: string;
  frameBorder: number;
  frameRadius: number;
  screenRadius: number;
  notch: "dynamic-island" | "punch-hole" | "none";
  homeBar: boolean;
  leftButtons: Array<{ top: number; h: number }>;
  rightButtons: Array<{ top: number; h: number }>;
  buttonW: number;
}

const SPECS: Record<DeviceType, DeviceSpec> = {
  iphone15: {
    screenW: 320,
    screenH: 640,
    frameColor: "#2C2C2E",
    frameHighlight: "rgba(255,255,255,0.16)",
    frameShadow: "rgba(0,0,0,0.65)",
    frameBorder: 10,
    frameRadius: 50,
    screenRadius: 42,
    notch: "dynamic-island",
    homeBar: true,
    leftButtons: [
      { top: 68,  h: 8  }, // silent switch
      { top: 96,  h: 24 }, // vol up
      { top: 128, h: 24 }, // vol down
    ],
    rightButtons: [
      { top: 96, h: 36 }, // power / side button
    ],
    buttonW: 4,
  },
  pixel8: {
    screenW: 308,
    screenH: 640,
    frameColor: "#1E1E1E",
    frameHighlight: "rgba(255,255,255,0.10)",
    frameShadow: "rgba(0,0,0,0.75)",
    frameBorder: 8,
    frameRadius: 40,
    screenRadius: 34,
    notch: "punch-hole",
    homeBar: false,
    leftButtons: [],
    rightButtons: [
      { top: 92,  h: 24 }, // power
      { top: 126, h: 32 }, // volume
    ],
    buttonW: 4,
  },
  galaxy: {
    screenW: 312,
    screenH: 640,
    frameColor: "#0D0D0D",
    frameHighlight: "rgba(255,255,255,0.08)",
    frameShadow: "rgba(0,0,0,0.85)",
    frameBorder: 6,
    frameRadius: 46,
    screenRadius: 42,
    notch: "punch-hole",
    homeBar: false,
    leftButtons: [],
    rightButtons: [
      { top: 96,  h: 22 }, // power
      { top: 128, h: 18 }, // bixby
      { top: 156, h: 30 }, // volume
    ],
    buttonW: 3,
  },
};

// How many px the side buttons protrude past the frame edge
const BTN_OVERHANG = 6;

interface DeviceFrameProps {
  device: DeviceType;
  children: ReactNode;
}

export const DeviceFrame = memo(function DeviceFrame({ device, children }: DeviceFrameProps) {
  const { s, frameW, frameH, containerW } = useMemo(() => {
    const spec = SPECS[device];
    return {
      s: spec,
      frameW: spec.screenW + spec.frameBorder * 2,
      frameH: spec.screenH + spec.frameBorder * 2,
      containerW: spec.screenW + spec.frameBorder * 2 + BTN_OVERHANG * 2,
    };
  }, [device]);

  const buttonBaseStyle = useCallback((side: "left" | "right", btn: { top: number; h: number }): CSSProperties => ({
    position: "absolute",
    [side]: 0,
    top: btn.top + s.frameBorder,
    width: BTN_OVERHANG + 2,
    height: btn.h,
    background:
      side === "left"
        ? `linear-gradient(to right, ${s.frameShadow}, ${s.frameColor})`
        : `linear-gradient(to left, ${s.frameShadow}, ${s.frameColor})`,
    borderRadius: side === "left" ? "3px 0 0 3px" : "0 3px 3px 0",
    boxShadow: `inset 0 1px 0 ${s.frameHighlight}`,
  }), [s]);

  const containerStyle = useMemo<CSSProperties>(
    () => ({ position: "relative", width: containerW, height: frameH, flexShrink: 0 }),
    [containerW, frameH]
  );

  const frameBodyStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      left: BTN_OVERHANG,
      top: 0,
      width: frameW,
      height: frameH,
      background: s.frameColor,
      borderRadius: s.frameRadius,
      boxShadow: [
        `0 0 0 1px rgba(0,0,0,0.55)`,
        `inset 0 0 0 1px ${s.frameHighlight}`,
        `0 32px 64px rgba(0,0,0,0.55)`,
        `0 12px 24px rgba(0,0,0,0.35)`,
      ].join(", "),
    }),
    [frameW, frameH, s.frameColor, s.frameRadius, s.frameHighlight]
  );

  const screenStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      inset: s.frameBorder,
      background: "#050505",
      borderRadius: s.screenRadius,
      overflow: "hidden",
    }),
    [s.frameBorder, s.screenRadius]
  );

  return (
    <div style={containerStyle}>
      {/* ── Left side buttons ── */}
      {s.leftButtons.map((btn, i) => (
        <div key={`lb${i}`} style={buttonBaseStyle("left", btn)} />
      ))}

      {/* ── Right side buttons ── */}
      {s.rightButtons.map((btn, i) => (
        <div key={`rb${i}`} style={buttonBaseStyle("right", btn)} />
      ))}

      {/* ── Main frame body ── */}
      <div style={frameBodyStyle}>
        {/* Chamfer highlight — gives the frame depth */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: s.frameRadius,
            background: `linear-gradient(155deg, ${s.frameHighlight} 0%, transparent 38%)`,
            pointerEvents: "none",
          }}
        />

        {/* ── Screen ── */}
        <div style={screenStyle}>
          {/* Dynamic Island (iPhone 15) */}
          {s.notch === "dynamic-island" && (
            <div
              style={{
                position: "absolute",
                top: 10,
                left: "50%",
                transform: "translateX(-50%)",
                width: 112,
                height: 30,
                background: "#000",
                borderRadius: 30,
                zIndex: 20,
                boxShadow: "0 0 0 1px #1a1a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 14,
              }}
            >
              {/* Front camera lens inside Dynamic Island */}
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#0c0c0c",
                  boxShadow: "0 0 0 1px #222, inset 0 0 4px rgba(100,140,255,0.15)",
                }}
              />
            </div>
          )}

          {/* Punch-hole camera (Pixel / Galaxy) */}
          {s.notch === "punch-hole" && (
            <div
              style={{
                position: "absolute",
                top: 14,
                left: "50%",
                transform: "translateX(-50%)",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#000",
                zIndex: 20,
                boxShadow: "0 0 0 1px #1a1a1a, inset 0 0 3px rgba(100,140,255,0.08)",
              }}
            />
          )}

          {/* Scrollable content */}
          <div
            style={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden" }}
            className="custom-scroll"
          >
            {children}
          </div>

          {/* Home indicator bar (iPhone gesture area) */}
          {s.homeBar && (
            <div
              style={{
                position: "absolute",
                bottom: 7,
                left: "50%",
                transform: "translateX(-50%)",
                width: 100,
                height: 4,
                background: "rgba(255,255,255,0.28)",
                borderRadius: 2,
                zIndex: 20,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Subtle screen reflection sheen */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(255,255,255,0.035) 0%, transparent 55%)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          />
        </div>
      </div>
    </div>
  );
});
