import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import Input from "@/components/Form/Input";
import { useModal } from "@/hooks/useModal";
import {
  AccessLevel,
  AccessLevelUpdateRequest,
  updateAccessLevel,
} from "@/api/access_level/access_level";

type FormValues = {
  code: string;
  levelRank: number;
  levelName: string;
  description: string;
};

const EditAccessLevelModal: React.FC = () => {
  const { activeModal, closeModal, modalRef } = useModal();
  const level = activeModal.props?.level as AccessLevel | undefined;
  const onSuccess = activeModal.props?.onSuccess as (() => Promise<void>) | undefined;

  const form = useForm<FormValues>({
    defaultValues: {
      code: level?.code ?? "",
      levelRank: level?.levelRank ?? 0,
      levelName: level?.levelName ?? "",
      description: level?.description ?? "",
    },
  });

  if (!level) return null;

  const isSystem = level.isSystem;

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const payload: AccessLevelUpdateRequest = isSystem
        ? {
            description: values.description.trim(),
          }
        : {
            code: values.code.trim(),
            levelRank: Number(values.levelRank),
            levelName: values.levelName.trim(),
            description: values.description.trim(),
          };

      await updateAccessLevel(level.id, payload);
      await onSuccess?.();
      closeModal();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail || "Failed to update access level."
      );
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Edit Access Level</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSystem
                ? "System access levels only allow description updates."
                : "Update the access level details below."}
            </p>
          </div>

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

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <Input
            label="Code"
            name="code"
            formReturn={form}
            disabled={isSystem}
          />
          <Input
            label="Level Rank"
            name="levelRank"
            type="number"
            formReturn={form}
            disabled={isSystem}
          />
          <Input
            label="Level Name"
            name="levelName"
            formReturn={form}
            disabled={isSystem}
          />
          <Input
            label="Description"
            name="description"
            formReturn={form}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccessLevelModal;