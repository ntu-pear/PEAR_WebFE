import { EditPersonalPreference, EditPersonalPreferenceRequest, UpdatePersonalPreference } from "@/api/patients/personalPreference";
import { useModal } from "@/hooks/useModal";
import { useState } from "react";
import { Button } from "../../ui/button";
import { toast } from "sonner";

const EditLikeDislike: React.FC = () => {
    const { modalRef, closeModal, activeModal } = useModal();
    const { refreshData, editPreference } = activeModal.props as {
        refreshData: () => void
        editPreference: EditPersonalPreference
    }
    const [rowData, setRowData] = useState<EditPersonalPreference>(editPreference)

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        const editPreference: EditPersonalPreferenceRequest = {
            PatientID: rowData.PatientID,
            PersonalPreferenceListID: rowData.PersonalPreferenceListID,
            IsLike: rowData.IsLike,
            PreferenceRemarks: rowData.PreferenceRemarks
        }
        try {
            await UpdatePersonalPreference(rowData.id, editPreference)
            await refreshData()
            toast.success("Patient Personal Preference updated successfully.")
            closeModal();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Failed to update personal preference. ${error.message}`);
            } else {
                toast.error(
                    "Failed to update personal preference. An unknown error occurred."
                );
            }
            console.error(error)
            console.log("Failed to update personal preference")
            closeModal();
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
                <h3 className="text-lg font-medium mb-5">Edit Like/Dislike</h3>
                <div className="col-span-2">
                    <label className="block text-sm font-medium">
                        Preference Name<span className="text-red-600">*</span>
                    </label>
                    <input
                        name="PreferenceName"
                        value={rowData.PreferenceName}
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        readOnly
                    />
                </div>
                <form className="grid grid-cols-2 gap-4" onSubmit={handleEdit}>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">
                            Like/Dislike<span className="text-red-600">*</span>
                        </label>
                        <div className="flex gap-2 mt-2">
                            <input type="radio" name="IsLike" value="Y" required checked={rowData.IsLike === "Y"} onChange={(e) => setRowData((prev) => ({ ...prev, IsLike: e.target.value }))}></input>
                            <label className="text-green-600 font-medium">Like</label>
                            <input type="radio" name="IsLike" value="N" checked={rowData.IsLike === "N"} onChange={(e) => setRowData((prev) => ({ ...prev, IsLike: e.target.value }))}></input>
                            <label className="text-orange-600 font-medium">Dislike</label>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">
                            Remarks<span className="text-red-600">*</span>
                        </label>
                        <textarea value={rowData.PreferenceRemarks} onChange={(e) => setRowData((prev) => ({ ...prev, PreferenceRemarks: e.target.value }))} name="PreferenceRemarks" className="mt-1 block w-full p-2 border rounded-md text-gray-900" required />
                    </div>
                    <div className="col-span-2 mt-6 flex justify-end space-x-2">
                        <Button variant="outline" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button type="submit">Edit</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditLikeDislike