import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import BaseDeleteModal from "./BaseDeleteModal";
import { deleteDoctorNote } from "@/api/patients/doctorNote";

const DeleteDoctorNoteModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { noteId, refreshData } = activeModal.props as {
    noteId: string;
    refreshData: () => void;
  };

  const handleDeleteDoctorNote = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!noteId || isNaN(Number(noteId))) return;
    try {
      await deleteDoctorNote(Number(noteId));
      closeModal();
      toast.success("Doctor note deleted successfully.");
      refreshData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();
      toast.error("Failed to delete doctor note.");
    }
  };

  return (
    <>
      <BaseDeleteModal
        modalRef={modalRef}
        onSubmit={handleDeleteDoctorNote}
        closeModal={closeModal}
      />
    </>
  );
};

export default DeleteDoctorNoteModal;
