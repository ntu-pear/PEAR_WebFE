import React from "react";
import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import { Activity, listActivities } from "@/api/activities/activities";
import dayjs from "dayjs";
import { editPatientRoutine, EditRoutine, RoutinesTD } from "@/api/activity/routine";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { toast } from "sonner";
import { getCareCentreById } from "@/api/careCentre";
import { Day, DayHours, WorkingHours } from "@/types/careCentre";

const DAYS_OF_WEEK = [
    { label: "Monday",    bit: 1  },
    { label: "Tuesday",   bit: 2  },
    { label: "Wednesday", bit: 4  },
    { label: "Thursday",  bit: 8  },
    { label: "Friday",    bit: 16 },
    { label: "Saturday",  bit: 32 },
    { label: "Sunday",    bit: 64 },
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

const parseDaysToBits = (dayString: string): number[] => {
    if (!dayString) return [];
    return dayString
        .split(", ")
        .map(label => DAYS_OF_WEEK.find(d => d.label === label)?.bit ?? 0)
        .filter(bit => bit !== 0);
};

const normaliseTime = (timeStr: string): string => {
    const parsed = dayjs(timeStr, ["hh:mm A", "HH:mm"]);
    return parsed.isValid() ? parsed.format("HH:mm") : "09:00";
};

const EditRoutineModal: React.FC = () => {
    const { modalRef, closeModal, activeModal } = useModal();
    const { id } = useViewPatient();
    const { routine, refreshRoutineData, careCentreId } = activeModal.props as {
        routine: RoutinesTD;
        refreshRoutineData: () => void;
        careCentreId: number;
    };

    const [routineActivities, setRoutineActivities] = useState<Activity[]>([]);

    const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null);

    const [selectedDays, setSelectedDays] = useState<number[]>(() =>
        parseDaysToBits(routine.day_of_week)
    );
    const [daysError, setDaysError] = useState("");

    const handleDayToggle = (bit: number) => {
        setSelectedDays(prev =>
            prev.includes(bit) ? prev.filter(d => d !== bit) : [...prev, bit]
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

    const [startTime, setStartTime] = useState(() => normaliseTime(routine.start_time));
    const [endTime,   setEndTime]   = useState(() => normaliseTime(routine.end_time));

    useEffect(() => {
        if (TIME_SLOTS.length === 0) return;
        const values = TIME_SLOTS.map(s => s.value);
        if (!values.includes(startTime)) setStartTime(values[0]);
        if (!values.includes(endTime))   setEndTime(values[values.length - 1]);
    }, [rangeOpen, rangeClose]);

    const [timeError, setTimeError] = useState("");
    const [startDate, setStartDate] = useState(dayjs(routine.start_date).format("YYYY-MM-DD"));
    const [endDate,   setEndDate]   = useState(dayjs(routine.end_date).format("YYYY-MM-DD"));
    const [dateError, setDateError] = useState("");

    const fetchActivities = async () => {
        const response = await listActivities({ include_deleted: true });
        setRoutineActivities(response);
    };

    const fetchWorkingHours = async () => {
        const response = await getCareCentreById(careCentreId);
        setWorkingHours(response.working_hours ?? null);
    };

    useEffect(() => {
        fetchActivities();
        fetchWorkingHours();
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
            setDateError("Start date must be before end date");
        } else {
            setDateError("");
        }
    }, [startDate, endDate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "start_date") setStartDate(value);
        if (name === "end_date")   setEndDate(value);
    };

    const handleEditRoutine = async (event: React.FormEvent) => {
        event.preventDefault();

        if (startTime >= endTime) return;
        if (startDate >= endDate) return;

        if (selectedDays.length === 0) {
            setDaysError("Please select at least one day.");
            return;
        }

        const dayBitmask = selectedDays.reduce((acc, bit) => acc | bit, 0);

        const editedRoutine: EditRoutine = {
            name: routine.name,
            activity_id: Number(routine.activityId),
            patient_id: Number(id),
            day_of_week: dayBitmask,
            start_time: startTime,
            end_time: endTime,
            start_date: startDate,
            end_date: endDate,
            id: Number(routine.id),
        };

        try {
            await editPatientRoutine(editedRoutine);
            toast.success("Patient Routine edited successfully.");
            refreshRoutineData();
            closeModal();
        } catch (error) {
            toast.error(`Failed to edit Patient Routine. ${error instanceof Error ? error.message : ""}`);
            closeModal();
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
                        value={routineActivities.find(a => a.id === routine.activityId)?.title}
                        name="activity_id"
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        readOnly
                    />
                </div>

                <form onSubmit={handleEditRoutine} className="grid grid-cols-2 gap-4">

                    {/* Day of the Week — multi-select checkboxes with closed-day disabling */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">
                            Day of the Week <span className="text-red-600">*</span>
                        </label>
                        <div className="mt-2 grid grid-cols-2 gap-y-1">
                            {DAYS_OF_WEEK.map((day) => {
                                const hours = workingHours?.[DAY_KEY_MAP[day.bit]];
                                const closed = !workingHours || !hours || !isDayOpen(hours);
                                return (
                                    <label
                                        key={day.bit}
                                        className={`flex items-center gap-2 text-sm cursor-pointer ${
                                            closed ? "text-gray-300 cursor-not-allowed" : "text-gray-700"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedDays.includes(day.bit)}
                                            onChange={() => handleDayToggle(day.bit)}
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
                        {dateError && <p className="text-red-600 text-sm mt-1">{dateError}</p>}
                    </div>

                    <div className="col-span-2 mt-6 flex justify-end space-x-2">
                        <Button variant="outline" onClick={closeModal}>Cancel</Button>
                        <Button type="submit">Update</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRoutineModal;