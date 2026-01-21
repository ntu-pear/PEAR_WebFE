import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import BaseDeleteModal from "./BaseDeleteModal";
import { DeleteMedicalHistory } from "@/api/patients/medicalHistory";

const DeleteMedicalHistoryModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { medicalHistoryId, refreshData } = activeModal.props as {
    medicalHistoryId: number;
    refreshData: () => void;
  };

  const handleDeleteMedicalHistory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!medicalHistoryId) return;
    try {
      await DeleteMedicalHistory(medicalHistoryId);
      refreshData();
      closeModal();
      toast.success("Patient Medical History deleted successfully.");
    } catch (error) {
      closeModal();
      toast.error("Failed to delete patient medical history.");
    }
  };

  return (
    <>
      <BaseDeleteModal
        modalRef={modalRef}
        onSubmit={handleDeleteMedicalHistory}
        closeModal={closeModal}
      />
    </>
  );
};

export default DeleteMedicalHistoryModal;
