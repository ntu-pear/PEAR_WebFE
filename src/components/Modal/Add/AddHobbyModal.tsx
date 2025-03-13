import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";

const AddHobbyModal: React.FC = () => {
  const { modalRef, closeModal } = useModal();
  const handleAddHobby = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Hobby Added!");
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Hobby</h3>
        <form onSubmit={handleAddHobby} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Hobbies<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option value="Bird_Watching">Bird Watching</option>
              <option value="Collecting">Collecting</option>
              <option value="Crafting">Crafting</option>
              <option value="Fishing">Fishing</option>
              <option value="Gardening">Gardening</option>
              <option value="Music">Music</option>
              <option value="Reading">Reading</option>
              <option value="Television">Television</option>
              <option value="Travelling">Travelling</option>
              <option value="Video_Games">Video Games</option>
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

export default AddHobbyModal;
