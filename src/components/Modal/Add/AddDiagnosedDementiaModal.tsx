import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AddDementiaForm,
  addDiagnosedDementa,
  DementiaStageType,
  DementiaType,
  fetchDementiaStageList,
  fetchDementiaTypeList,
} from "@/api/patients/diagnosedDementia";
import { getDateTimeNowInUTC } from "@/utils/formatDate";

const AddDiagnosedDementiaModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { patientId, submitterId, refreshData } = activeModal.props as {
    patientId: string;
    submitterId: string;
    refreshData: () => void;
  };

  const [dementiaTypes, setDementiaTypes] = useState<DementiaType[]>([]);
  const [dementiaStageTypes, setDementiaStageTypes] = useState<DementiaStageType[]>([]);

  const handleFetchDementiaType = async () => {
    try {
      const fetchedDementiaTypes: DementiaType[] =
        await fetchDementiaTypeList();
      const activeDementiaTypes = fetchedDementiaTypes.filter(dt => dt.IsDeleted === '0')
      setDementiaTypes(activeDementiaTypes);
      const fetchedDementiaStageTypes: DementiaStageType[]=await fetchDementiaStageList();
      const activeDementiaStageTypes = fetchedDementiaStageTypes.filter((st)=>st.IsDeleted==='0')
      setDementiaStageTypes(activeDementiaStageTypes)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch Dementia Types List");
    }
  };

  const handleAddDementia = async (event: React.FormEvent) => {
    event.preventDefault();

    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);

    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());

    const dementiaFormData: AddDementiaForm = {
      IsDeleted: "0",
      PatientId: parseInt(patientId as string, 10),
      DementiaTypeListId: parseInt(
        formDataObj.DementiaTypeListId as string,
        10
      ),
      DementiaStageId: parseInt(formDataObj.DementiaStageListId as string, 10),
      CreatedDate: getDateTimeNowInUTC() as string,
      ModifiedDate: getDateTimeNowInUTC() as string,
      CreatedById: submitterId as string,
      ModifiedById: submitterId as string,
    };

    try {
      await addDiagnosedDementa(dementiaFormData);
      closeModal();
      toast.success("Diagnosed dementia assigned successfully.");
      refreshData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(`Failed to assign diagnosed dementia.`);
      closeModal();
    }
  };

  useEffect(() => {
    handleFetchDementiaType();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Assign Diagnosed Dementia</h3>
        <form onSubmit={handleAddDementia} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Diagnosed Dementia<span className="text-red-600">*</span>
            </label>
            <select
              name="DementiaTypeListId"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              {dementiaTypes.map((dt) => (
                <option
                  key={dt.DementiaTypeListId}
                  value={dt.DementiaTypeListId}
                >
                  {dt.Value}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Dementia Stage<span className="text-red-600">*</span>
            </label>
            <select
              name="DementiaStageListId"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              {dementiaStageTypes.map((st) => (
                <option
                  key={st.id}
                  value={st.id}
                >
                  {st.DementiaStage}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Assign</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDiagnosedDementiaModal;
