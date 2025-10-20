import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import { ListItem } from "@/api/patients/lists";

const DeleteListItemModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { type, listItem, onDelete } = activeModal.props as {
    type: string;
    listItem: ListItem;
    onDelete: (type: string, id: string) => Promise<void>;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onDelete(type, String(listItem.id));
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div ref={modalRef} className="bg-background p-6 rounded-md w-[420px]">
        <h3 className="text-lg font-medium mb-4">Delete Item</h3>
        <p className="text-sm mb-6">
          Are you sure you want to delete <b>{listItem?.value}</b>?
        </p>
        <form onSubmit={submit} className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" variant="destructive">
            Delete
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DeleteListItemModal;
