import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { toast } from "sonner";
import { AddMedicalHistory, Diagnosis, fetchDiagnosisList } from "@/api/patients/medicalHistory";
import { useEffect, useState } from "react";

const AddMedicalHistoryModal: React.FC = () => {
  const { modalRef, closeModal, activeModal } = useModal();
  const [diagnosisList, setDiagnosisList] = useState<Diagnosis[]>([])
  const { patientId, submitterId, refreshData } = activeModal.props as {
    patientId: string;
    submitterId: string;
    refreshData: () => void;
  };
  const handleAddMedicalHistory = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement)
    const formDataObj = Object.fromEntries(formData.entries())

    const newHistory: AddMedicalHistory = {
      PatientID: Number(patientId),
      MedicalDiagnosisID: Number(formDataObj.DiagnosisListID),
      DateOfDiagnosis: formDataObj.DateOfDiagnosis as string,
      Remarks: formDataObj.Remarks as string,
      SourceOfInformation: formDataObj.SourceOfInformation as string,
      CreatedByID: submitterId,
      ModifiedByID: submitterId
    }
    try {
      await AddMedicalHistory(newHistory)
      console.log("new History", newHistory)
      console.log("Patient Medical History added!");
      toast.success("Sucessfully added Patient Medical History")
      refreshData();
      closeModal();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to add medical history. ${error.message}`);
      } else {
        toast.error(
          "Failed to add medical history. An unknown error occurred."
        );
      }
      console.error(error)
      console.log("Failed to add medical history")
      closeModal();
    }
  };

  useEffect(() => {
    const fetchDiagnosisID = async () => {
      const response = await fetchDiagnosisList()
      console.log(response)
      setDiagnosisList(response)
    }
    fetchDiagnosisID()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Medical History</h3>
        <form
          onSubmit={handleAddMedicalHistory}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Diagnosis Name<span className="text-red-600">*</span>
            </label>
            <select
              name="DiagnosisListID"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              {diagnosisList.map((diagnosis) => (
                <option key={diagnosis.Id} value={diagnosis.Id}>
                  {diagnosis.DiagnosisName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Source of Information<span className="text-red-600">*</span>
            </label>
            <input
              name="SourceOfInformation"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Diagnosis Remarks<span className="text-red-600">*</span>
            </label>
            <textarea name="Remarks" className="mt-1 block w-full p-2 border rounded-md text-gray-900" required />
          </div>

          <div className="col-span-2">
            <div>
              <label className="block text-sm font-medium">
                Date of Diagnosis <span className="text-red-600">*</span>
              </label>
              <input
                name="DateOfDiagnosis"
                type="date"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                max={new Date().toISOString().split("T")[0]}
                required
              >
              </input>
            </div>
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

export default AddMedicalHistoryModal;
