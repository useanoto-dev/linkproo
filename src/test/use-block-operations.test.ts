import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBlockOperations } from "@/hooks/use-block-operations";
import { useEditorStore } from "@/stores/editor-store";
import type { SmartLink, LinkBlock } from "@/types/smart-link";

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

import { toast } from "sonner";

const BASE: SmartLink = {
  id: "link-1",
  slug: "test",
  businessName: "Test",
  tagline: "",
  heroImage: "",
  logoUrl: "",
  backgroundColor: "from-gray-50 to-white",
  textColor: "text-white",
  accentColor: "#f59e0b",
  buttons: [],
  pages: [],
  badges: [],
  floatingEmojis: [],
  blocks: [],
  views: 0,
  clicks: 0,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

function makeBlock(id: string, order: number): LinkBlock {
  return {
    id,
    type: "text",
    order,
    text: "",
    textSize: "md",
    alignment: "left",
    color: "#ffffff",
  };
}

function getHook(link: SmartLink) {
  const { updateLink, setLink } = useEditorStore.getState();
  return renderHook(() => useBlockOperations({ link, updateLink, setLink }));
}

beforeEach(() => {
  vi.clearAllMocks();
  useEditorStore.getState().resetLink(BASE);
});

describe("addBlock", () => {
  it("adiciona um bloco de texto em link.blocks", () => {
    const { result } = getHook(BASE);
    act(() => result.current.addBlock("text"));

    const { blocks } = useEditorStore.getState().link;
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("text");
  });

  it("com type='button' adiciona em link.buttons, não em blocks", () => {
    const { result } = getHook(BASE);
    act(() => result.current.addBlock("button"));

    const state = useEditorStore.getState().link;
    expect(state.buttons).toHaveLength(1);
    expect(state.blocks).toHaveLength(0);
  });

  it("atribui order=0 quando a lista está vazia", () => {
    const { result } = getHook(BASE);
    act(() => result.current.addBlock("text"));

    expect(useEditorStore.getState().link.blocks[0].order).toBe(0);
  });

  it("atribui order incrementando para segundo bloco", () => {
    const linkWith1 = { ...BASE, blocks: [makeBlock("b1", 0)] };
    useEditorStore.getState().resetLink(linkWith1);
    const { result } = getHook(linkWith1);

    act(() => result.current.addBlock("text"));

    const blocks = useEditorStore.getState().link.blocks;
    expect(blocks).toHaveLength(2);
    expect(blocks[1].order).toBe(1);
  });

  it("dispara toast.success", () => {
    const { result } = getHook(BASE);
    act(() => result.current.addBlock("text"));

    expect(vi.mocked(toast.success)).toHaveBeenCalledOnce();
  });
});

describe("insertBlockAt", () => {
  it("insere na posição 0 e bump o bloco existente de order 0 para 1", () => {
    const linkWith1 = { ...BASE, blocks: [makeBlock("b1", 0)] };
    useEditorStore.getState().resetLink(linkWith1);
    const { result } = getHook(linkWith1);

    act(() => result.current.insertBlockAt("header", 0));

    const blocks = useEditorStore.getState().link.blocks;
    expect(blocks).toHaveLength(2);
    const newBlock = blocks.find((b) => b.type === "header");
    const oldBlock = blocks.find((b) => b.id === "b1");
    expect(newBlock?.order).toBe(0);
    expect(oldBlock?.order).toBe(1);
  });

  it("com type='button' insere em buttons", () => {
    const { result } = getHook(BASE);
    act(() => result.current.insertBlockAt("button", 0));

    expect(useEditorStore.getState().link.buttons).toHaveLength(1);
    expect(useEditorStore.getState().link.blocks).toHaveLength(0);
  });
});

describe("remover bloco (padrão store.updateLink + filter)", () => {
  it("remove bloco por id via filter", () => {
    const linkWith2 = {
      ...BASE,
      blocks: [makeBlock("b1", 0), makeBlock("b2", 1)],
    };
    useEditorStore.getState().resetLink(linkWith2);

    act(() => {
      useEditorStore
        .getState()
        .updateLink({ blocks: linkWith2.blocks.filter((b) => b.id !== "b1") });
    });

    const blocks = useEditorStore.getState().link.blocks;
    expect(blocks).toHaveLength(1);
    expect(blocks[0].id).toBe("b2");
  });
});

describe("reordenar blocos (padrão store.updateLink + reassign order)", () => {
  it("reordena blocos e atualiza propriedade order", () => {
    const b0 = makeBlock("b0", 0);
    const b1 = makeBlock("b1", 1);
    const b2 = makeBlock("b2", 2);
    const linkWith3 = { ...BASE, blocks: [b0, b1, b2] };
    useEditorStore.getState().resetLink(linkWith3);

    // Mover b2 para posição 0 (simulate arrayMove)
    const reordered = [b2, b0, b1].map((b, i) => ({ ...b, order: i }));
    act(() => {
      useEditorStore.getState().updateLink({ blocks: reordered });
    });

    const blocks = useEditorStore.getState().link.blocks;
    expect(blocks[0].id).toBe("b2");
    expect(blocks[0].order).toBe(0);
    expect(blocks[1].id).toBe("b0");
  });

  it("após reordenação, canUndo=true e undo restaura a ordem original", () => {
    const b0 = makeBlock("b0", 0);
    const b1 = makeBlock("b1", 1);
    const linkWith2 = { ...BASE, blocks: [b0, b1] };
    useEditorStore.getState().resetLink(linkWith2);

    const reordered = [b1, b0].map((b, i) => ({ ...b, order: i }));
    act(() => useEditorStore.getState().updateLink({ blocks: reordered }));

    expect(useEditorStore.getState().canUndo).toBe(true);

    act(() => useEditorStore.getState().undo());

    expect(useEditorStore.getState().link.blocks[0].id).toBe("b0");
  });
});
