import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useState, useEffect } from "react";
import { AddPersonalPreference, addPersonalPreferennce, getPersonalPreferenceList, Preference } from "@/api/patients/personalPreference";
import { toast } from "sonner";

const AddHabitModal: React.FC = () => {
  const { modalRef, closeModal, activeModal } = useModal();
  const { refreshData } = activeModal.props as {
    refreshData: () => void
  }
  const { id } = useViewPatient()
  const [preferenceList, setPreferenceList] = useState<Preference[]>([])

  const handleAddHabit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement)
    const formDataObj = Object.fromEntries(formData.entries())
    const newPreference: AddPersonalPreference = {
      PatientID: Number(id),
      PersonalPreferenceListID: Number(formDataObj.PersonalPreferenceListID as string),
      IsLike: null,
      PreferenceRemarks: formDataObj.PreferenceRemarks as string
    }
    try {
      await addPersonalPreferennce(newPreference)
      toast.success("New Patient Habit Added.")
      console.log("New Patient Habit Added.")
      await refreshData()
      closeModal()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to add new Patient Habit. ${error}`)
      } else {
        toast.error("Failed to add new Patient Habit.")
      }
      console.error("Failed to add new Patient Habit")
    }
    closeModal()
  };

  useEffect(() => {
    const fetchPreferenceList = async () => {
      try {
        const response = await getPersonalPreferenceList("Habit")
        setPreferenceList(response)
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Failed to fetch Preference List (Habits). ${error}`)
        } else {
          toast.error("Failed to fetch Preference List (Habits).")
        }
        console.error("Failed to fetch Preference List (Habits).")
      }
    }
    fetchPreferenceList()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Habit</h3>
        <form onSubmit={handleAddHabit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Habit Name<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900 overflow-auto"
              required
              name="PersonalPreferenceListID"
            >
              {
                preferenceList.map((preference) => (
                  <option key={preference.Id} value={preference.Id}>
                    {preference.PreferenceName}
                  </option>
                ))
              }
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Remarks<span className="text-red-600">*</span>
            </label>
            <textarea name="PreferenceRemarks" className="mt-1 block w-full p-2 border rounded-md text-gray-900" required />
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

export default AddHabitModal;
