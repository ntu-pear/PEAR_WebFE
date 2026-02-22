import { useModal } from "@/hooks/useModal"
import { useState } from "react"
import { Button } from "../../ui/button";
import { addRoutineExclusion, AddRoutineExclusion } from "@/api/activity/routine";
import dayjs from "dayjs";
import { toast } from "sonner";

const AddRoutineExclusionModal: React.FC = () => {
    const { activeModal, modalRef, closeModal } = useModal()
    const { routineId, routine_startDate, routine_endDate, refreshRoutineExclusion } = activeModal.props as {
        routineId: number,
        routine_startDate: string,
        routine_endDate: string,
        refreshRoutineExclusion: () => void
    }
    const [startDateError, setStartDateError] = useState("")
    const [rowData, setRowData] = useState<AddRoutineExclusion>({
        routine_id: routineId,
        start_date: dayjs(routine_startDate).format("YYYY-MM-DD"),
        end_date: dayjs(routine_startDate).add(1, "days").format("YYYY-MM-DD"),
        remarks: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target
        if (name === "start_date") {
            const newStartDate = value
            const end = dayjs(rowData.end_date).format("YYYY-MM-DD")
            setRowData((prev) => ({
                ...prev,
                start_date: newStartDate,
            }))
            if (newStartDate >= end) {
                setStartDateError("Start date must be before end date")
            } else {
                setStartDateError("")
            }
        }
        if (name === "end_date") {
            const start = dayjs(rowData.start_date).format("YYYY-MM-DD")
            setRowData((prev) => ({
                ...prev,
                end_date: value,
            }))
            if (start >= value) {
                setStartDateError("Start date must be before end date")
            } else {
                setStartDateError("")
            }
        }
        if (name === "remarks") {
            setRowData((prev) => ({
                ...prev,
                remarks: value,
            }))
        }
    }

    const handleAddRoutineExclusion = async (event: React.FormEvent) => {
        event.preventDefault()
        if (startDateError) return
        const formData = new FormData(event.target as HTMLFormElement)
        const formDataObj = Object.fromEntries(formData.entries())
        const RoutineExclusion: AddRoutineExclusion = {
            routine_id: routineId,
            start_date: formDataObj.start_date as string,
            end_date: formDataObj.end_date as string,
            remarks: formDataObj.remarks as string
        }
        try {
            await addRoutineExclusion(RoutineExclusion)
            toast.success("Routine Exclusion added sucessfully.")
            refreshRoutineExclusion()
            closeModal()
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Failed to add Routine Exclusion. ${error.message}`)
            } else {
                toast.error("Failed to add Routine Exclusion.")
            }
            console.log("Failed to add Routine Exclusion.", error)
            closeModal()
        }
    }

    return (
        <div>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
                    <h3 className="text-lg font-medium mb-5">Add Routine Exclusion</h3>
                    <form className="grid grid-cols-2 gap-4" onSubmit={handleAddRoutineExclusion}>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium">
                                Start Date - End Date <span className="text-red-600">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    name="start_date"
                                    type="date"
                                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                    required
                                    value={dayjs(rowData.start_date).format("YYYY-MM-DD")}
                                    onChange={handleChange}
                                    min={dayjs(routine_startDate).tz("Asia/Singapore").format("YYYY-MM-DD")}
                                    max={dayjs(routine_endDate).tz("Asia/Singapore").format("YYYY-MM-DD")}
                                />
                                <span className="text-gray-500 font-medium">-</span>
                                <input
                                    name="end_date"
                                    type="date"
                                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                    required
                                    value={dayjs(rowData.end_date).format("YYYY-MM-DD")}
                                    onChange={handleChange}
                                    min={dayjs(routine_startDate).tz("Asia/Singapore").format("YYYY-MM-DD")}
                                    max={dayjs(routine_endDate).tz("Asia/Singapore").format("YYYY-MM-DD")}
                                />
                            </div>
                            {
                                startDateError && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {startDateError}
                                    </p>
                                )
                            }
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium">
                                Remarks <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                name="remarks"
                                value={rowData?.remarks || ""}
                                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                onChange={handleChange}
                                required
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
        </div>
    )
}

export default AddRoutineExclusionModal