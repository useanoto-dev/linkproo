import { useEffect, useRef, useState, useCallback } from "react";
import { SmartLink } from "@/types/smart-link";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutosave(
  link: SmartLink,
  saveFn: (link: SmartLink) => Promise<void>,
  enabled: boolean,
  delayMs = 1500
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSavedRef = useRef<string>("");
  const linkRef = useRef(link);
  linkRef.current = link;

  const serialize = useCallback((l: SmartLink) => {
    // Exclude volatile fields
    const { views, clicks, createdAt, ...rest } = l;
    return JSON.stringify(rest);
  }, []);

  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;

  useEffect(() => {
    if (!enabled || !link.slug) return;

    const current = serialize(link);
    if (current === lastSavedRef.current) return;

    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      const toSave = linkRef.current;
      const snapshot = serialize(toSave);
      if (snapshot === lastSavedRef.current) return;

      setStatus("saving");
      try {
        await saveFnRef.current(toSave);
        lastSavedRef.current = snapshot;
        setSavedAt(new Date());
        setStatus("saved");
        // Reset to idle after 2s
        setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 2000);
      } catch {
        setStatus("error");
        setTimeout(() => setStatus((s) => (s === "error" ? "idle" : s)), 3000);
      }
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [link, enabled, delayMs, serialize]);

  // Initialize lastSaved to prevent immediate save on load
  const initializeRef = useCallback((l: SmartLink) => {
    lastSavedRef.current = serialize(l);
  }, [serialize]);

  const retry = useCallback(async () => {
    if (!enabled) return;
    setStatus("saving");
    try {
      await saveFnRef.current(linkRef.current);
      lastSavedRef.current = serialize(linkRef.current);
      setSavedAt(new Date());
      setStatus("saved");
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus((s) => (s === "error" ? "idle" : s)), 3000);
    }
  }, [enabled, serialize]);

  const flush = useCallback(async (): Promise<void> => {
    if (!enabled) return;
    const toSave = linkRef.current;
    const snapshot = serialize(toSave);
    if (snapshot === lastSavedRef.current) return; // nothing changed

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    setStatus("saving");
    try {
      await saveFnRef.current(toSave);
      lastSavedRef.current = snapshot;
      setSavedAt(new Date());
      setStatus("saved");
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 2000);
    } catch {
      setStatus("error");
    }
  }, [enabled, serialize]);

  return { status, initializeRef, savedAt, retry, flush };
}
