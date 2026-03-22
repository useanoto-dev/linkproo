// Centralized background color extraction utility
export function extractBgColor(bg: string): string {
  if (bg.startsWith("custom:")) return bg.split(":")[2];
  const colorMap: Record<string, string> = {
    "from-gray-50 to-white": "#ffffff",
    "from-orange-50 to-amber-50": "#fffbeb",
    "from-blue-50 to-sky-100": "#e0f2fe",
    "from-green-50 to-emerald-50": "#ecfdf5",
    "from-pink-50 to-rose-100": "#ffe4e6",
    "from-violet-50 to-purple-100": "#f3e8ff",
    "from-slate-950 to-slate-900": "#0f172a",
    "from-slate-950 to-gray-900": "#111827",
    "from-blue-950 to-indigo-950": "#1e1b4b",
    "from-blue-950 to-cyan-950": "#083344",
    "from-green-950 to-emerald-950": "#022c22",
    "from-rose-950 to-red-950": "#4c0519",
    "from-rose-950 to-pink-950": "#831843",
    "from-purple-950 to-indigo-950": "#2e1065",
    "from-purple-950 to-violet-950": "#2e1065",
    "from-red-950 to-orange-950": "#431407",
    "from-amber-950 to-red-950": "#450a0a",
    "from-pink-950 to-rose-950": "#500724",
    "from-sky-950 to-blue-950": "#082f49",
    "from-cyan-950 to-teal-950": "#042f2e",
    "from-emerald-950 to-green-950": "#052e16",
  };
  return colorMap[bg] || "#000000";
}

export function getCustomBgGradient(bg: string): string | undefined {
  if (!bg.startsWith("custom:")) return undefined;
  const p = bg.split(":");
  return `linear-gradient(180deg, ${p[1]}, ${p[2]})`;
}

export const COLOR_PRESETS = [
  { label: "Branco", value: "from-gray-50 to-white" },
  { label: "Laranja suave", value: "from-orange-50 to-amber-50" },
  { label: "Azul suave", value: "from-blue-50 to-sky-100" },
  { label: "Verde suave", value: "from-green-50 to-emerald-50" },
  { label: "Rosa suave", value: "from-pink-50 to-rose-100" },
  { label: "Violeta suave", value: "from-violet-50 to-purple-100" },
  { label: "Slate escuro", value: "from-slate-950 to-slate-900" },
  { label: "Cinza escuro", value: "from-slate-950 to-gray-900" },
  { label: "Azul escuro", value: "from-blue-950 to-indigo-950" },
  { label: "Ciano escuro", value: "from-blue-950 to-cyan-950" },
  { label: "Verde escuro", value: "from-green-950 to-emerald-950" },
  { label: "Rose escuro", value: "from-rose-950 to-red-950" },
  { label: "Roxo escuro", value: "from-purple-950 to-indigo-950" },
  { label: "Vermelho escuro", value: "from-red-950 to-orange-950" },
];
