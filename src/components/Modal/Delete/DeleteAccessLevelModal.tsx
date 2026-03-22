import React, { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import { AccessLevel, deleteAccessLevel } from "@/api/access_level/access_level";

const DeleteAccessLevelModal: React.FC = () => {
  const { activeModal, closeModal, modalRef } = useModal();
  const level = activeModal.props?.level as AccessLevel | undefined;
  const onSuccess = activeModal.props?.onSuccess as (() => Promise<void>) | undefined;
  const [submitting, setSubmitting] = useState(false);

  if (!level) return null;

  const handleDelete = async () => {
    if (level.isSystem) {
      toast.error("System access levels cannot be deleted.");
      return;
    }

    try {
      setSubmitting(true);
      await deleteAccessLevel(level.id);
      await onSuccess?.();
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">Delete Access Level</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={closeModal}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{level.levelName}</span>?
          </p>

          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting || level.isSystem}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccessLevelModal;