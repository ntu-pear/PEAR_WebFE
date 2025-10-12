export type CentreActivityAvailabilityFormValues = { 
    centre_activity_id: number;
    start_time: string;
    end_time: string;
    is_deleted: boolean | false;
};

export type FormErrors = { 
    start_time?: string;
    end_time?: string;
    _summary?: string[] 
};

export const ERRORS = {
  START_DATE_AFTER_END_DATE: "Start date must be before End date.",
  END_DATE_BEFORE_START_DATE: "End date must be After Start date.",
  START_TIME_AFTER_END_TIME: "Start time must be before End time.",
  END_TIME_BEFORE_START_TIME: "End time must be After Start  time.",
} as const;

