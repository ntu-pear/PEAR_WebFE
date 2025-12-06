import { Button } from "../../ui/button";
import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import { fetchAddress } from "@/api/geocode";

const RetrieveAddressModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { fieldName, handleUpdateAddressField } = activeModal.props as {
    fieldName: string;
    handleUpdateAddressField: (
      fieldName: string,
      searchedAddress: string
    ) => void;
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);

    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());
    const postalCode = parseInt(formDataObj.postalCode as string, 10);
    const unitNumber = formDataObj.unitNumber as string;
    try {
      const response = await fetchAddress(
        postalCode,
        encodeURIComponent(unitNumber)
      );
      console.log("fetched full address", response.fullAddress);
      handleUpdateAddressField(fieldName, response.fullAddress);
      closeModal();
      toast.success("Address retrieved successfully.");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();
      toast.error("Failed to retrieve address.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Retrieve Address</h3>
        <form onSubmit={handleSearch} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Postal Code <span className="text-red-600">*</span>
            </label>
            <input
              name="postalCode"
              type="text"
              pattern="^\d{6}$"
              title="Postal code must be a valid 6-digit Singapore postal code"
              minLength={6}
              maxLength={6}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Unit Number</label>
            <input
              name="unitNumber"
              type="text"
              placeholder="#01-123"
              pattern="^$|#\d{2}-\d{3}"
              title="Unit Number should follow #XX-YYY format, where X is floor and Y is unit number"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
            />
          </div>

          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Retrieve</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RetrieveAddressModal;
