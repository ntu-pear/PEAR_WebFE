import { editProblemLog, EditProblemLog, ProblemLogTD } from "@/api/patients/problemLog"
import { useModal } from "@/hooks/useModal"
import { useEffect, useState } from "react"
import { Button } from "../../ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useViewPatient } from "@/hooks/patient/useViewPatient";

const EditProblemModal = () => {
    const { modalRef, activeModal, closeModal } = useModal()
    const { problemLog, refreshData } = activeModal.props as {
        problemLog: ProblemLogTD,
        refreshData: () => void
    }
    const [rowData, setRowData] = useState<ProblemLogTD>(problemLog)
    const { currentUser } = useAuth()
    const { id } = useViewPatient()

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
    }

    useEffect(() => {
        console.log(problemLog.Id)
    })

    const handleEditProblem = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!currentUser?.userId) {
            console.error("User not logged in");
            return;
        }
        try {
            const formData = new FormData(event.target as HTMLFormElement)
            const formDataObj = Object.fromEntries(formData.entries())
            const problem: EditProblemLog = {
                PatientID: Number(id),
                ProblemListID: rowData.ProblemListID,
                DateOfDiagnosis: formDataObj.DateOfDiagnosis as string,
                ProblemRemarks: rowData.ProblemRemarks,
                SourceOfInformation: rowData.SourceOfInformation
            }
            await editProblemLog(problemLog.Id, problem)
            toast.success("Sucessfully update problem log")
            await refreshData()
            closeModal()
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Failed to update problem log. ${error}`)
            } else {
                toast.error("Failed to update problem log")
            }
            console.error("Failed to update problem log")
            closeModal()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]" onSubmit={handleEditProblem}>
                <h3 className="text-lg font-medium mb-5">Edit Problem Log</h3>
                <div className="col-span-2 mb-4">
                    <label className="block text-sm font-medium">
                        Problem Name
                    </label>
                    <input
                        name="ProblemName"
                        value={problemLog.ProblemName}
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        readOnly>
                    </input>
                </div>
                <form className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">
                            Source of Information <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="SourceOfInformation"
                            className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                            value={rowData.SourceOfInformation}
                            required
                            onChange={(e) => setRowData((prev) => ({ ...prev, SourceOfInformation: e.target.value }))}
                        >
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
                            value={rowData.ProblemRemarks}
                            onChange={(e) => setRowData((prev) => ({ ...prev, ProblemRemarks: e.target.value }))}
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
                            value={formatDate(rowData.DateOfDiagnosis)}
                            onChange={(e) => setRowData((prev) => ({ ...prev, DateOfDiagnosis: e.target.value }))}
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
    )
}

export default EditProblemModal