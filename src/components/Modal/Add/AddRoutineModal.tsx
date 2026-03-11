import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect, useRef, useState } from "react";
import { Activity, listActivities, createActivity } from "@/api/activities/activities";
import dayjs from "dayjs";
import { addPatientRoutine, AddRoutine } from "@/api/activity/routine";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { toast } from "sonner";
import { ChevronDown, Plus, X } from "lucide-react";

const AddRoutineModal: React.FC = () => {
  const { modalRef, closeModal, activeModal } = useModal();
  const { id } = useViewPatient();
  const { refreshRoutineData } = activeModal.props as {
    refreshRoutineData: () => void;
  };

  const [routineActivities, setRoutineActivities] = useState<Activity[]>([]);
  const [startTime, setStartTime] = useState(dayjs().tz("Asia/Singapore").format("HH:mm"));
  const [endTime, setEndTime] = useState(dayjs().tz("Asia/Singapore").add(1, "hour").format("HH:mm"));
  const [timeError, setTimeError] = useState("");
  const [startDate, setStartDate] = useState(dayjs().tz("Asia/Singapore").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().tz("Asia/Singapore").add(1, "day").format("YYYY-MM-DD"));
  const [dateError, setDateError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityDescription, setNewActivityDescription] = useState("");
  // Stores confirmed-but-not-yet-submitted new activity details
  const [pendingNewActivity, setPendingNewActivity] = useState<{
    name: string;
    description: string;
  } | null>(null);

  const fetchActivities = async () => {
    const response = await listActivities();
    setRoutineActivities(response);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (startTime && endTime && startTime >= endTime) {
      setTimeError("Start time must be before end time");
    } else {
      setTimeError("");
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (startDate && endDate && startDate >= endDate) {
      setDateError("Start date must be before or equal to end date");
    } else {
      setDateError("");
    }
  }, [startDate, endDate]);

  const filteredActivities = routineActivities.filter((activity) =>
    activity.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    // Clear any pending new activity since user picked an existing one
    setPendingNewActivity(null);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const handleConfirmNewActivity = () => {
    if (!newActivityName.trim()) {
      toast.error("Activity name is required.");
      return;
    }
    if (!newActivityDescription.trim()) {
      toast.error("Activity description is required.");
      return;
    }
    setPendingNewActivity({
      name: newActivityName.trim(),
      description: newActivityDescription.trim(),
    });
    setSelectedActivity(null);
    setShowCreateActivity(false);
  };

  const handleCancelNewActivity = () => {
    setShowCreateActivity(false);
    setNewActivityName("");
    setNewActivityDescription("");
  };

  const handleClearPendingActivity = () => {
    setPendingNewActivity(null);
    setNewActivityName("");
    setNewActivityDescription("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "start_time") {
      setStartTime(value);
      if (value >= endTime) {
        const [hours, minutes] = value.split(":");
        const adjustedEndTime = dayjs()
          .hour(parseInt(hours))
          .minute(parseInt(minutes))
          .add(1, "hour")
          .format("HH:mm");
        setEndTime(adjustedEndTime);
      }
    } else if (name === "end_time") {
      setEndTime(value);
    } else if (name === "start_date") {
      setStartDate(value);
    } else if (name === "end_date") {
      setEndDate(value);
    }
  };

  const handleAddRoutine = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const formDataObj = Object.fromEntries(formData.entries());

    if (startTime >= endTime) return;
    if (startDate >= endDate) return;

    // Must have either an existing selection or a pending new activity
    if (!selectedActivity && !pendingNewActivity) {
      toast.error("Please select or create an activity.");
      return;
    }

    try {
      let activityId: number;
      let activityName: string;

      if (pendingNewActivity) {
        // Create the new activity first, then use its returned ID
        const created = await createActivity({
          title: pendingNewActivity.name,
          description: pendingNewActivity.description,
        });
        activityId = created.id;
        activityName = created.title;
      } else {
        activityId = selectedActivity!.id;
        activityName = selectedActivity!.title;
      }

      const routine: AddRoutine = {
        name: activityName,
        activity_id: activityId,
        patient_id: Number(id),
        day_of_week: Number(formDataObj.day_of_week as string),
        start_time: startTime,
        end_time: endTime,
        start_date: startDate,
        end_date: endDate,
      };

      await addPatientRoutine(routine);
      toast.success("Patient Routine added successfully.");
      refreshRoutineData();
      closeModal();
    } catch (error) {
      toast.error(`Failed to add Patient Routine. ${error instanceof Error ? error.message : error}`);
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Routine</h3>
        <form onSubmit={handleAddRoutine} className="grid grid-cols-2 gap-4">

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Routine Activity <span className="text-red-600">*</span>
            </label>

            <div className="relative mt-1" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between p-2 border rounded-md bg-white text-gray-900 text-sm"
              >
                <span className={selectedActivity ? "text-gray-900" : "text-gray-400"}>
                  {selectedActivity ? selectedActivity.title : "Select an activity..."}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search activities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full p-1.5 text-sm border rounded-md text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <ul className="max-h-40 overflow-y-auto">
                    {filteredActivities.length > 0 ? (
                      filteredActivities.map((activity) => (
                        <li
                          key={activity.id}
                          onClick={() => handleSelectActivity(activity)}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${selectedActivity?.id === activity.id ? "bg-blue-100 font-medium" : ""
                            }`}
                        >
                          {activity.title}
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-sm text-gray-400">No activities found.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {pendingNewActivity && (
              <div className="mt-2 flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                <div>
                  <p className="text-sm font-medium text-blue-800">{pendingNewActivity.name}</p>
                  <p className="text-xs text-blue-500">New activity — will be created on submit</p>
                </div>
                <button
                  type="button"
                  onClick={handleClearPendingActivity}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {!pendingNewActivity && (
              <button
                type="button"
                onClick={() => setShowCreateActivity((prev) => !prev)}
                className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                {showCreateActivity ? (
                  <><X className="w-3 h-3" /> Cancel</>
                ) : (
                  <><Plus className="w-3 h-3" /> Create new activity</>
                )}
              </button>
            )}

            {showCreateActivity && (
              <div className="mt-2 p-3 border rounded-md bg-gray-50 space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Activity Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newActivityName}
                    onChange={(e) => setNewActivityName(e.target.value)}
                    placeholder="e.g. Morning Walk"
                    className="mt-1 w-full p-2 text-sm border rounded-md text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Description <span className="text-red-600">*</span>
                  </label>                  <textarea
                    value={newActivityDescription}
                    onChange={(e) => setNewActivityDescription(e.target.value)}
                    placeholder="Optional description..."
                    rows={2}
                    className="mt-1 w-full p-2 text-sm border rounded-md text-gray-900 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelNewActivity}
                    className="flex-1 text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmNewActivity}
                    className="flex-1 text-sm"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            )}
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
              <input name="start_time" type="time" className="mt-1 block w-full p-2 border rounded-md text-gray-900" required value={startTime} onChange={handleChange} />
              <span className="text-gray-500 font-medium">-</span>
              <input name="end_time" type="time" className="mt-1 block w-full p-2 border rounded-md text-gray-900" required value={endTime} onChange={handleChange} />
            </div>
            {timeError && <p className="text-red-600 text-sm mt-1">{timeError}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Start Date - End Date <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input name="start_date" type="date" className="mt-1 block w-full p-2 border rounded-md text-gray-900" required value={startDate} onChange={handleChange} min={dayjs().tz("Asia/Singapore").format("YYYY-MM-DD")} />
              <span className="text-gray-500 font-medium">-</span>
              <input name="end_date" type="date" className="mt-1 block w-full p-2 border rounded-md text-gray-900" required value={endDate} onChange={handleChange} min={dayjs().tz("Asia/Singapore").format("YYYY-MM-DD")} />
            </div>
            {dateError && <p className="text-red-600 text-sm mt-1">{dateError}</p>}
          </div>

          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoutineModal;