import { deleteVital } from "@/api/patients/vital";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background rounded-md w-[500px]">
        <div className="bg-destructive p-4">
          <h3 className="text-lg font-medium text-destructive-foreground">
            Are you sure?
          </h3>
        </div>

        <form onSubmit={handleDeleteVital} className="p-4">
          <p className="mb-6 text-gray-600 dark:text-gray-200 text-center">
            Deleting this item is irreversible. Please confirm your action.
          </p>
          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Delete
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteVitalModal;
