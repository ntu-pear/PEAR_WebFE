import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import { deletePatientGuardian } from "@/api/patients/guardian";
import { extractErrorMessage } from "@/utils/errorMessage";
import BaseDeleteModal from "./BaseDeleteModal";

const DeleteGuardianModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { guardianId, refreshGuardianData } = activeModal.props as {
    guardianId: number;
    refreshGuardianData: () => void | Promise<void>;
  };

  const handleDeleteGuardian = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!guardianId) return;

    try {
      await deletePatientGuardian(guardianId);
      closeModal();
      toast.success("Guardian deleted.");
      await refreshGuardianData?.();
    } catch (error) {
      closeModal();
      toast.error(extractErrorMessage(error, "Failed to delete guardian."));
    }
  };

  return (
    <BaseDeleteModal
      modalRef={modalRef}
      onSubmit={handleDeleteGuardian}
      closeModal={closeModal}
      title="Delete this guardian?"
      description="This permanently deletes the guardian's own record and unassigns them from every patient they're currently linked to. This cannot be undone."
      confirmLabel="Delete"
    />
  );
};

export default DeleteGuardianModal;
