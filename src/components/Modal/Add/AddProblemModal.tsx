import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import { addPatientProblemLog, AddProblemLog, getProblemList, ProblemList } from "@/api/patients/problemLog";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { toast } from "sonner";

const AddProblemModal: React.FC = () => {
  const { modalRef, closeModal, activeModal } = useModal();
  const [problemList, setProblemList] = useState<ProblemList[]>()
  const { id } = useViewPatient()
  const { refreshData } = activeModal.props as {
    refreshData: () => void
  }
  const handleAddProblem = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement)
    const formDataObj = Object.fromEntries(formData.entries())
    const newProblemLog: AddProblemLog = {
      PatientID: Number(id),
      ProblemListID: Number(formDataObj.ProblemListID),
      DateOfDiagnosis: formDataObj.DateOfDiagnosis as string,
      ProblemRemarks: formDataObj.ProblemRemarks as string,
      SourceOfInformation: formDataObj.SourceOfInformation as string
    }
    try {
      await addPatientProblemLog(newProblemLog)
      console.log("Patient Problem Added!");
      toast.success("Sucessfully added Patient Problem Log")
      await refreshData();
      closeModal();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to add Problem Log. ${error}`)
      } else {
        toast.error('Failed to add Problem Log')
      }
      console.error("Failed to add medical history")
      closeModal()
    }
  };

  useEffect(() => {
    const fetchProblemList = async () => {
      try {
        const list = await getProblemList()
        setProblemList(list)
      } catch (error) {

      }
    }
    fetchProblemList()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Problem Log</h3>
        <form onSubmit={handleAddProblem} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Problem Name<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              name="ProblemListID"
              required
            >
              <option value="">Please select an option</option>
              {
                problemList?.map((list) => (
                  <option key={list.Id} value={list.Id}>{list.ProblemName}</option>
                ))
              }
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Source of Information <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="SourceOfInformation"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required>
            </input>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Remarks<span className="text-red-600">*</span>
            </label>
            <textarea
              name="ProblemRemarks"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Date of Diagnosis<span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="DateOfDiagnosis"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
              max={new Date().toISOString().split("T")[0]}
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

export default AddProblemModal;
