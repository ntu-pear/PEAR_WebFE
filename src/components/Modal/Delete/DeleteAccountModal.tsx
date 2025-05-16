import { Button } from "../../ui/button";
import { useModal } from "@/hooks/useModal";
import { deleteUserById } from "@/api/admin/user";

const DeleteAccountModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { accountId, refreshAccountData } = activeModal.props as {
    accountId: string;
    refreshAccountData: () => Promise<void>;
  };

  const handleDelete = async () => {
    try {
      await deleteUserById(accountId);
      closeModal();
      await refreshAccountData();
    } catch (error) {
      console.error("Failed to delete account", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background rounded-md w-[500px]">
        <div className="p-4">
          <h3>Are you sure you want to delete this account?</h3>
          <div className="mt-5 flex justify-end">
            <Button className="bg-red-500 mr-1" onClick={handleDelete}>
              Yes
            </Button>
            <Button className="bg-blue-500" onClick={() => closeModal()}>
              No
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
