import { Button } from '../ui/button';
import ModalProps from './types';

const EditSocialHistoryModal: React.FC<ModalProps> = ({
  modalRef,
  closeModal,
}) => {
  const handleEditSocialHistory = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Patient Social History Updated!');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
        <h3 className="text-lg font-medium mb-5">Edit Social History</h3>
        <form
          onSubmit={handleEditSocialHistory}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium">
              Caffeine Use<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="-">Not to Tell</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Occupation <span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="-">Not to tell</option>
              <option value="Accountant">Accountant</option>
              <option value="Actor">Actor</option>
              <option value="Artist">Artist</option>
              <option value="Business_owner">Business owner</option>
              <option value="Chef/Cook">Chef/Cook</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Clerk">Clerk</option>
              <option value="Dentist">Dentist</option>
              <option value="Doctor">Doctor</option>
              <option value="Driver">Driver</option>
              <option value="Engineer">Engineer</option>
              <option value="Fireman">Fireman</option>
              <option value="Florist">Florist</option>
              <option value="Gardener">Gardener</option>
              <option value="Hawker">Hawker</option>
              <option value="Homemaker">Homemaker</option>
              <option value="Housekeeper">Housekeeper</option>
              <option value="Labourer">Labourer</option>
              <option value="Lawyer">Lawyer</option>
              <option value="Manager">Manager</option>
              <option value="Mechanic">Mechanic</option>
              <option value="Nurse">Nurse</option>
              <option value="Policeman">Policeman</option>
              <option value="Professional_sportsperson">
                Professional sportsperson
              </option>
              <option value="Professor">Professor</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Sales_person">Sales person</option>
              <option value="Scientist">Scientist</option>
              <option value="Secretary">Secretary</option>
              <option value="Security_guard">Security guard</option>
              <option value="Singer">Singer</option>
              <option value="Teacher">Teacher</option>
              <option value="Trader">Trader</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Vet">Vet</option>
              <option value="Waiter">Waiter</option>
              <option value="Zoo_keeper">Zoo keeper</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Diet</label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="-">Not to tell</option>
              <option value="Diabetic">Diabetic</option>
              <option value="Gluten_free">Gluten-free</option>
              <option value="Halal">Halal</option>
              <option value="No_Cheese">No Cheese</option>
              <option value="No_Dairy">No Dairy</option>
              <option value="No_Meat">No Meat</option>
              <option value="No_Peanuts">No Peanuts</option>
              <option value="No_Seafood">No Seafood</option>
              <option value="No_Vegetables">No Vegetables</option>
              <option value="Soft_food">Soft food</option>
              <option value="Vegan">Vegan</option>
              <option value="Vegetarian">Vegetarian</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Pet
              <span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="-">Not to Tell</option>
              <option value="Bird">Bird</option>
              <option value="Cat">Cat</option>
              <option value="Dog">Dog</option>
              <option value="Fish">Fish</option>
              <option value="Guinea_Pig">Guinea Pig</option>
              <option value="Hamster">Hamster</option>
              <option value="Hedgehog">Hedgehog</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Spider">Spider</option>
              <option value="Tortoise">Tortoise</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Drug Use
              <span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="-">Not to Tell</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Religion
              <span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="-">Not to Tell</option>
              <option value="Atheist">Atheist</option>
              <option value="Buddhist">Buddhist</option>
              <option value="Catholic">Catholic</option>
              <option value="Christian">Christian</option>
              <option value="Confucianism">Confucianism</option>
              <option value="Free_Thinker">Free Thinker</option>
              <option value="Hindu">Hindu</option>
              <option value="Islam">Islam</option>
              <option value="Judaism">Judaism</option>
              <option value="Protestantism">Protestantism</option>
              <option value="Shinto">Shinto</option>
              <option value="Shintoist">Shintoist</option>
              <option value="Sikhism">Sikhism</option>
              <option value="Spiritism">Spiritism</option>
              <option value="Taoist">Taoist</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Education<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="-">Not to Tell</option>
              <option value="Primary_or_lower">Primary or lower</option>
              <option value="Secondary">Secondary</option>
              <option value="ITE">ITE</option>
              <option value="Junior_College">Junior College</option>
              <option value="Diploma">Diploma</option>
              <option value="Degree">Degree</option>
              <option value="Master">Master</option>
              <option value="Doctorate">Doctorate</option>
              <option value="Vocational">Vocational</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Secondhand Smoker<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="-">Not to Tell</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Exercise<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="-">Not to Tell</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Sexually Active
              <span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="-">Not to Tell</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Live With
              <span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="-">Not to Tell</option>
              <option value="Alone">Alone</option>
              <option value="Children">Children</option>
              <option value="Family">Family</option>
              <option value="Friend">Friend</option>
              <option value="Parents">Parents</option>
              <option value="Relative">Relative</option>
              <option value="Spouse">Spouse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Tobacoo Use
              <span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="-">Not to Tell</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSocialHistoryModal;
