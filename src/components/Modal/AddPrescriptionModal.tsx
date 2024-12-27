import { Button } from '../ui/button';
import ModalProps from './types';

const AddPrescriptionModal: React.FC<ModalProps> = ({
  modalRef,
  closeModal,
}) => {
  const handleAddPrescription = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Patient Medical Prescription Added!');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
        <h3 className="text-lg font-medium mb-5">Add Medical Prescription</h3>
        <form
          onSubmit={handleAddPrescription}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium">
              Prescription<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select a option</option>
              <option value="Acetaminophen">Acetaminophen</option>
              <option value="Antihistamines">Antihistamines</option>
              <option value="Antihistamines">Antihistamines</option>
              <option value="Dextromethorphan">Dextromethorphan</option>
              <option value="Diphenhydramine">Diphenhydramine</option>
              <option value="Donepezil">Donepezil</option>
              <option value="Galantamine">Galantamine</option>
              <option value="Guaifenesin">Guaifenesin</option>
              <option value="Ibuprofen">Ibuprofen</option>
              <option value="Memantine">Memantine</option>
              <option value="Olanzapine">Olanzapine</option>
              <option value="Paracetamol">Paracetamol</option>
              <option value="Rivastigmine">Rivastigmine</option>
              <option value="Salbutamol">Salbutamol</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              To be taken<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select a option</option>
              <option value="After_Meal">After Meal</option>
              <option value="Before_Meal">Before Meal</option>
              <option value="NA">Doesn't Matter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Dosage<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Frequency per day<span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium">
              Period<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select a option</option>
              <option value="Short_Term">Short Term</option>
              <option value="Long_Term">Long Term</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Instruction<span className="text-red-600">*</span>
            </label>
            <textarea
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-2 flex space-x-4">
            <div className="w-full">
              <label className="block text-sm font-medium">
                Start Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              />
            </div>
            <div className="w-full">
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

          <div className="col-span-2 ">
            <label className="block text-sm font-medium">
              Remark<span className="text-red-600">*</span>
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

export default AddPrescriptionModal;
