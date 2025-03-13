import { deleteVital } from "@/api/patients/vital";
import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import BaseDeleteModal from "./BaseDeleteModal";

const DeleteVitalModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { vitalId, refreshVitalData } = activeModal.props as {
    vitalId: string;
    refreshVitalData: () => void;
  };

  const handleDeleteVital = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vitalId || isNaN(Number(vitalId))) return;
    try {
      await deleteVital(Number(vitalId));
      closeModal();
      toast.success("Vital deleted successfully.");
      refreshVitalData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();
      toast.error("Failed to delete patient vital.");
    }
  };

  return (
    <>
      <BaseDeleteModal
        modalRef={modalRef}
        onSubmit={handleDeleteVital}
        closeModal={closeModal}
      />
    </>
  );
};

export default DeleteVitalModal;
