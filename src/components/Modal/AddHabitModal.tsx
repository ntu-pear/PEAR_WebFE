import { useModal } from '@/hooks/useModal';
import { Button } from '../ui/button';

const AddHabitModal: React.FC = () => {
  const { modalRef, closeModal } = useModal();
  const handleAddHabit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Patient Habit Added!');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Habit</h3>
        <form onSubmit={handleAddHabit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Habits<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option value="Abnormal_Sleep_Cycle">Abnormal Sleep Cycle</option>
              <option value="Biting_Objects">Biting Objects</option>
              <option value="Crack_Knuckles">Crack Knuckles</option>
              <option value="Daydreaming">Daydreaming</option>
              <option value="Fidget_with_Objects">Fidget with Objects</option>
              <option value="Frequent_Toilet_Visits">
                Frequent Toilet Visits
              </option>
              <option value="Hair_Fiddling">Hair Fiddling</option>
              <option value="Licking_Lips">Licking Lips</option>
              <option value="Pick_nose">Pick nose</option>
              <option value="Scratch_People">Scratch People</option>
              <option value="Skip_meals">Skip meals</option>
              <option value="Sleep_Walking">Sleep Walking</option>
              <option value="Snacking">Snacking</option>
              <option value="Talking_to_onese">Talking to oneself</option>
              <option value="Thumb_Sucking">Thumb Sucking</option>
              <option value="Worrying">Worrying</option>
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

export default AddHabitModal;
