import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import { deleteUserProfilePhoto } from "@/api/users/user";
import { deletePatientProfilePhoto } from "@/api/patients/patients";
import BaseDeleteModal from "./BaseDeleteModal";

const DeleteProfilePhotoModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { refreshProfile, isUser, patientId } = activeModal.props as {
    refreshProfile: () => void;
    isUser: boolean;
    patientId?: string;
  };

  const handleDeletePhoto = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (isUser) {
        await deleteUserProfilePhoto();
      } else {
        if (!patientId || isNaN(Number(patientId))) {
          throw "Invalid patient id.";
        }
        await deletePatientProfilePhoto(Number(patientId));
      }
      refreshProfile();
      closeModal();
      toast.success("User profile photo deleted successfully.");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();
      toast.error("Failed to delete user profile photo.");
    }
  };

  return (
    <>
      <BaseDeleteModal
        modalRef={modalRef}
        onSubmit={handleDeletePhoto}
        closeModal={closeModal}
      />
    </>
  );
};

export default DeleteProfilePhotoModal;
