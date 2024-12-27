import { Button } from '../ui/button';
import ModalProps from './types';

const AddMobilityAidModal: React.FC<ModalProps> = ({
  modalRef,
  closeModal,
}) => {
  const handleAddMobilityAids = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Patient Mobility Aids added!');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Mobility Aids</h3>
        <form
          onSubmit={handleAddMobilityAids}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Mobility Aids<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option value="Cane">Cane</option>
              <option value="Crutches">Crutches</option>
              <option value="Gait_trainers">Gait trainers</option>
              <option value="Scooter">Scooter</option>
              <option value="Walkers">Walkers</option>
              <option value="Wheelchairs">Wheelchairs</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Remark<span className="text-red-600">*</span>
            </label>
            <textarea
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Condition<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option value="Fully_Recovered">Fully Recovered</option>
              <option value="Not_Recovered">Not Recovered</option>
            </select>
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

export default AddMobilityAidModal;
