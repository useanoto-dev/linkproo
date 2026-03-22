import { useState, useCallback, useRef, useMemo } from "react";
import { SmartLink } from "@/types/smart-link";

const MAX_HISTORY = 50;

/**
 * Undo/redo history hook for the link editor.
 * Supports functional updates like React's setState.
 */
export function useEditorHistory(initial: SmartLink) {
  const [past, setPast] = useState<SmartLink[]>([]);
  const [present, setPresent] = useState<SmartLink>(initial);
  const [future, setFuture] = useState<SmartLink[]>([]);
  const skipRef = useRef(false);
  const presentRef = useRef(present);
  presentRef.current = present;

  const set = useCallback((state: SmartLink | ((prev: SmartLink) => SmartLink)) => {
    setPresent((prev) => {
      const next = typeof state === "function" ? state(prev) : state;
      if (!skipRef.current) {
        setPast((p) => [...p.slice(-(MAX_HISTORY - 1)), prev]);
        setFuture([]);
      }
      skipRef.current = false;
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1];
      skipRef.current = true;
      setFuture((f) => [presentRef.current, ...f]);
      setPresent(prev);
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      skipRef.current = true;
      setPast((p) => [...p, presentRef.current]);
      setPresent(next);
      return f.slice(1);
    });
  }, []);

  const reset = useCallback((state: SmartLink) => {
    setPast([]);
    setFuture([]);
    setPresent(state);
  }, []);

  return useMemo(() => ({
    state: present,
    set,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    reset,
  }), [present, past, future, set, undo, redo, reset]);
}
