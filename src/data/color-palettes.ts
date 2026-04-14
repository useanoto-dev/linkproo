/**
 * Curated color palettes for LinkPro templates.
 * Each palette is a complete visual identity — not just an accent color.
 * Use with backgroundColor: "custom:HEX" format in templates.
 */

export interface ColorPalette {
  id: string;
  name: string;
  nameEn: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  border: string;
  mood: 'warm' | 'cool' | 'neutral' | 'bold' | 'soft' | 'dark';
  preview: [string, string, string]; // 3 colors for thumbnail preview
}

export const palettes: ColorPalette[] = [
  {
    id: 'terracotta',
    name: 'Terracotta',
    nameEn: 'Terracotta',
    background: '#FAF7F2',
    surface: '#F2EDE4',
    text: '#2C2418',
    textMuted: '#8C7E6A',
    accent: '#C45D3E',
    accentHover: '#A84B2F',
    border: '#E8E0D2',
    mood: 'warm',
    preview: ['#FAF7F2', '#C45D3E', '#2C2418'],
  },
  {
    id: 'midnight',
    name: 'Meia-Noite',
    nameEn: 'Midnight',
    background: '#0B0F1A',
    surface: '#141927',
    text: '#E8E6E1',
    textMuted: '#7A7B82',
    accent: '#6366F1',
    accentHover: '#4F46E5',
    border: '#1E2538',
    mood: 'dark',
    preview: ['#0B0F1A', '#6366F1', '#E8E6E1'],
  },
  {
    id: 'cream',
    name: 'Creme & Sálvia',
    nameEn: 'Cream & Sage',
    background: '#FEFCF6',
    surface: '#F5F0E3',
    text: '#1A1A18',
    textMuted: '#6B6960',
    accent: '#5B7C5E',
    accentHover: '#4A6A4D',
    border: '#E5DFD0',
    mood: 'soft',
    preview: ['#FEFCF6', '#5B7C5E', '#1A1A18'],
  },
  {
    id: 'noir',
    name: 'Noir',
    nameEn: 'Noir',
    background: '#0A0A0A',
    surface: '#161616',
    text: '#FAFAFA',
    textMuted: '#737373',
    accent: '#FAFAFA',
    accentHover: '#D4D4D4',
    border: '#262626',
    mood: 'dark',
    preview: ['#0A0A0A', '#FAFAFA', '#737373'],
  },
  {
    id: 'ocean',
    name: 'Oceano',
    nameEn: 'Ocean',
    background: '#F0F7FA',
    surface: '#E3EFF5',
    text: '#0C2D3E',
    textMuted: '#5A7B8F',
    accent: '#0891B2',
    accentHover: '#0E7490',
    border: '#C9DDE6',
    mood: 'cool',
    preview: ['#F0F7FA', '#0891B2', '#0C2D3E'],
  },
  {
    id: 'blush',
    name: 'Rosé',
    nameEn: 'Blush',
    background: '#FDF2F5',
    surface: '#FAE8ED',
    text: '#2D1318',
    textMuted: '#9E6B78',
    accent: '#DB2777',
    accentHover: '#BE185D',
    border: '#F0D0DA',
    mood: 'soft',
    preview: ['#FDF2F5', '#DB2777', '#2D1318'],
  },
  {
    id: 'concrete',
    name: 'Concreto',
    nameEn: 'Concrete',
    background: '#F4F4F5',
    surface: '#EAEAEC',
    text: '#18181B',
    textMuted: '#71717A',
    accent: '#18181B',
    accentHover: '#3F3F46',
    border: '#D4D4D8',
    mood: 'neutral',
    preview: ['#F4F4F5', '#18181B', '#71717A'],
  },
  {
    id: 'forest',
    name: 'Floresta',
    nameEn: 'Deep Forest',
    background: '#0C1A14',
    surface: '#132B1F',
    text: '#E8F0EB',
    textMuted: '#6B9E7E',
    accent: '#34D399',
    accentHover: '#10B981',
    border: '#1E3D2C',
    mood: 'dark',
    preview: ['#0C1A14', '#34D399', '#E8F0EB'],
  },
  {
    id: 'sand',
    name: 'Areia',
    nameEn: 'Sand',
    background: '#F9F6F0',
    surface: '#EDE8DD',
    text: '#33291A',
    textMuted: '#917B5D',
    accent: '#B8860B',
    accentHover: '#9A7209',
    border: '#DDD5C4',
    mood: 'warm',
    preview: ['#F9F6F0', '#B8860B', '#33291A'],
  },
  {
    id: 'electric',
    name: 'Elétrico',
    nameEn: 'Electric',
    background: '#0F0F0F',
    surface: '#1A1A1A',
    text: '#F5F5F5',
    textMuted: '#888888',
    accent: '#00FF94',
    accentHover: '#00CC76',
    border: '#2A2A2A',
    mood: 'bold',
    preview: ['#0F0F0F', '#00FF94', '#F5F5F5'],
  },
  {
    id: 'lavender',
    name: 'Lavanda',
    nameEn: 'Lavender',
    background: '#F8F5FF',
    surface: '#EDE5FF',
    text: '#1A0F2E',
    textMuted: '#7C6B99',
    accent: '#7C3AED',
    accentHover: '#6D28D9',
    border: '#DDD0F5',
    mood: 'soft',
    preview: ['#F8F5FF', '#7C3AED', '#1A0F2E'],
  },
  {
    id: 'cherry',
    name: 'Cereja',
    nameEn: 'Cherry',
    background: '#1A0A0E',
    surface: '#2A1218',
    text: '#F5E6EA',
    textMuted: '#B07080',
    accent: '#F43F5E',
    accentHover: '#E11D48',
    border: '#3D1C24',
    mood: 'dark',
    preview: ['#1A0A0E', '#F43F5E', '#F5E6EA'],
  },
];

/** Find a palette by id */
export function getPalette(id: string): ColorPalette | undefined {
  return palettes.find(p => p.id === id);
}

/** Get palettes filtered by mood */
export function getPalettesByMood(mood: ColorPalette['mood']): ColorPalette[] {
  return palettes.filter(p => p.mood === mood);
}
