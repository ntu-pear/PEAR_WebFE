import { useModal } from '@/hooks/useModal';
import { Button } from '../ui/button';

const AddProblemModal: React.FC = () => {
  const { modalRef, closeModal } = useModal();
  const handleAddProblem = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Patient Problem Added!');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Problem</h3>
        <form onSubmit={handleAddProblem} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Problem<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option value="Behavior">Behavior</option>
              <option value="Communication">Communication</option>
              <option value="Delusion">Delusion</option>
              <option value="Emotion">Emotion</option>
              <option value="Health">Health</option>
              <option value="Memory">Memory</option>
              <option value="Sleep">Sleep</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Notes<span className="text-red-600">*</span>
            </label>
            <textarea
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
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

export default AddProblemModal;
