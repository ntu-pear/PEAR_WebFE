import { Button } from '../ui/button';
import ModalProps from './types';

const AddLikeModal: React.FC<ModalProps> = ({ modalRef, closeModal }) => {
  const handleAddLike = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Patient Like Added!');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Like</h3>
        <form onSubmit={handleAddLike} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Likes<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option value="Animals_Pets_Wildlife">
                Animals/Pets/Wildlife
              </option>
              <option value="Consume_alcohol">Consume alcohol</option>
              <option value="Cooking_Food">Cooking/Food</option>
              <option value="Dance">Dance</option>
              <option value="Dirty_environment">Dirty environment</option>
              <option value="Drama_Theatre">Drama/Theatre</option>
              <option value="Exercise_Sports">Exercise/Sports</option>
              <option value="Friends_Social_activities">
                Friends/Social activities
              </option>
              <option value="Gambling">Gambling</option>
              <option value="Gardening_plants">Gardening/plants</option>
              <option value="Mannequin_Dolls">Mannequin/Dolls</option>
              <option value="Movie_TV">Movie/TV</option>
              <option value="Music_Singing">Music/Singing</option>
              <option value="Natural_Scenery">Natural Scenery</option>
              <option value="Noisy_environment">Noisy environment</option>
              <option value="Reading">Reading</option>
              <option value="Religious_activities">Religious activities</option>
              <option value="Science_Technology">Science/Technology</option>
              <option value="Smoking">Smoking</option>
              <option value="Travelling_Sightseeing">
                Travelling/Sightseeing
              </option>
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

export default AddLikeModal;
