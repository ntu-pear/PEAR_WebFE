import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import {
  addMobilityAid,
  AddMobilityAid,
  fetchMobilityList,
  MobilityList,
} from "@/api/patients/mobility";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const AddMobilityAidModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const [mobilityList, setMobilityList] = useState<MobilityList[]>([]);
  const { patientId, submitterId, refreshMobilityData } = activeModal.props as {
    patientId: string;
    submitterId: string;
    refreshMobilityData: () => void;
  };

  const handleFetchMobilityList = async () => {
    try {
      const fetchedMobilityList: MobilityList[] = await fetchMobilityList();
      setMobilityList(fetchedMobilityList);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch Mobility List");
    }
  };

  const handleAddMobilityAids = async (event: React.FormEvent) => {
    event.preventDefault();

    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);

    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());

    const allergyFormData: AddMobilityAid = {
      PatientID: parseInt(patientId as string, 10),
      MobilityListId: parseInt(formDataObj.MobilityListId as string, 10),
      MobilityRemarks: formDataObj.MobilityRemarks as string,
      IsRecovered: formDataObj.IsRecovered === "true",
      CreatedById: submitterId as string,
      ModifiedById: submitterId as string,
    };

    try {
      await addMobilityAid(allergyFormData);
      closeModal();
      toast.success("Patient mobility aid Added.");
      refreshMobilityData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();
      toast.error("Failed to add patient mobility aid.");
    }
  };

  useEffect(() => {
    handleFetchMobilityList();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Mobility Aids</h3>
        <form
          onSubmit={handleAddMobilityAids}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Mobility Aids<span className="text-red-600">*</span>
            </label>
            <select
              name="MobilityListId"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              {mobilityList.map((ml) => (
                <option key={ml.MobilityListId} value={ml.MobilityListId}>
                  {ml.Value}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Remark<span className="text-red-600">*</span>
            </label>
            <textarea
              name="MobilityRemarks"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Condition<span className="text-red-600">*</span>
            </label>
            <select
              name="IsRecovered"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option value="false">Not Recovered</option>
              <option value="true">Fully Recovered</option>
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

export default AddMobilityAidModal;
