import { toast } from "sonner";
import BaseDeleteModal from "./BaseDeleteModal";
import { useModal } from "@/hooks/useModal";

const DeleteActivityModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { activityId } = activeModal.props as { activityId: number };

  const handleDeleteActivity = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Deleted activity with ID:", activityId);
    toast.success("Centre Activity Deleted!");
    closeModal();
  };

  return (
    <>
      <BaseDeleteModal
        modalRef={modalRef}
        onSubmit={handleDeleteActivity}
        closeModal={closeModal}
      />
    </>
  );
};

export default DeleteActivityModal;
