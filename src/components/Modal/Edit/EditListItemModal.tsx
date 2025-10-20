import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ListItem } from "@/api/patients/lists";

const EditListItemModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { type, listItem, onSave } = activeModal.props as {
    type: string;
    listItem: ListItem;
    onSave: (type: string, id: string, value: string) => Promise<void>;
  };

  const [value, setValue] = useState(listItem?.value ?? "");

  useEffect(() => setValue(listItem?.value ?? ""), [listItem]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    await onSave(type, String(listItem.id), value.trim());
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div ref={modalRef} className="bg-background p-6 rounded-md w-[420px]">
        <h3 className="text-lg font-medium mb-4">Edit Item — {type}</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Value</label>
            <input
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListItemModal;
