import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import { toast } from "sonner";

const AddActivityModal: React.FC = () => {
  const { modalRef, closeModal } = useModal();

  const handleAddActivity = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success("Centre Activity Added!");
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Centre Activity</h3>
        <form onSubmit={handleAddActivity} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              Activity Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Activity Description <span className="text-red-600">*</span>
            </label>
            <textarea
              className="mt-1 block w-full p-2 border rounded-md min-h-[100px] text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Fixed Time Slots <span className="text-red-600">*</span>
            </label>
            <textarea
              className="mt-1 block w-full p-2 border rounded-md min-h-[100px] text-gray-900"
              required
            />
          </div>

          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium">
                Start Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                End Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Is Compulsory? <span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Is Fixed? <span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Is Group? <span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddActivityModal;
