import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import { deletePatient } from "@/api/patients/patients";
import BaseDeleteModal from "./BaseDeleteModal";

const DeletePatientModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { patientId, refreshData } = activeModal.props as {
    patientId: string;
    refreshData: () => void;
  };

  const handleDeletePatient = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!patientId || isNaN(Number(patientId))) return;
    try {
      await deletePatient(Number(patientId));
      refreshData();
      closeModal();
      toast.success("Patient deleted successfully.");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();
      toast.error("Failed to delete patient.");
    }
  };

  return (
    <>
      <BaseDeleteModal
        modalRef={modalRef}
        onSubmit={handleDeletePatient}
        closeModal={closeModal}
      />
    </>
  );
};

export default DeletePatientModal;
