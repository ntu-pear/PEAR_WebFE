import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import { AddPersonalPreference, addPersonalPreferennce, getPersonalPreferenceList, Preference } from "@/api/patients/personalPreference";
import { toast } from "sonner";
import { useViewPatient } from "@/hooks/patient/useViewPatient";

const AddLikeDislikeModal: React.FC = () => {
  const { modalRef, closeModal, activeModal } = useModal();
  const { refreshData } = activeModal.props as {
    refreshData: () => void
  }
  const { id } = useViewPatient()
  const [preferenceList, setPreferenceList] = useState<Preference[]>([])

  const handleAddLike = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement)
    const formDataObj = Object.fromEntries(formData.entries())
    const newPreference: AddPersonalPreference = {
      PatientID: Number(id),
      PersonalPreferenceListID: Number(formDataObj.PersonalPreferenceListID as string),
      IsLike: formDataObj.IsLike as string,
      PreferenceRemarks: formDataObj.PreferenceRemarks as string
    }
    try {
      await addPersonalPreferennce(newPreference)
      toast.success("New Patient Like/Dislike Added.")
      console.log("New Patient Like/Dislike Added.")
      refreshData()
      closeModal()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to add new Patient Like/Dislike. ${error}`)
      } else {
        toast.error("Failed to add new Patient Like/Dislike.")
      }
      console.error("Failed to add new Patient Like/Dislike")
    }
    closeModal()
  };

  useEffect(() => {
    const fetchPreferenceList = async () => {
      try {
        const response = await getPersonalPreferenceList("LikesDislikes")
        setPreferenceList(response)
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Failed to fetch Preference List (Likes/Dislikes). ${error}`)
        } else {
          toast.error("Failed to fetch Preference List (Likes/Dislikes).")
        }
        console.error("Failed to fetch Preference List (Likes/Dislikes).")
      }
    }
    fetchPreferenceList()
  }, [])


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Like/Dislike</h3>
        <form onSubmit={handleAddLike} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Preference Name<span className="text-red-600">*</span>
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
              Like/Dislike<span className="text-red-600">*</span>
            </label>
            <div className="flex gap-2 mt-2">
              <input type="radio" name="IsLike" value="Y" required   ></input>
              <label className="text-green-600 font-medium">Like</label>
              <input type="radio" name="IsLike" value="N"></input>
              <label className="text-orange-600 font-medium">Dislike</label>
            </div>
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

export default AddLikeDislikeModal;
