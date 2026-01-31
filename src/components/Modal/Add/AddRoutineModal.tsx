import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import { Activity, listActivities } from "@/api/activities/activities";
import dayjs from "dayjs";
import { addPatientRoutine, AddRoutine } from "@/api/activity/routine";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { toast } from "sonner";

const AddRoutineModal: React.FC = () => {
  const { modalRef, closeModal, activeModal } = useModal();
  const { id } = useViewPatient();
  const { refreshRoutineData } = activeModal.props as {
    refreshRoutineData: () => void;
  };
  const [routineActivities, setRoutineActivities] = useState<Activity[]>([])
  const [startTime, setStartTime] = useState(dayjs().tz("Asia/Singapore").format("HH:mm"))
  const [endTime, setEndTime] = useState(dayjs().tz("Asia/Singapore").add(1, "hour").format("HH:mm"))
  const [timeError, setTimeError] = useState("")
  const [startDate, setStartDate] = useState(dayjs().tz("Asia/Singapore").format("YYYY-MM-DD"))
  const [endDate, setEndDate] = useState(dayjs().tz("Asia/Singapore").add(1, "day").format("YYYY-MM-DD"))
  const [dateError, setDateError] = useState("")

  const fetchActivities = async () => {
    const response = await listActivities()
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "start_time") {
      const newStartTime = value
      setStartTime(newStartTime)

      // If start time is after or equal to end time, adjust end time
      if (newStartTime >= endTime) {
        const [hours, minutes] = newStartTime.split(':')
        const adjustedEndTime = dayjs()
          .hour(parseInt(hours))
          .minute(parseInt(minutes))
          .add(1, 'hour')
          .format('HH:mm')
        setEndTime(adjustedEndTime)
      }
      return
    }
    if (name === "end_time") {
      setEndTime(value)
      return
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
  }

  const handleAddRoutine = async (event: React.FormEvent) => {
    event.preventDefault();
    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);
    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());
    if (formDataObj.start_time >= formDataObj.end_time) return
    if (formDataObj.start_date >= formDataObj.end_date) return
    const selectedActivity = routineActivities.find(r => r.id === Number(formDataObj.activityId as string));
    if (!selectedActivity) {
      console.error("Activity not found");
      return;
    }
    const routine: AddRoutine = {
      name: selectedActivity.title,
      activity_id: Number(formDataObj.activityId as string),
      patient_id: Number(id),
      day_of_week: Number(formDataObj.day_of_week as string),
      start_time: formDataObj.start_time as string,
      end_time: formDataObj.end_time as string,
      start_date: formDataObj.start_date as string,
      end_date: formDataObj.end_date as string
    }
    try {
      await addPatientRoutine(routine)
      toast.success("Patient Routine added Successfully.")
      console.log("Patient Routine Added!");
      refreshRoutineData()
      closeModal()
    }
    catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to add Patient Routine.${error.message}`)
      }
      else {
        toast.error(`Failed to add Patient Routine.${error}`)
      }
      console.log("Failed to add Patient Routine.", error)
      closeModal()
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Routine</h3>
        <form onSubmit={handleAddRoutine} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Routine Activity<span className="text-red-600">*</span>
            </label>
            <select
              name="activityId"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              {
                routineActivities.map((activity) => (
                  <option key={activity.id} value={activity.id}>{activity.title}</option>
                ))
              }
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Day of the Week <span className="text-red-600">*</span>
            </label>
            <select
              name="day_of_week"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select a day</option>
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
              <option value="7">Sunday</option>
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
            <Button type="submit">Add</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoutineModal;
