import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import {
  deletePatientPrescription,
  fetchPrescriptionById,
  Prescription,
} from "@/api/patients/prescription";
import { useEffect, useState } from "react";
import BaseDeleteModal from "./BaseDeleteModal";

const DeletePrescriptionModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { prescriptionId, refreshPrescriptionData } = activeModal.props as {
    prescriptionId: string;
    submitterId: string;
    refreshPrescriptionData: () => void;
  };
  const [prescription, setPrescription] = useState<Prescription | null>(null);

  const handlefetchPrescriptionById = async (prescriptionId: string) => {
    if (!prescriptionId || isNaN(Number(prescriptionId))) return;

    const response = await fetchPrescriptionById(Number(prescriptionId));
    setPrescription(response.data);
  };

  const handleDeletePrescription = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prescriptionId || isNaN(Number(prescriptionId))) return;

    if (!prescription) return;

    try {
      await deletePatientPrescription(Number(prescriptionId));
      closeModal();
      toast.success("Prescription deleted successfully.");
      refreshPrescriptionData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();
      toast.error("Failed to delete patient prescription.");
    }
  };

  useEffect(() => {
    handlefetchPrescriptionById(prescriptionId);
  }, []);

  return (
    <>
      <BaseDeleteModal
        modalRef={modalRef}
        onSubmit={handleDeletePrescription}
        closeModal={closeModal}
      />
    </>
  );
};

export default DeletePrescriptionModal;
