export type Day =
  | "monday" | "tuesday" | "wednesday"
  | "thursday" | "friday" | "saturday" | "sunday";

export type DayHours = {
  open: string | null;   
  close: string | null;  
};

export type WorkingHours = Record<Day, DayHours>;

export interface CareCentreBase {
  name: string;
  country_code: string;           // ISO 3166-1 alpha-3, e.g. "SGP"
  address: string;
  postal_code: string;
  contact_no: string;
  email: string;
  no_of_devices_avail: number;
  working_hours: WorkingHours;
}

export interface CareCentreResponse extends CareCentreBase {
  id: number;
  is_deleted: boolean;
  created_date: string;
  modified_date?: string | null;
  created_by_id: string;
  modified_by_id?: string | null;
}

export interface CreateCareCentre extends CareCentreBase {}
export interface UpdateCareCentre extends CareCentreBase {
  id: number;
  is_deleted?: boolean;
}