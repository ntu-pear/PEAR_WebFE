import { Button } from "../../ui/button";

interface BaseDeleteModalProps {
  modalRef: React.RefObject<HTMLDivElement>;
  onSubmit: (event: React.FormEvent) => Promise<void> | void;
  closeModal: () => void;
}

const BaseDeleteModal: React.FC<BaseDeleteModalProps> = ({
  modalRef,
  onSubmit,
  closeModal,
}) => {
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    await onSubmit(e);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background rounded-md w-[500px]">
        <div className="bg-destructive p-4">
          <h3 className="text-lg font-medium text-destructive-foreground">
            Are you sure?
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <p className="mb-6 text-gray-600 dark:text-gray-200 text-center">
            Deleting this item is irreversible. Please confirm your action.
          </p>
          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button  type="button" variant="outline" onClick={closeModal}>
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

export default BaseDeleteModal;
