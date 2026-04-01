import type { CSSProperties } from 'react';

export interface TextEffect {
  key: string;
  name: string;
  description: string;
  /**
   * Complete inline styles spread directly onto the text element's `style` prop.
   * This is the single source of truth for the visual appearance — no CSS classes
   * needed. Applied in both the live preview and the editor tiles.
   */
  style: CSSProperties;
  /**
   * Optional CSS class added alongside inline styles.
   * Used ONLY to bind a @keyframes animation name (defined in text-effects.css).
   * Never carries visual properties — those all live in `style` above.
   */
  animClass?: string;
}

export const TEXT_EFFECTS: TextEffect[] = [
  // ─── 1. Glass ─────────────────────────────────────────────────────────────
  // Near-transparent fill + thick white stroke = glass edge catching light.
  // Multiple glow layers + drop-shadow create realistic glass depth.
  {
    key: 'te-glass',
    name: 'Glass',
    description: 'Texto de vidro — cristalino e surreal',
    style: {
      color: 'rgba(255,255,255,0.05)',
      WebkitTextStroke: '1.5px rgba(255,255,255,0.92)',
      textShadow: [
        '0 0 18px rgba(255,255,255,0.7)',
        '0 0 40px rgba(255,255,255,0.35)',
        '0 0 80px rgba(255,255,255,0.12)',
        '0 1px 0 rgba(255,255,255,0.55)',
        '0 -1px 0 rgba(255,255,255,0.2)',
        '3px 4px 12px rgba(0,0,0,0.32)',
      ].join(', '),
      filter:
        'drop-shadow(0 6px 20px rgba(0,0,0,0.3)) drop-shadow(0 1px 4px rgba(255,255,255,0.12))',
    },
  },

  // ─── 2. Neon ──────────────────────────────────────────────────────────────
  {
    key: 'te-neon',
    name: 'Neon',
    description: 'Brilho neon elétrico com flicker',
    style: {
      color: '#39ff14',
      textShadow: [
        '0 0 7px #39ff14',
        '0 0 10px #39ff14',
        '0 0 21px #39ff14',
        '0 0 42px #0fa',
        '0 0 82px #0fa',
        '0 0 100px #0fa',
      ].join(', '),
    },
    animClass: 'te-neon-anim',
  },

  // ─── 3. Chrome ────────────────────────────────────────────────────────────
  {
    key: 'te-chrome',
    name: 'Chrome',
    description: 'Aço espelhado — reflexo metálico',
    style: {
      background:
        'linear-gradient(180deg, #ffffff 0%, #e8e8e8 15%, #c0c0c0 30%, #888888 50%, #c0c0c0 70%, #e8e8e8 85%, #ffffff 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
      filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.65))',
    },
  },

  // ─── 4. Gradient Animated ─────────────────────────────────────────────────
  {
    key: 'te-gradient',
    name: 'Gradient',
    description: 'Gradiente colorido animado',
    style: {
      background:
        'linear-gradient(90deg, #ff0080, #7928ca, #0070f3, #00dfd8, #ff0080)',
      backgroundSize: '300% 300%',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
    },
    animClass: 'te-grad-anim',
  },

  // ─── 5. Ouro ──────────────────────────────────────────────────────────────
  {
    key: 'te-metallic',
    name: 'Ouro',
    description: 'Dourado metálico rico',
    style: {
      background:
        'linear-gradient(135deg, #4a2800 0%, #c87800 12%, #ffd700 28%, #fff8a0 50%, #ffd700 72%, #c87800 88%, #4a2800 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
      filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.6))',
    },
  },

  // ─── 6. Holográfico ───────────────────────────────────────────────────────
  {
    key: 'te-holographic',
    name: 'Holográfico',
    description: 'Arco-íris animado com brilho',
    style: {
      background:
        'linear-gradient(90deg, #ff0000, #ff7700, #ffff00, #00ff88, #0099ff, #8800ff, #ff0077, #ff0000)',
      backgroundSize: '400% 400%',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
      filter: 'drop-shadow(0 0 12px rgba(180,80,255,0.65))',
    },
    animClass: 'te-holo-anim',
  },

  // ─── 7. Frosted ───────────────────────────────────────────────────────────
  {
    key: 'te-frosted',
    name: 'Frosted',
    description: 'Vidro fosco difuso',
    style: {
      color: 'rgba(255,255,255,0.85)',
      WebkitTextStroke: '0.7px rgba(255,255,255,0.55)',
      textShadow: [
        '0 0 10px rgba(255,255,255,0.45)',
        '0 0 22px rgba(255,255,255,0.25)',
        '0 0 45px rgba(255,255,255,0.1)',
        '0 1px 2px rgba(0,0,0,0.2)',
      ].join(', '),
    },
  },

  // ─── 8. 3D ────────────────────────────────────────────────────────────────
  {
    key: 'te-3d',
    name: '3D',
    description: 'Extrusão 3D com profundidade',
    style: {
      color: '#ffffff',
      textShadow: [
        '1px 1px 0 #cccccc',
        '2px 2px 0 #bbbbbb',
        '3px 3px 0 #aaaaaa',
        '4px 4px 0 #999999',
        '5px 5px 0 #888888',
        '6px 6px 0 #777777',
        '7px 7px 0 #666666',
        '8px 8px 10px rgba(0,0,0,0.6)',
      ].join(', '),
    },
  },

  // ─── 9. Sombra ────────────────────────────────────────────────────────────
  {
    key: 'te-shadow',
    name: 'Sombra',
    description: 'Profundidade com sombra longa',
    style: {
      color: '#ffffff',
      textShadow: [
        '0 1px 0 rgba(200,200,200,0.9)',
        '0 2px 0 rgba(175,175,175,0.8)',
        '0 3px 0 rgba(150,150,150,0.7)',
        '0 4px 0 rgba(125,125,125,0.5)',
        '0 5px 0 rgba(100,100,100,0.4)',
        '0 6px 1px rgba(0,0,0,0.1)',
        '0 0 5px rgba(0,0,0,0.1)',
        '0 1px 3px rgba(0,0,0,0.3)',
        '0 3px 5px rgba(0,0,0,0.2)',
        '0 5px 10px rgba(0,0,0,0.25)',
        '0 10px 10px rgba(0,0,0,0.2)',
        '0 20px 20px rgba(0,0,0,0.15)',
      ].join(', '),
    },
  },

  // ─── 10. Glass Gradient ───────────────────────────────────────────────────
  {
    key: 'te-gradient-glass',
    name: 'Glass Grad.',
    description: 'Vidro com degradê azul-prata',
    style: {
      background:
        'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(185,215,255,0.92) 45%, rgba(255,255,255,0.98) 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
      filter:
        'drop-shadow(0 1px 2px rgba(0,0,0,0.2)) drop-shadow(0 0 16px rgba(150,200,255,0.65))',
    },
  },
];
