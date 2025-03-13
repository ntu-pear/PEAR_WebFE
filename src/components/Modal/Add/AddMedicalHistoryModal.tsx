import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";

const AddMedicalHistoryModal: React.FC = () => {
  const { modalRef, closeModal } = useModal();
  const handleAddMedicalHistory = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Medical History added!");
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Medical History</h3>
        <form
          onSubmit={handleAddMedicalHistory}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Medical Details<span className="text-red-600">*</span>
            </label>
            <textarea
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Information Source<span className="text-red-600">*</span>
            </label>
            <textarea
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Medical Remark<span className="text-red-600">*</span>
            </label>
            <textarea className="mt-1 block w-full p-2 border rounded-md text-gray-900" />
          </div>

          <div className="col-span-2">
            <div>
              <label className="block text-sm font-medium">
                Medical Estimated Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              />
            </div>
          </div>

          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicalHistoryModal;
