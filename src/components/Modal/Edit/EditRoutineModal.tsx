import React from "react";
import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import { Activity, listActivities } from "@/api/activities/activities";
import dayjs from "dayjs";
import { editPatientRoutine, EditRoutine, RoutinesTD } from "@/api/activity/routine";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { toast } from "sonner";

const EditRoutineModal: React.FC = () => {
    const dayLabelMap: Record<string, number> = {
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6,
        "Sunday": 7,
    };
    const { modalRef, closeModal, activeModal } = useModal();
    const { id } = useViewPatient();
    const { routine, refreshRoutineData } = activeModal.props as {
        routine: RoutinesTD
        refreshRoutineData: () => void;
    };
    const [rowData, setRowData] = useState<RoutinesTD>(routine)
    const [routineActivities, setRoutineActivities] = useState<Activity[]>([])
    const [startTime, setStartTime] = useState(() => {
        const parsed = dayjs(routine.start_time, "hh:mm A");
        return parsed.isValid() ? parsed.format("HH:mm") : "00:00";
    });
    const [endTime, setEndTime] = useState(() => {
        const parsed = dayjs(routine.end_time, "hh:mm A");
        return parsed.isValid() ? parsed.format("HH:mm") : "00:00";
    });
    const [timeError, setTimeError] = useState("")
    const [startDate, setStartDate] = useState(dayjs(routine.start_date).format("YYYY-MM-DD"))
    const [endDate, setEndDate] = useState(dayjs(routine.end_date).format("YYYY-MM-DD"))
    const [dateError, setDateError] = useState("")

    const fetchActivities = async () => {
        const response = await listActivities({ include_deleted: true })
        setRoutineActivities(response)
    }

    useEffect(() => {
        fetchActivities()
    }, [])

    useEffect(() => {
        if (startTime && endTime && startTime >= endTime) {
            setTimeError("Start time must be before end time")
        } else {
            setTimeError("")
        }
    }, [startTime, endTime])

    useEffect(() => {
        if (startDate && endDate && startDate >= endDate) {
            setDateError("Start date must be before or equal to end date")
        } else {
            setDateError("")
        }
    }, [startDate, endDate])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "start_time") {
            const newStartTime = value
            setStartTime(newStartTime);

            if (newStartTime >= endTime) {
                const start = dayjs(`1970-01-01 ${newStartTime}`)
                const proposedEnd = start.add(1, "hour")

                // Check if adding 1 hour crosses midnight
                if (start.hour() === 23 || proposedEnd.hour() < start.hour()) {
                    setEndTime("23:59")
                } else {
                    setEndTime(proposedEnd.format("HH:mm"))
                }
            }
            return
        }
        if (name === "end_time") {
            setEndTime(value);
            return;
        }
        if (name === "start_date") {
            const newStartDate = value
            setStartDate(newStartDate)

            // If start date is after end date, adjust end date
            if (newStartDate >= endDate) {
                setEndDate(newStartDate)
            }
            return
        }
        if (name === "end_date") {
            setEndDate(value)
            return
        }
        if (name === "day_of_week") {
            setRowData(prev => ({
                ...prev,
                [name]: value,
            }))
        }
    }

    const handleAddRoutine = async (event: React.FormEvent) => {
        event.preventDefault();
        // Create a new FormData object from the event's target
        const formData = new FormData(event.target as HTMLFormElement);
        // Convert FormData entries to an object
        const formDataObj = Object.fromEntries(formData.entries());
        if (formDataObj.start_time >= formDataObj.end_time) return
        if (formDataObj.start_date >= formDataObj.end_date) return

        const routine: EditRoutine = {
            name: rowData.name,
            activity_id: Number(rowData.activityId),
            patient_id: Number(id),
            day_of_week: dayLabelMap[formDataObj.day_of_week as string],
            start_time: formDataObj.start_time as string,
            end_time: formDataObj.end_time as string,
            start_date: formDataObj.start_date as string,
            end_date: formDataObj.end_date as string,
            id: Number(rowData.id)
        }
        try {
            await editPatientRoutine(routine)
            toast.success("Patient Routine edit Successfully.")
            console.log("Patient Routine Edited!");
            refreshRoutineData()
            closeModal()
        }
        catch (error) {
            if (error instanceof Error) {
                toast.error(`Failed to edit Patient Routine.${error.message}`)
            }
            else {
                toast.error(`Failed to edit Patient Routine.`)
            }
            console.log("Failed to edit Patient Routine.", error)
            closeModal()
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
                <h3 className="text-lg font-medium mb-5">Edit Routine</h3>
                <div className="col-span-2 mb-4">
                    <label className="block text-sm font-medium">
                        Routine Activity<span className="text-red-600">*</span>
                    </label>
                    <input
                        value={routineActivities.find(activity => activity.id === routine.activityId)?.title}
                        name="activity_id"
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        readOnly
                    />
                </div>

                <form onSubmit={handleAddRoutine} className="grid grid-cols-2 gap-4">

                    <div className="col-span-2">
                        <label className="block text-sm font-medium">
                            Day of the Week <span className="text-red-600">*</span>
                        </label>
                        <select
                            name="day_of_week"
                            className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                            required
                            value={rowData.day_of_week}
                            onChange={handleChange}
                        >
                            <option value="">Please select a day</option>
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium">
                            Time Slot <span className="text-red-600">*</span>
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                name="start_time"
                                type="time"
                                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                required
                                value={startTime}
                                onChange={handleChange}
                            />
                            <span className="text-gray-500 font-medium">-</span>
                            <input
                                name="end_time"
                                type="time"
                                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                required
                                value={endTime}
                                onChange={handleChange}
                            />
                        </div>
                        {timeError && (
                            <p className="text-red-600 text-sm mt-1">{timeError}</p>
                        )}
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium">
                            Start Date - End Date <span className="text-red-600">*</span>
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                name="start_date"
                                type="date"
                                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                required
                                value={startDate}
                                onChange={handleChange}
                                min={dayjs().tz("Asia/Singapore").format("YYYY-MM-DD")}
                            />
                            <span className="text-gray-500 font-medium">-</span>
                            <input
                                name="end_date"
                                type="date"
                                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                required
                                value={endDate}
                                onChange={handleChange}
                                min={dayjs().tz("Asia/Singapore").format("YYYY-MM-DD")}
                            />
                        </div>
                        {dateError && (
                            <p className="text-red-600 text-sm mt-1">{dateError}</p>
                        )}
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
    );
};

export default EditRoutineModal;
