import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import { unassignGuardian } from "@/api/patients/guardian";
import { extractErrorMessage } from "@/utils/errorMessage";
import BaseDeleteModal from "./BaseDeleteModal";

const UnassignGuardianModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { patientId, guardianId, refreshGuardianData } = activeModal.props as {
    patientId: number;
    guardianId: number;
    refreshGuardianData: () => void | Promise<void>;
  };

  const handleUnassignGuardian = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!guardianId || !patientId) return;

    try {
      await unassignGuardian(patientId, guardianId);
      closeModal();
      toast.success("Guardian unassigned from this patient.");
      await refreshGuardianData?.();
    } catch (error) {
      closeModal();
      toast.error(extractErrorMessage(error, "Failed to unassign guardian."));
    }
  };

  return (
    <BaseDeleteModal
      modalRef={modalRef}
      onSubmit={handleUnassignGuardian}
      closeModal={closeModal}
      title="Remove this guardian from this patient?"
      description="This unassigns the guardian from this patient only. Their own record and any other patients they're linked to are unaffected."
      confirmLabel="Unassign"
    />
  );
};

export default UnassignGuardianModal;
