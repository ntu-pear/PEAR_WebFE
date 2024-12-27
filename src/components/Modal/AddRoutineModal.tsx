import { Button } from '../ui/button';
import ModalProps from './types';

const AddRoutineModal: React.FC<ModalProps> = ({ modalRef, closeModal }) => {
  const handleAddRoutine = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Patient Routine Added!');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Routine</h3>
        <form onSubmit={handleAddRoutine} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Routine Activity<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option value="Lunch">Lunch</option>
              <option value="Breathing+Vital Check">
                Breathing+Vital Check
              </option>
              <option value="Board Games">Board Games</option>
              <option value="Movie Screening">Movie Screening</option>
              <option value="Brisk Walking">Brisk Walking</option>
              <option value="Mahjong">Mahjong</option>
              <option value="Musical Instrument Lesson">
                Musical Instrument Lesson
              </option>
              <option value="Story Time">Story Time</option>
              <option value="Physiotherapy">Physiotherapy</option>
              <option value="String beads">String beads</option>
              <option value="Sewing">Sewing</option>
              <option value="Cup Stacking Game">Cup Stacking Game</option>
              <option value="Sort poker chips">Sort poker chips</option>
              <option value="Origami">Origami</option>
              <option value="Picture Coloring">Picture Coloring</option>
              <option value="Clip Coupons">Clip Coupons</option>
              <option value="Cutting Pictures">Cutting Pictures</option>
              <option value="Watch television">Watch television</option>
              <option value="Act1">Act1</option>
              <option value="Leslie history routine">
                Leslie history routine
              </option>
              <option value="Leslie geography routine">
                Leslie geography routine
              </option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Routine time slots <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Include in schedule?<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">Routine Issues</label>
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

export default AddRoutineModal;
