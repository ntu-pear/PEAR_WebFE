import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ListItem } from "@/api/patients/lists";

const EditListItemModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { type, listItem, onSave, existingItems } = activeModal.props as {
    type: string;
    listItem: ListItem;
    onSave: (type: string, id: string, value: string) => Promise<void>;
    existingItems: string[];
  };

  const [value, setValue] = useState(listItem?.value ?? "");
  const [error, setError] = useState("");

  useEffect(() => setValue(listItem?.value ?? ""), [listItem]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();

    // Check if empty input
    if (!trimmed) {
      setError("Value is required.");
      return;
    }

    // Check if duplicate entry
    const exists = existingItems.some(
      (item) => item.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setError("Value already exists in selected list.");
      return;
    }

    await onSave(type, String(listItem.id), value.trim());
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div ref={modalRef} className="bg-background p-6 rounded-md w-[420px]">
        <h3 className="text-lg font-medium mb-4">Edit Item — {type}</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              Value <span className="text-red-600">*</span>
            </label>
            <input
              autoFocus
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
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
