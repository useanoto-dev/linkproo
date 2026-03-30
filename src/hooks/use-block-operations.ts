import { useCallback } from 'react';
import { toast } from 'sonner';
import { SmartLink, BlockType, SubPage } from '@/types/smart-link';
import { createBlockDefaults } from '@/lib/block-utils';

const BLOCK_NAMES: Record<string, string> = {
  button: 'Botão Visual', 'image-button': 'Botão Imagem', text: 'Texto',
  badges: 'Badges', cta: 'CTA', separator: 'Separador', image: 'Imagem',
  header: 'Título', spacer: 'Espaçador', video: 'Vídeo', hero: 'Hero',
  info: 'Info', countdown: 'Countdown', faq: 'FAQ', gallery: 'Galeria',
  testimonial: 'Depoimento', stats: 'Números/Stats', product: 'Produto',
  'email-capture': 'Captura Email', spotify: 'Spotify', map: 'Mapa',
  carousel: 'Carrossel', banner: 'Banner Promo', 'animated-button': 'Botão Animado',
};

const NEW_BUTTON_DEFAULTS = {
  label: '', subtitle: '', url: '', icon: '',
  gradientColor: 'from-blue-600 to-blue-800', iconEmoji: '',
  imagePosition: 'right' as const, imageOpacity: 85, imageSize: 50,
};

interface UseBlockOperationsOptions {
  link: SmartLink;
  updateLink: (updates: Partial<SmartLink>) => void;
  setLink: (updater: SmartLink | ((prev: SmartLink) => SmartLink), skipHistory?: boolean) => void;
}

export function useBlockOperations({ link, updateLink, setLink }: UseBlockOperationsOptions) {
  const getNextOrder = useCallback(() => {
    const maxBtnOrder = (link.buttons ?? []).reduce((max, b) => Math.max(max, b.order ?? 0), -1);
    const maxBlkOrder = (link.blocks ?? []).reduce((max, b) => Math.max(max, b.order ?? 0), -1);
    return Math.max(maxBtnOrder, maxBlkOrder, (link.buttons ?? []).length + (link.blocks ?? []).length - 1) + 1;
  }, [link.buttons, link.blocks]);

  const insertBlockAt = useCallback(
    (type: BlockType, atIndex: number, extraDefaults?: Record<string, unknown>) => {
      const updatedButtons = (link.buttons ?? []).map((b) =>
        (b.order ?? 0) >= atIndex ? { ...b, order: (b.order ?? 0) + 1 } : b
      );
      const updatedBlocks = (link.blocks ?? []).map((b) =>
        (b.order ?? 0) >= atIndex ? { ...b, order: (b.order ?? 0) + 1 } : b
      );
      if (type === 'button') {
        updateLink({
          buttons: [...updatedButtons, { id: Date.now().toString(), ...NEW_BUTTON_DEFAULTS, order: atIndex }],
          blocks: updatedBlocks,
        });
      } else {
        updateLink({
          buttons: updatedButtons,
          blocks: [...updatedBlocks, createBlockDefaults(type, atIndex, extraDefaults)],
        });
      }
      toast.success(`${BLOCK_NAMES[type] || 'Bloco'} inserido!`);
    },
    [link, updateLink]
  );

  const addBlock = useCallback(
    (type: BlockType, extraDefaults?: Record<string, unknown>) => {
      const nextOrder = getNextOrder();
      if (type === 'button') {
        updateLink({
          buttons: [...(link.buttons ?? []), { id: Date.now().toString(), ...NEW_BUTTON_DEFAULTS, order: nextOrder }],
        });
      } else {
        updateLink({ blocks: [...(link.blocks ?? []), createBlockDefaults(type, nextOrder, extraDefaults)] });
      }
      toast.success(`${BLOCK_NAMES[type] || 'Bloco'} adicionado!`);
    },
    [link, getNextOrder, updateLink]
  );

  const updateSubPage = useCallback(
    (pageId: string, updates: Partial<SubPage>) => {
      setLink((prev) => ({
        ...prev,
        pages: (prev.pages || []).map((p) => (p.id === pageId ? { ...p, ...updates } : p)),
      }));
    },
    [setLink]
  );

  const addBlockToSubPage = useCallback(
    (pageId: string, type: BlockType, extraDefaults?: Record<string, unknown>) => {
      const page = (link.pages || []).find((p) => p.id === pageId);
      if (!page) return;
      const nextOrder = page.blocks.reduce((max, b) => Math.max(max, b.order ?? 0), -1) + 1;
      updateSubPage(pageId, { blocks: [...page.blocks, createBlockDefaults(type, nextOrder, extraDefaults)] });
      toast.success('Bloco adicionado!');
    },
    [link.pages, updateSubPage]
  );

  const insertBlockToSubPageAt = useCallback(
    (pageId: string, type: BlockType, atIndex: number, extraDefaults?: Record<string, unknown>) => {
      const page = (link.pages || []).find((p) => p.id === pageId);
      if (!page) return;
      const sorted = [...page.blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const bumpedBlocks = sorted.map((b) =>
        (b.order ?? 0) >= atIndex ? { ...b, order: (b.order ?? 0) + 1 } : b
      );
      updateSubPage(pageId, { blocks: [...bumpedBlocks, createBlockDefaults(type, atIndex, extraDefaults)] });
    },
    [link.pages, updateSubPage]
  );

  return { insertBlockAt, addBlock, updateSubPage, addBlockToSubPage, insertBlockToSubPageAt };
}
