export interface TextEffect {
  key: string;
  name: string;
  description: string;
  /** CSS property key-value pairs for editor preview (dark bg context) */
  previewColor: string;
  previewStyle: Record<string, string>;
}

/** All available text effects — applied via className on the text element */
export const TEXT_EFFECTS: TextEffect[] = [
  {
    key: 'te-glass',
    name: 'Glass',
    description: 'Texto cristalino',
    previewColor: 'rgba(255,255,255,0.92)',
    previewStyle: {
      color: 'rgba(255,255,255,0.92)',
      textShadow: '0 1px 4px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.15)',
      WebkitTextStroke: '0.8px rgba(255,255,255,0.7)',
    },
  },
  {
    key: 'te-neon',
    name: 'Neon',
    description: 'Brilho neon',
    previewColor: '#39ff14',
    previewStyle: {
      color: '#39ff14',
      textShadow: '0 0 4px #39ff14, 0 0 11px #39ff14, 0 0 19px #39ff14',
    },
  },
  {
    key: 'te-chrome',
    name: 'Chrome',
    description: 'Metal espelhado',
    previewColor: '#c0c0c0',
    previewStyle: {
      background: 'linear-gradient(180deg, #ffffff 0%, #c0c0c0 35%, #808080 55%, #c8c8c8 75%, #ffffff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
  },
  {
    key: 'te-gradient',
    name: 'Gradient',
    description: 'Gradiente animado',
    previewColor: '#ff0080',
    previewStyle: {
      background: 'linear-gradient(90deg, #ff0080, #7928ca, #0070f3, #00dfd8)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
  },
  {
    key: 'te-metallic',
    name: 'Ouro',
    description: 'Dourado metálico',
    previewColor: '#FFD700',
    previewStyle: {
      background: 'linear-gradient(135deg, #8B6914 0%, #FFD700 28%, #FFF4A0 50%, #FFD700 72%, #8B6914 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
  },
  {
    key: 'te-holographic',
    name: 'Holográfico',
    description: 'Arco-íris animado',
    previewColor: '#ff8800',
    previewStyle: {
      background: 'linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff88, #0088ff, #8800ff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
  },
  {
    key: 'te-frosted',
    name: 'Frosted',
    description: 'Vidro fosco',
    previewColor: 'rgba(255,255,255,0.88)',
    previewStyle: {
      color: 'rgba(255,255,255,0.88)',
      textShadow: '0 0 12px rgba(255,255,255,0.35), 0 0 30px rgba(255,255,255,0.12)',
      WebkitTextStroke: '0.6px rgba(255,255,255,0.5)',
    },
  },
  {
    key: 'te-3d',
    name: '3D',
    description: 'Extrude 3D',
    previewColor: '#ffffff',
    previewStyle: {
      color: '#ffffff',
      textShadow: '1px 1px 0 #aaa, 2px 2px 0 #888, 3px 3px 0 #666, 4px 4px 0 #444, 5px 5px 6px rgba(0,0,0,0.5)',
    },
  },
  {
    key: 'te-shadow',
    name: 'Sombra',
    description: 'Profundidade',
    previewColor: '#ffffff',
    previewStyle: {
      color: '#ffffff',
      textShadow: '0 1px 0 #ccc, 0 2px 0 #bbb, 0 3px 0 #aaa, 0 4px 0 #999, 0 5px 0 #888, 0 5px 10px rgba(0,0,0,0.4)',
    },
  },
  {
    key: 'te-gradient-glass',
    name: 'Glass Grad.',
    description: 'Vidro degradê',
    previewColor: '#e0f0ff',
    previewStyle: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(200,225,255,0.85) 40%, rgba(255,255,255,0.98) 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
  },
];
