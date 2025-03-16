import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import BaseDeleteModal from "./BaseDeleteModal";
import { deleteDiagnosedDementa } from "@/api/patients/diagnosedDementia";

const DeleteDiagnosedDementiaModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { dementiaId, refreshData } = activeModal.props as {
    dementiaId: string;
    refreshData: () => void;
  };

  const handleDeleteDiagnosedDementia = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!dementiaId || isNaN(Number(dementiaId))) return;
    try {
      await deleteDiagnosedDementa(Number(dementiaId));
      closeModal();
      toast.success("Patient diagnosed dementia deleted successfully.");
      refreshData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();
      toast.error("Failed to delete patient diagnosed dementia.");
    }
  };

  return (
    <>
      <BaseDeleteModal
        modalRef={modalRef}
        onSubmit={handleDeleteDiagnosedDementia}
        closeModal={closeModal}
      />
    </>
  );
};

export default DeleteDiagnosedDementiaModal;
