import { CentreActivityWithTitle} from "@/api/activities/centreActivities";
import dayjs from "dayjs";

export type CentreActivityAvailabilityFormValues = { 
    centre_activity_id: number;
    start_date: string; // YYYY-MM-DD
    end_date: string;   // YYYY-MM-DD
    start_time: string; // HH:mm
    end_time: string;   // HH:mm
    is_deleted: boolean | false;
    is_everyday: boolean | false;
    days_of_week?: number; 
    created_by_id?: string; 
};


export type FormErrors = { 
    start_time?: string;
    end_time?: string;
    _summary?: string[] 
};

export const ERRORS = {
  REQUIRED_ACTIVITY: "An centre activity must be selected.",
  DATE_IN_THE_PAST: "The date cannot be in the past.",
  START_TIME_ABOVE_END_TIME: "Start time must not be after end time.",
  END_TIME_BELOW_START_TIME: "End time must not be earlier than start time.",
  DURATION_INVALID: "Total duration of an activity can only be 30 or 60 minutes.",
  CENTRE_ACTIVITY_ERROR: "Error retrieving centre activity information. Please contact system administrator."
} as const;

export function validateLocal(
    values: { 
      centre_activity_id: number;
      start_date: string;
      end_date: string;
      start_time: string;
      end_time: string;
      selectedCentreActivity: CentreActivityWithTitle;
    }
) {
  const e: FormErrors = { _summary: [] };

  let max_duration = 0;
  let min_duration = 0;
  if (values.selectedCentreActivity != null) { 
    max_duration = values.selectedCentreActivity?.max_duration ?? 0;
    min_duration = values.selectedCentreActivity?.min_duration ?? 0;
  }
  else {
    e._summary!.push(ERRORS.CENTRE_ACTIVITY_ERROR);
  }

  const startDate = dayjs(values.start_date);
  const endDate = dayjs(values.end_date);

  // Validate date range
  if (startDate.isAfter(endDate)) {
    e._summary!.push("Start date cannot be after end date.");
  }

  if (startDate.isBefore(dayjs().startOf("day"))) {
    e._summary!.push(ERRORS.DATE_IN_THE_PAST);
  }

  //Time-only validation for duration
  const [startHours, startMinutes] = values.start_time.split(":").map(Number);
  const [endHours, endMinutes] = values.end_time.split(":").map(Number);

  // Create same-day times for comparison
  const startTime = dayjs().hour(startHours).minute(startMinutes).second(0);
  const endTime = dayjs().hour(endHours).minute(endMinutes).second(0);

  if (startTime.isAfter(endTime)) {
    e._summary!.push(ERRORS.START_TIME_ABOVE_END_TIME);
  }

  const duration = endTime.diff(startTime, "minute");
  const max = values.selectedCentreActivity.max_duration ?? 0;
  const min = values.selectedCentreActivity.min_duration ?? 0;

  if (duration > max) {
    e._summary!.push(
      `The maximum duration allowed is ${max} minutes.`
    );
  }

  if (duration < min) {
    e._summary!.push(
      `The minimum duration allowed is ${min} minutes.`
    );
  }

  return e;

}