import { memo } from "react";
import { SmartLinkButton, SubPage } from "@/types/smart-link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ButtonBlockEditor } from "../ButtonBlockEditor";

export const SortableButton = memo(function SortableButton({
  button,
  index,
  onUpdate,
  onRemove,
  onDuplicate,
  pages,
}: {
  button: SmartLinkButton;
  index: number;
  onUpdate: (id: string, updates: Partial<SmartLinkButton>) => void;
  onRemove: (id: string) => void;
  onDuplicate?: (id: string) => void;
  pages: SubPage[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: button.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ButtonBlockEditor
        button={button}
        index={index}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onDuplicate={onDuplicate}
        dragHandleProps={listeners}
        pages={pages}
      />
    </div>
  );
});
