import { useModal } from '@/hooks/useModal';
import { Button } from '../ui/button';

const AddAllergyModal: React.FC = () => {
  const { modalRef, closeModal } = useModal();
  const handleAddAllergy = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Patient Allergy Added!');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Allergy</h3>
        <form onSubmit={handleAddAllergy} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Allergy<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option value="Corn">Corn</option>
              <option value="Fish">Fish</option>
              <option value="Eggs">Eggs</option>
              <option value="Meat">Meat</option>
              <option value="Milk">Milk</option>
              <option value="Peanuts">Peanuts</option>
              <option value="Seafood">Seafood</option>
              <option value="Shellfish">Shellfish</option>
              <option value="Soy">Soy</option>
              <option value="Tree_nuts">Tree nuts</option>
              <option value="Wheat">Wheat</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Allergy Reaction<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option value="Abdominal_cramp_or_pain">
                Abdominal cramp or pain
              </option>
              <option value="Diarrhea">Diarrhea</option>
              <option value="Difficulty_Breathing">Difficulty Breathing</option>
              <option value="Hives">Hives</option>
              <option value="Itching">Itching</option>
              <option value="Nasal_Congestion">Nasal Congestion</option>
              <option value="Nausea">Nausea</option>
              <option value="Rashes">Rashes</option>
              <option value="Sneezing">Sneezing</option>
              <option value="Swelling">Swelling</option>
              <option value="Vomiting">Vomiting</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Notes<span className="text-red-600">*</span>
            </label>
            <textarea className="mt-1 block w-full p-2 border rounded-md text-gray-900" />
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

export default AddAllergyModal;
