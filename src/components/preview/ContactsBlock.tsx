import { motion } from "framer-motion";
import { LinkBlock, ContactItem } from "@/types/smart-link";
import { recordClick } from "@/hooks/use-links";
import type { EntryVariants } from "./preview-utils";

interface ContactsBlockProps {
  block: LinkBlock;
  accent: string;
  textClass: string;
  subtextClass: string;
  delay: number;
  linkId: string;
  entryVariants: EntryVariants;
}

function ContactCard({
  contact, accent, textClass, subtextClass, linkId
}: { contact: ContactItem; accent: string; textClass: string; subtextClass: string; linkId: string }) {
  const waUrl = contact.whatsappNumber
    ? `https://wa.me/${contact.whatsappNumber.replace(/\D/g, "")}${contact.whatsappMessage ? `?text=${encodeURIComponent(contact.whatsappMessage)}` : ""}`
    : undefined;

  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      <div className="relative">
        {contact.photo ? (
          <img
            src={contact.photo}
            alt={contact.name}
            className="w-16 h-16 rounded-full object-cover border-2"
            style={{ borderColor: `${accent}60` }}
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
            style={{ background: `${accent}30`, color: accent }}
          >
            {contact.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="text-center">
        <p className={`text-sm font-semibold leading-tight ${textClass}`}>{contact.name}</p>
        {contact.role && (
          <p className={`text-[11px] mt-0.5 ${subtextClass}`}>{contact.role}</p>
        )}
      </div>
      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { if (linkId) recordClick(linkId); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all active:scale-95"
          style={{ background: "#25D366", color: "#fff" }}
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>
      )}
    </div>
  );
}

export function ContactsBlock({ block, accent, textClass, subtextClass, delay, linkId, entryVariants: ev }: ContactsBlockProps) {
  const contacts: ContactItem[] = block.contactsList || [];
  const mode = block.contactsMode || 1;
  const visible = contacts.slice(0, mode);

  if (visible.length === 0) return null;

  return (
    <motion.div
      className="px-4 py-3"
      initial={ev.initial}
      animate={ev.animate}
      transition={ev.transition}
    >
      {mode === 1 ? (
        <div className="flex justify-center">
          <ContactCard contact={visible[0]} accent={accent} textClass={textClass} subtextClass={subtextClass} linkId={linkId} />
        </div>
      ) : (
        <div className="flex gap-3 justify-center">
          {visible.map((contact) => (
            <ContactCard key={contact.id} contact={contact} accent={accent} textClass={textClass} subtextClass={subtextClass} linkId={linkId} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
