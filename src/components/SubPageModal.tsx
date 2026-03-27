import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SubPage, SmartLink } from "@/types/smart-link";
import { extractBgColor, getCustomBgGradient } from "@/lib/color-utils";
import { isDarkBg } from "@/components/preview/preview-utils";
import { SubPagePreview } from "./SubPagePreview";

interface SubPageModalProps {
  page: SubPage | null;
  link: SmartLink;
  onClose: () => void;
}

export function SubPageModal({ page, link, onClose }: SubPageModalProps) {
  const customBg = getCustomBgGradient(link.backgroundColor);
  const bgColor = extractBgColor(link.backgroundColor);
  const dark = isDarkBg(link.backgroundColor);
  const contentRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open — iOS-safe: position:fixed preserves scroll position
  useEffect(() => {
    if (!page) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [page]);

  // Scroll to top whenever a different sub-page is opened
  useEffect(() => {
    if (page && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [page?.id]);

  return (
    <AnimatePresence>
      {page && (
        <motion.div
          ref={contentRef}
          className="fixed inset-0 z-[100] flex flex-col overflow-y-auto overscroll-y-none"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 420, damping: 40, restDelta: 0.001 }}
          style={{
            background: customBg || bgColor || (dark ? "#111" : "#fff"),
            willChange: "transform",
          }}
        >
          <SubPagePreview page={page} link={link} onBack={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
