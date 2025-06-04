import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import { deleteUserProfilePhotoByAdmin } from "@/api/users/user";
import BaseDeleteModal from "./BaseDeleteModal";
import { AxiosError } from "axios";

const DeleteProfilePhotoModalAdmin: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { refreshProfile, userId, accountName } = activeModal.props as {
    refreshProfile: () => void;
    userId: string;
    accountName: string;
  };

  const handleDeletePhoto = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await deleteUserProfilePhotoByAdmin(userId);
      refreshProfile();
      closeModal();
      toast.success(`Deleted profile photo for ${accountName} successfully.`);
    } catch (error) {
      closeModal();

      if (error instanceof AxiosError) {
        if (error.response?.status && error.response?.data?.detail) {
          toast.error(
            `Failed to delete profile photo for ${accountName}. Error ${error.response?.status}: ${error.response?.data?.detail}`
          );
        } else {
          toast.error(
            `Error ${error.response?.status}: Failed to delete profile photo for ${accountName}.`
          );
        }
      } else {
        toast.error(`Failed to delete profile photo for ${accountName}.`);
      }
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

export default DeleteProfilePhotoModalAdmin;
