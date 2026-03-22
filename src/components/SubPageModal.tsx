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

  // Lock body scroll when open
  useEffect(() => {
    if (page) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
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
          className="fixed inset-0 z-[100] flex flex-col overflow-y-auto"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ background: customBg || bgColor || (dark ? "#111" : "#fff") }}
        >
          <SubPagePreview page={page} link={link} onBack={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
