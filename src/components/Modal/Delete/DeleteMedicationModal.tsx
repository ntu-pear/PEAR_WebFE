import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import { useEffect, useState } from "react";
import BaseDeleteModal from "./BaseDeleteModal";
import {
  deletePatientMedication,
  fetchMedicationById,
  IMedication,
} from "@/api/patients/medication";

const DeleteMedicationModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { medicationId, refreshMedicationData } = activeModal.props as {
    medicationId: string;
    refreshMedicationData: () => void;
  };
  const [medication, setMedication] = useState<IMedication | null>(null);

  const handlefetchMedicationById = async (medicationId: string) => {
    if (!medicationId || isNaN(Number(medicationId))) return;

    const response = await fetchMedicationById(Number(medicationId));
    setMedication(response.data);
  };

  const handleDeleteMedication = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!medicationId || isNaN(Number(medicationId))) return;

    if (!medication) return;

    try {
      await deletePatientMedication(Number(medicationId));
      closeModal();
      toast.success("Medication deleted successfully.");
      refreshMedicationData();
    } catch (error) {
      console.log(error);
      closeModal();
      toast.error("Failed to delete patient prescription.");
    }
  };

  useEffect(() => {
    handlefetchMedicationById(medicationId);
  }, []);

  return (
    <>
      <BaseDeleteModal
        modalRef={modalRef}
        onSubmit={handleDeleteMedication}
        closeModal={closeModal}
      />
    </>
  );
};

export default DeleteMedicationModal;
