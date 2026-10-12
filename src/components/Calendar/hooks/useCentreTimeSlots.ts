import { useMemo } from "react";
import { useCareCentreHours } from "@/hooks/activities/useCareCentreHours";
import { CENTER_CLOSE_HOUR, CENTER_OPEN_HOUR, TIME_SLOTS } from "../CalendarTypes";

const toOpenHour = (time: string | null, fallback: number) => {
  const hour = Number((time ?? "").split(":")[0]);
  return Number.isFinite(hour) ? hour : fallback;
};

// a 17:30 close still needs the 17:00 slot rendered
const toCloseHour = (time: string | null, fallback: number) => {
  const [hour, minute] = (time ?? "").split(":").map(Number);
  if (!Number.isFinite(hour)) return fallback;
  return minute > 0 ? hour + 1 : hour;
};

const buildSlots = (openHour: number, closeHour: number) =>
  Array.from({ length: Math.max(closeHour - openHour, 1) }, (_, i) => {
    const hour = openHour + i;
    return `${hour.toString().padStart(2, "0")}:00 - ${(hour + 1).toString().padStart(2, "0")}:00`;
  });

// Take the widest range across every open day
export function useCentreTimeSlots() {
  const { centre } = useCareCentreHours();
  const workingHours = centre?.working_hours;

  return useMemo(() => {
    if (!workingHours) {
      return { timeSlots: TIME_SLOTS, openHour: CENTER_OPEN_HOUR, closeHour: CENTER_CLOSE_HOUR };
    }

    const openDays = Object.values(workingHours).filter((day) => day?.open && day?.close);
    if (openDays.length === 0) {
      return { timeSlots: TIME_SLOTS, openHour: CENTER_OPEN_HOUR, closeHour: CENTER_CLOSE_HOUR };
    }

    const openHour = Math.min(...openDays.map((day) => toOpenHour(day.open, CENTER_OPEN_HOUR)));
    const closeHourRaw = Math.max(...openDays.map((day) => toCloseHour(day.close, CENTER_CLOSE_HOUR)));
    const closeHour = Math.max(closeHourRaw, openHour + 1);

    return { timeSlots: buildSlots(openHour, closeHour), openHour, closeHour };
  }, [workingHours]);
}
