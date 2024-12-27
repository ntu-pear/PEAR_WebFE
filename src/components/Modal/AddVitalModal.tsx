import { Button } from '../ui/button';
import ModalProps from './types';

const AddVitalModal: React.FC<ModalProps> = ({ modalRef, closeModal }) => {
  const handleAddVital = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Patient Vital Added!');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
        <h3 className="text-lg font-medium mb-5">Add Vital</h3>
        <form onSubmit={handleAddVital} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Temperature (°C)<span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min={35}
              max={43}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Weight (kg)<span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Height (m)<span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min={0}
              max={2.5}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Systolic BP (mmHg)<span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min={70}
              max={160}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Diastolic BP (mmHg)<span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min={40}
              max={120}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Heart Rate (bpm)<span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min={0}
              max={300}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              SpO2 (%)<span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min={60}
              max={120}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Blood Sugar Level (mmol/L)
              <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min={50}
              max={250}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-2 ">
            <label className="block text-sm font-medium">
              Vital Remark<span className="text-red-600">*</span>
            </label>
            <textarea
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium">
              After Meal<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select a option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
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

export default AddVitalModal;
