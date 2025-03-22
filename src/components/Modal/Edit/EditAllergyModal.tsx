import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import {
  AllergyAutoFill,
  AllergyReactionType,
  AllergyType,
  AllergyUpdateFormData,
  fetchAllAllergyReactionTypes,
  fetchAllAllergyTypes,
  fetchPatientAllergyById,
  updatePatientAllergy,
  ViewAllergyReactionTypeList,
  ViewAllergyTypeList,
} from "@/api/patients/allergy";
import { toast } from "sonner";

const EditAllergyModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { allergyId, patientId, refreshAllergyData } = activeModal.props as {
    allergyId: string;
    patientId: string;
    refreshAllergyData: () => void;
  };
  const [rowData, setRowData] = useState<AllergyAutoFill | null>(null);
  const [allergyTypes, setAllergyTypes] = useState<AllergyType[]>([]);
  const [allergyReactionTypes, setAllergyReactionTypes] = useState<
    AllergyReactionType[]
  >([]);

  const handleFetchPatientAllergyById = async () => {
    if (!patientId || isNaN(Number(patientId))) return;
    if (!allergyId || isNaN(Number(allergyId))) return;
    try {
      const fetchedAllergyAutoFill = await fetchPatientAllergyById(
        Number(patientId),
        Number(allergyId)
      );
      setRowData(fetchedAllergyAutoFill);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch Patient Allergy");
    }
  };

  const handleFetchAllergyType = async () => {
    try {
      const response: ViewAllergyTypeList = await fetchAllAllergyTypes();
      setAllergyTypes(response.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch Allergy Types List");
    }
  };

  const handleFetchAllergyReactionType = async () => {
    try {
      const response: ViewAllergyReactionTypeList =
        await fetchAllAllergyReactionTypes();
      setAllergyReactionTypes(response.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch Allergy Reaction Types List");
    }
  };

  const handleEditAllergy = async (event: React.FormEvent) => {
    event.preventDefault();

    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);

    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());

    const allergyFormData: AllergyUpdateFormData = {
      AllergyRemarks: formDataObj.AllergyRemarks as string,
      IsDeleted: "0",
      Patient_AllergyID: parseInt(allergyId as string, 10),
      AllergyTypeID: parseInt(formDataObj.AllergyTypeID as string, 10),
      AllergyReactionTypeID: parseInt(
        formDataObj.AllergyReactionTypeID as string,
        10
      ),
    };

    console.log("update allergyFormData", allergyFormData);

    try {
      await updatePatientAllergy(Number(patientId), allergyFormData);
      closeModal();
      toast.success("Patient allergy updated successfully.");
      refreshAllergyData();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update patient allergy. ${error.message}`);
      } else {
        // Fallback error handling for unknown error types
        toast.error(
          "Failed to update patient allergy. An unknown error occurred."
        );
      }
    }
  };

  useEffect(() => {
    handleFetchAllergyType();
    handleFetchAllergyReactionType();
    handleFetchPatientAllergyById();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Edit Allergy</h3>
        <form onSubmit={handleEditAllergy} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Allergy<span className="text-red-600">*</span>
            </label>
            <select
              name="AllergyTypeID"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={rowData?.AllergyTypeID}
              onChange={(e) =>
                setRowData({
                  ...rowData,
                  AllergyTypeID: Number(e.target.value),
                })
              }
              required
            >
              <option value="">Please select an option</option>
              {allergyTypes.map((at) => (
                <option key={at.AllergyTypeID} value={at.AllergyTypeID}>
                  {at.Value}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Allergy Reaction<span className="text-red-600">*</span>
            </label>
            <select
              name="AllergyReactionTypeID"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={rowData?.AllergyReactionTypeID}
              onChange={(e) =>
                setRowData({
                  ...rowData,
                  AllergyReactionTypeID: Number(e.target.value),
                })
              }
              required
            >
              <option value="">Please select an option</option>
              {allergyReactionTypes.map((art) => (
                <option
                  key={art.AllergyReactionTypeID}
                  value={art.AllergyReactionTypeID}
                >
                  {art.Value}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Notes<span className="text-red-600">*</span>
            </label>
            <textarea
              name="AllergyRemarks"
              value={rowData?.AllergyRemarks}
              onChange={(e) =>
                setRowData({
                  ...rowData,
                  AllergyRemarks: e.target.value,
                })
              }
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
            />
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

export default EditAllergyModal;
