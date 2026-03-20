import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect, useRef, useState } from "react";
import { Activity, listActivities, createActivity } from "@/api/activities/activities";
import dayjs from "dayjs";
import { addPatientRoutine, AddRoutine } from "@/api/activity/routine";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { toast } from "sonner";
import { ChevronDown, Plus, X } from "lucide-react";
import { Day, DayHours, WorkingHours } from "@/types/careCentre";
import { getCareCentreById } from "@/api/careCentre";

const DAYS_OF_WEEK = [
  { label: "Monday",    value: 1  },  
  { label: "Tuesday",   value: 2  },  
  { label: "Wednesday", value: 4  },  
  { label: "Thursday",  value: 8  },  
  { label: "Friday",    value: 16 },  
  { label: "Saturday",  value: 32 },  
  { label: "Sunday",    value: 64 }, 
];

const DAY_KEY_MAP: Record<number, Day> = {
  1:  "monday",
  2:  "tuesday",
  4:  "wednesday",
  8:  "thursday",
  16: "friday",
  32: "saturday",
  64: "sunday",
};

const isDayOpen = (hours: DayHours) => !!hours.open && !!hours.close;

const buildTimeSlots = (open: string, close: string): { value: string; label: string }[] => {
  const slots: { value: string; label: string }[] = [];
  let [h, m] = open.split(":").map(Number);
  const [endH, endM] = close.split(":").map(Number);

  while (h < endH || (h === endH && m <= endM)) {
    const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const period = h < 12 ? "AM" : "PM";
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const label = `${display}:${String(m).padStart(2, "0")} ${period}`;
    slots.push({ value, label });
    m += 30;
    if (m >= 60) { m = 0; h++; }
  }
  return slots;
};


const AddRoutineModal: React.FC = () => {
  const { modalRef, closeModal, activeModal } = useModal();
  const { id } = useViewPatient();
  const { refreshRoutineData } = activeModal.props as {
    refreshRoutineData: () => void;
  };

  const [routineActivities, setRoutineActivities] = useState<Activity[]>([]);

  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null);

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [daysError, setDaysError] = useState("");

  const handleDayToggle = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
    setDaysError("");
  };

  const getEffectiveRange = (days: number[]): { open: string; close: string } => {
    if (!workingHours) return { open: "09:00", close: "17:00" };

    const activeDays = days
      .map((d) => workingHours[DAY_KEY_MAP[d]])
      .filter((h): h is DayHours => !!h && isDayOpen(h));

    if (activeDays.length === 0) return { open: "09:00", close: "17:00" };

    const open  = activeDays.reduce((latest, h)   => h.open!  > latest ? h.open!  : latest,   "00:00");
    const close = activeDays.reduce((earliest, h) => h.close! < earliest ? h.close! : earliest, "23:59");
    return { open, close };
  };

  const { open: rangeOpen, close: rangeClose } = getEffectiveRange(selectedDays);
  const TIME_SLOTS = buildTimeSlots(rangeOpen, rangeClose);

  const [startTime, setStartTime] = useState(rangeOpen);
  const [endTime, setEndTime]     = useState(() => {
    const [h, m] = rangeOpen.split(":").map(Number);
    const next = m + 30 >= 60
      ? `${String(h + 1).padStart(2, "0")}:00`
      : `${String(h).padStart(2, "0")}:30`;
    return next <= rangeClose ? next : rangeClose;
  });

  useEffect(() => {
    if (TIME_SLOTS.length === 0) return;
    const values = TIME_SLOTS.map(s => s.value);
    if (!values.includes(startTime)) setStartTime(values[0]);
    if (!values.includes(endTime))   setEndTime(values[values.length - 1]);
  }, [rangeOpen, rangeClose]);

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
  const [pendingNewActivity, setPendingNewActivity] = useState<{
    name: string;
    description: string;
  } | null>(null);

  const fetchActivities = async () => {
    const response = await listActivities();
    setRoutineActivities(response);
  };

  const fetchWorkingHours = async () => {
    const response = await getCareCentreById();
    setWorkingHours(response.working_hours ?? null);
  };

  useEffect(() => {
    fetchActivities();
    fetchWorkingHours();
  }, []);

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
    if (name === "start_date") {
      setStartDate(value);
    } else if (name === "end_date") {
      setEndDate(value);
    }
  };

  const handleAddRoutine = async (event: React.FormEvent) => {
    event.preventDefault();

    if (startTime >= endTime) return;
    if (startDate >= endDate) return;

    if (selectedDays.length === 0) {
      setDaysError("Please select at least one day.");
      return;
    }

    if (!selectedActivity && !pendingNewActivity) {
      toast.error("Please select or create an activity.");
      return;
    }

    try {
      let activityId: number;
      let activityName: string;

      if (pendingNewActivity) {
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

      const dayBitmask = selectedDays.reduce((acc, day) => acc | day, 0);

      const routine: AddRoutine = {
        name: activityName,
        activity_id: activityId,
        patient_id: Number(id),
        day_of_week: dayBitmask,
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
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                            selectedActivity?.id === activity.id ? "bg-blue-100 font-medium" : ""
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
                  </label>
                  <textarea
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
            <div className="mt-2 grid grid-cols-2 gap-y-1">
              {DAYS_OF_WEEK.map((day) => {
                const hours = workingHours?.[DAY_KEY_MAP[day.value]];
                const closed = !workingHours || !hours || !isDayOpen(hours);
                return (
                  <label
                    key={day.value}
                    className={`flex items-center gap-2 text-sm cursor-pointer ${
                      closed ? "text-gray-300 cursor-not-allowed" : "text-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day.value)}
                      onChange={() => handleDayToggle(day.value)}
                      disabled={closed}
                      className="accent-blue-600 w-4 h-4 disabled:opacity-40"
                    />
                    {day.label}
                    {closed && <span className="text-xs text-gray-300">(Closed)</span>}
                  </label>
                );
              })}
            </div>
            {daysError && <p className="text-red-600 text-sm mt-1">{daysError}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Time Slot <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex-1 p-2 border rounded-md text-gray-900 text-sm"
              >
                {TIME_SLOTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              <span className="text-gray-500 font-medium">-</span>

              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex-1 p-2 border rounded-md text-gray-900 text-sm"
              >
                {TIME_SLOTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
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