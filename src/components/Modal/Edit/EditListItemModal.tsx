import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ListItem } from "@/api/patients/lists";

const EditListItemModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { type, listItem, onSave, existingItems } = activeModal.props as {
    type: string;
    listItem: ListItem;
    onSave: (type: string, id: string, payload: { value: string; typeCode?: string; description?: string; isEnabled?: boolean }) => Promise<void>;
    existingItems: string[];
  };

    const isHighlight = type === "Highlight";

  const [value, setValue] = useState(listItem?.value ?? "");
  const [typeCode, setTypeCode] = useState(listItem?.typeCode ?? "");
  const [description, setDescription] = useState(listItem?.description ?? "");
  const [isEnabled, setIsEnabled] = useState(listItem?.isEnabled ?? true);

  const [error, setError] = useState("");

  useEffect(() => {
    setValue(listItem?.value ?? "");
    setTypeCode(listItem?.typeCode ?? "");
    setDescription(listItem?.description ?? "");
    setIsEnabled(listItem?.isEnabled ?? true);
  }, [listItem]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      setError("Value is required.");
      return;
    }

    // IMPORTANT: existingItems must exclude current item, otherwise editing without changing value fails.
    const exists = existingItems.some(
      (item) => item.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setError("Value already exists in selected list.");
      return;
    }

    if (isHighlight && !typeCode.trim()) {
      setError("Type Code is required for Highlight.");
      return;
    }

    await onSave(type, String(listItem.id), {
      value: trimmed,
      ...(isHighlight
        ? {
            typeCode: typeCode.trim(),
            description: description.trim(),
            isEnabled,
          }
        : {}),
    });

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
          </div>

          {isHighlight && (
            <>
              <div>
                <label className="block text-sm font-medium">
                  Type Code <span className="text-red-600">*</span>
                </label>
                <input
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  value={typeCode}
                  onChange={(e) => {
                    setTypeCode(e.target.value);
                    setError("");
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Description</label>
                <input
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setError("");
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Enabled</label>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </>
          )}

          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

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
