import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import { deletePatientAllergy } from "@/api/patients/allergy";
import BaseDeleteModal from "./BaseDeleteModal";

const DeleteAllergyModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { allergyId, refreshAllergyData } = activeModal.props as {
    allergyId: string;
    refreshAllergyData: () => void;
  };

  const handleDeleteAllergy = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!allergyId || isNaN(Number(allergyId))) return;
    try {
      await deletePatientAllergy(Number(allergyId));
      closeModal();
      toast.success("Patient Allergy deleted successfully.");
      refreshAllergyData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();
      toast.error("Failed to delete patient Allergy.");
    }
  };

  return (
    <>
      <BaseDeleteModal
        modalRef={modalRef}
        onSubmit={handleDeleteAllergy}
        closeModal={closeModal}
      />
    </>
  );
};

export default DeleteAllergyModal;
