export type CentreActivityFormValues = { 
    id?: number; 
    activity_id: number;
    is_deleted: boolean;
    is_fixed: boolean;
    is_group: boolean;
    is_compulsory: boolean;
    start_date: string;
    end_date: string;
    min_duration: number;
    max_duration: number;
    min_people_req: number;
};

export type FormErrors = { 
    activity_id?: number;
    is_fixed?: boolean;
    is_group?: boolean;
    is_compulsory?: boolean;
    start_date?: string;
    end_date?: string;
    min_duration?: number;
    max_duration?: number;
    min_people_req?: number;
    _summary?: string[] 
};

export const ERRORS = {
  REQUIRED_ACTIVITY: "An activity must be selected.",
  MAX_DURATION_BELOW_MIN_DURATION: "Maximum duration must be above minimum duration.",
  MIN_DURATION_ABOVE_MAX_DURATION: "Minimum duration must be above maximum duration.",
  START_DATE_AFTER_END_DATE: "Start date must be before End date.",
  END_DATE_BEFORE_START_DATE: "End date must be After Start date.",
  PEOPLE_REQ_TWO_OR_MORE: "Minimum people required must be more than 2.",
} as const;

export function validateLocal(
    values: { 
        activity_id: number; 
        start_date: string; 
        end_date: string; 
        min_duration: number;
        max_duration: number;
        is_group: boolean;
        min_people_req: number;
    }
) {
  const e: FormErrors = { _summary: [] };

  if (values.activity_id == null) {
    e._summary!.push(ERRORS.REQUIRED_ACTIVITY);
  }

  if (new Date(values.start_date.toString()) > new Date(values.end_date.toString())) {
    e._summary!.push(ERRORS.START_DATE_AFTER_END_DATE);
  }

  if (new Date(values.end_date.toString()) < new Date(values.start_date.toString())) {
    e._summary!.push(ERRORS.END_DATE_BEFORE_START_DATE);
  }

  if (values.max_duration < values.min_duration) {
    e._summary!.push(ERRORS.MAX_DURATION_BELOW_MIN_DURATION)
  }

  if (values.min_duration > values.max_duration) {
    e._summary!.push(ERRORS.MIN_DURATION_ABOVE_MAX_DURATION)
  }

  if (values.is_group == true && values.min_people_req < 2) {
    e._summary!.push(ERRORS.PEOPLE_REQ_TWO_OR_MORE)
  }

  return e;
}