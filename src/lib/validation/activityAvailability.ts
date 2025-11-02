import { CentreActivityWithTitle} from "@/api/activities/centreActivities";
import dayjs from "dayjs";

export type CentreActivityAvailabilityFormValues = { 
    centre_activity_id: number;
    date: string;
    start_time: string;
    end_time: string;
    is_deleted: boolean | false;
    is_everyday: boolean | false;

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
      date: string; 
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

  const [year, month, day] = values.date.split("-").map(Number);
  let input_date = new Date(Date.UTC(year, month -1, day, 0, 0)).toISOString();

  if (values.centre_activity_id == null) {
    e._summary!.push(ERRORS.REQUIRED_ACTIVITY);
  }

  if (input_date <= dayjs(new Date().toDateString().split('T')[0]).format("YYYY-MM-DD")) {
    e._summary!.push(ERRORS.DATE_IN_THE_PAST);
  }

  if (values.start_time > values.end_time) {
    e._summary!.push(ERRORS.START_TIME_ABOVE_END_TIME);
  }

  if (values.end_time < values.start_time) {
    e._summary!.push(ERRORS.END_TIME_BELOW_START_TIME);
  }

  const timeDifference = dayjs(values.end_time).diff(dayjs(values.start_time), "minute");
  if ( timeDifference > 60 || (timeDifference > 30 && timeDifference < 60)) {
    e._summary!.push("The maximum duration of this activity can only be " + max_duration + " minutes.");
  }
  else if (timeDifference < 30) {
    e._summary!.push("The minimum duration of this activity can only be " + min_duration + " minutes.");
  }
  
  return e;
}