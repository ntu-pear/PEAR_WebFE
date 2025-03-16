import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import { deleteMobilityAid } from "@/api/patients/mobility";
import BaseDeleteModal from "./BaseDeleteModal";

const DeleteMobilityAidModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { mobilityAidId, refreshData } = activeModal.props as {
    mobilityAidId: string;
    refreshData: () => void;
  };

  const handleDeleteMobilityAid = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mobilityAidId || isNaN(Number(mobilityAidId))) return;
    try {
      await deleteMobilityAid(Number(mobilityAidId));
      refreshData();
      closeModal();
      toast.success("Patient mobility aid deleted successfully.");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();
      toast.error("Failed to delete patient mobility aid.");
    }
  };

  return (
    <>
      <BaseDeleteModal
        modalRef={modalRef}
        onSubmit={handleDeleteMobilityAid}
        closeModal={closeModal}
      />
    </>
  );
};

export default DeleteMobilityAidModal;
