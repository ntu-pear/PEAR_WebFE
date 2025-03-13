import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";

const AddGuardianModal: React.FC = () => {
  const { modalRef, closeModal } = useModal();
  const handleAddGuardian = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Guardian Added!");
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
        <h3 className="text-lg font-medium mb-5">Add Guardian</h3>
        <form onSubmit={handleAddGuardian} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Preferred Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              NRIC <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Hand Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
            />
          </div>

          <div className="col-span-1 flex space-x-4">
            <div className="w-full">
              <label className="block text-sm font-medium">
                Date of Birth <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Address<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Temporary Address
            </label>
            <input
              type="text"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Relationship<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option value="Aunt">Aunt</option>
              <option value="Child">Child</option>
              <option value="Friend">Friend</option>
              <option value="Grandchild">Grandchild</option>
              <option value="Grandparent">Grandparent</option>
              <option value="Husband">Husband</option>
              <option value="Nephew">Nephew</option>
              <option value="Niece">Niece</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Uncle">Uncle</option>
              <option value="Wife">Wife</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
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

export default AddGuardianModal;
