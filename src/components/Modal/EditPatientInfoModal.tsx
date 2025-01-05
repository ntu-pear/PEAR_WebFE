import { useModal } from '@/hooks/useModal';
import { Button } from '../ui/button';

const EditPatientInfoModal: React.FC = () => {
  const { modalRef, closeModal } = useModal();

  const handleEditInformation = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Patient Information updated!');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-background p-8 rounded-md w-[600px] max-h-screen overflow-y-auto"
      >
        <h3 className="text-lg font-medium mb-5">Edit Patient Information</h3>
        <form
          onSubmit={handleEditInformation}
          className="grid grid-cols-2 gap-4"
        >
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
              Hand Phone Number
            </label>
            <input
              type="text"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Home Number</label>
            <input
              type="number"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
            />
          </div>

          {/* Permanent Address Section */}
          <div className="col-span-2">
            <div className="p-4 rounded-lg border">
              <h3 className="font-medium mb-2">New Address</h3>
              <div className="grid grid-cols-8 gap-x-4 sm:gap-y-4 mb-2">
                <div className="space-y-2 col-span-2">
                  <label className="block text-sm font-medium">
                    Postal Code <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                    required
                  />
                </div>
                <div className="space-y-2 col-span-3">
                  <label className="col-span-3 block text-sm font-medium">
                    Unit Number
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  />
                </div>
                <div className="space-y-2 col-span-4 sm:col-span-3">
                  <Button type="button" className="mt-7 col-span-2 mr-2">
                    Retrieve
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="mt-7 col-span-1"
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium">
                  Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                />
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="p-4 rounded-lg border">
              <h3 className="font-medium mb-2">New Temporary Address</h3>
              <div className="grid grid-cols-8 gap-x-4 sm:gap-y-4 mb-2">
                <div className="space-y-2 col-span-2">
                  <label className="block text-sm font-medium">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                    required
                  />
                </div>
                <div className="space-y-2 col-span-3">
                  <label className="col-span-3 block text-sm font-medium">
                    Unit Number
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  />
                </div>
                <div className="space-y-2 col-span-4 sm:col-span-3">
                  <Button type="button" className="mt-7 col-span-2 mr-2">
                    Retrieve
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="mt-7 col-span-1"
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="col-span-2 mt-4">
                <label className="block text-sm font-medium">
                  Temporary Address
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                />
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Privacy Level<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Patient Preferred Language
              <span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option value="Cantonese">Cantonese</option>
              <option value="English">English</option>
              <option value="Hakka">Hakka</option>
              <option value="Hindi">Hindi</option>
              <option value="Hokkien">Hokkien</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
              <option value="Malay">Malay</option>
              <option value="Mandarin">Mandarin</option>
              <option value="Spanish">Spanish</option>
              <option value="Tamil">Tamil</option>
              <option value="Teochew">Teochew</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Under Respite Care<span className="text-red-600">*</span>
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

          <div>
            <label className="block text-sm font-medium">
              Patient Still Active<span className="text-red-600">*</span>
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

export default EditPatientInfoModal;
