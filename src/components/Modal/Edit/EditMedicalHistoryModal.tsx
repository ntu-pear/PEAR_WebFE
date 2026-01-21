import { updateMedicalHistory, MedicalHistoryTD } from "@/api/patients/medicalHistory";
import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const EditMedicalHistoryModal: React.FC = () => {
    const { modalRef, activeModal, closeModal } = useModal();
    const { medicalHistory, refreshData } = activeModal.props as {
        medicalHistory: MedicalHistoryTD,
        refreshData: () => void
    }
    const [history, setHistory] = useState(medicalHistory)
    const { currentUser } = useAuth()

    const formatDateForInput = (dateStr: string) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handleEditMedicalHistory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.userId) {
            console.error("User not logged in");
            return;
        }
        try {
            await updateMedicalHistory(history, currentUser.userId)
            await refreshData()
            toast.success("Patient Medical History updated successfully.")
            closeModal();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Failed to update medical history. ${error.message}`);
            } else {
                toast.error(
                    "Failed to update medical history. An unknown error occurred."
                );
            }
            console.error(error)
            console.log("Failed to update medical history")
            closeModal();
        }
    }

    useEffect(() => {
        formatDateForInput(history.date_of_diagnosis)
    }, [])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
                <h3 className="text-lg font-medium mb-5">Edit Medical History</h3>
                <div className="col-span-2 mb-4">
                    <label className="block text-sm font-medium">Diagnosis Name</label>
                    <input
                        name="MobilityAids"
                        value={history.diagnosis_name}
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        readOnly
                    />
                </div>
                <form
                    onSubmit={handleEditMedicalHistory}
                    className="grid grid-cols-2 gap-4"
                >
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">
                            Source of Information<span className="text-red-600">*</span>
                        </label>
                        <input
                            name="MobilityRemarks"
                            value={history.source_of_information}
                            onChange={(e) => { setHistory({ ...history, source_of_information: e.target.value }) }}
                            className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">
                            Diagnosis Remarks<span className="text-red-600">*</span>
                        </label>
                        <textarea
                            name="MobilityRemarks"
                            value={history.remarks}
                            onChange={(e) => { setHistory({ ...history, remarks: e.target.value }) }}
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
                            className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                            value={formatDateForInput(history.date_of_diagnosis)}
                            max={new Date().toISOString().split("T")[0]}
                            required
                            onChange={(e) => { setHistory({ ...history, date_of_diagnosis: e.target.value }) }}
                        >
                        </input>
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
    )
}

export default EditMedicalHistoryModal