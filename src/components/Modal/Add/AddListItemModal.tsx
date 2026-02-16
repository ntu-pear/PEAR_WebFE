import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const AddListItemModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { type, onSave, existingItems } = activeModal.props as {
    type: string;
    onSave: (
      type: string,
      payload: { value: string; typeCode?: string; description?: string; isEnabled?: boolean }
    ) => Promise<void>;

    existingItems: string[];
  };

  const isHighlight = type === "Highlight";

  const [value, setValue] = useState("");
  const [typeCode, setTypeCode] = useState("");
  const [description, setDescription] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    const trimmedTypeCode = typeCode.trim();
    const trimmedDescription = description.trim();


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

     if (isHighlight && !trimmedTypeCode) {
      setError("Type Code is required for Highlight.");
      return;
    }


    setError("");
    await onSave(type, {
      value: trimmed,
      ...(isHighlight
        ? {
            typeCode: trimmedTypeCode,
            description: trimmedDescription,
            isEnabled,
          }
        : {}),
    });

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div ref={modalRef} className="bg-background p-6 rounded-md w-[420px]">
        <h3 className="text-lg font-medium mb-4">Add Item — {type}</h3>
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
                  placeholder="e.g. ALLERGY"
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
            <Button type="submit">Add</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListItemModal;
