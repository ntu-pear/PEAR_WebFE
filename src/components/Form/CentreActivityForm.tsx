import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Activity} from "@/api/activities/activities";
import dayjs from "dayjs";
import { toast } from "sonner";
import { getAllActivities } from "@/api/activity/activityPreference";
import { type FormErrors, type CentreActivityFormValues, validateLocal } from "@/lib/validation/centreActivity";

type Props = {
  initial?: CentreActivityFormValues & {id?: number};
  submitting?: boolean;
  onSubmit: (
    values: CentreActivityFormValues,
    setErrors: (e: FormErrors) => void
  ) => void | Promise<void>;
  onCancel?: () => void;
};

export interface RadioBtnOption {
  label: string;
  value: boolean;
}

export interface durationRadioBtn {
  label: string;
  value: number;
}

export default function CentreActivityForm({ 
  initial, 
  submitting,
  onSubmit,
  onCancel
}: Props) {
  const [activity_id, setActivityID] = useState<string>(initial?.activity_id?.toString() ?? "");
  const [is_fixed, setIs_Fixed] = useState(initial?.is_fixed ?? false);
  const [is_compulsory, setIs_Compulsory] = useState(initial?.is_compulsory ?? false);
  const [start_date, setStart_date] = useState(initial?.start_date ?? "");
  const [end_date, setEnd_date] = useState(initial?.end_date ?? "");
  const [min_duration, setMin_duration] = useState<number>(initial?.min_duration ?? 60);
  const [max_duration, setMax_duration] = useState<number>(initial?.max_duration ?? 60);
  const [is_group, setIs_Group] = useState(initial?.is_group ?? false);
  const [min_people_req, setMin_people_req] = useState(initial?.min_people_req ?? 1);
  const [fixed_time_slots, setFixed_time_slots] = useState(initial?.fixed_time_slots ?? "");
  const [is_deleted, setIsDeleted] = useState(initial?.is_deleted ?? false);
  const [deleted] = useState(initial?.is_deleted ?? false);

  const indefiniteDate = dayjs(new Date(2999, 0, 1).toDateString()).format("YYYY-MM-DD");
  const [errors, setErrors] = useState<FormErrors>({ _summary: [] });
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const[activitiesData] = await Promise.all([
          getAllActivities()
        ]);
        setActivities(activitiesData);
      }
      catch(error) {
          console.error("Error fetching form data:", error);
          toast.error("Failed to load form data");
      }
    };
  
    fetchData();
  }, []);

  const runSync = (v: CentreActivityFormValues) => {
    const e = validateLocal(v);
    setErrors(e);
    return e;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ _summary: [] });

    try {
      const formValues = { 
        activity_id: parseInt(activity_id),
        is_fixed: is_fixed,
        is_compulsory: is_compulsory,
        is_group: is_group,
        start_date: start_date,
        end_date: end_date,
        min_duration: min_duration,
        max_duration: max_duration,
        min_people_req: min_people_req,
        fixed_time_slots: fixed_time_slots,
        is_deleted: is_deleted
      };

      const local = runSync(formValues);
      if (local._summary && local._summary.length) return;

      await onSubmit(formValues, setErrors);
    }
    catch(error: any) {
      console.error("Form submission error:", error);
    }
  };
  
  const radioBtnOptions : RadioBtnOption[] = [
    { value: true, label: "Yes"},
    { value: false, label: "No"}
  ];

  const durationRadioBtn : durationRadioBtn[] = [
    { value: 30, label: "30 mins"},
    { value: 60, label: "60 mins"}
  ];

  return (
    <form 
      className="mt-4 space-y-4"
      onSubmit={handleSubmit}
    >
      {errors?._summary && errors._summary.length > 0 && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            {errors._summary.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}

      {deleted && (
        <div className="space-y-2">
          <Label htmlFor="is_deleted">Undo deletion of this centre activity?</Label>
          <div className="space-x-2">
            <Label className="space-x-1">
              <input
                type="checkbox"
                id = "is_deleted"
                onChange={(e) =>{
                  if (e.target.checked) {
                    setIsDeleted(false);
                  }
                  else {
                    setIsDeleted(true);
                  }
                }}
              />
              <label>Yes</label>
            </Label>
          </div>
        </div>
      )}

      {/* Activity Selection */}
      <div className="space-y-2">
        <Label htmlFor="activity_id">Activity</Label>
        <select
          id="activity_id"
          value={activity_id}
          disabled={is_deleted ? true : false}      
          onChange={(e) => {
            setActivityID(e.target.value)
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
        >
          <option value="" disabled>Select an activity</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id.toString()}>
              {a.title}
            </option>
          ))}
        </select>
        {errors.activity_id && <p className="text-sm text-red-600">{errors.activity_id}</p>}
      </div>
      
      <div className="space-y-2 space-x-2">
        <Label htmlFor="is_compulsory">Is this activity compulsory for patients?</Label>
        <div className="space-x-2">
          {radioBtnOptions.map((choice) => (
            <Label className="space-x-1">
              <input
                type="radio"
                id = {choice.value.toString()}
                name="is_compulsory"
                value={choice.value.toString()}
                disabled={is_deleted ? true : false}
                checked={is_compulsory === choice.value ? true : false}
                onChange={(e) =>{
                  setIs_Compulsory(choice.value);

                  /*Business rule, Compulsory activities must be fixed */
                  if (e.target.value) {
                    setIs_Fixed(true);
                  }
                }}
              />
              <label>{choice.label}</label>
            </Label>
          ))}
        </div>
        {errors.is_compulsory && <p className="text-sm text-red-600">{errors.is_compulsory}</p>}
      </div>

      <div className="space-y-2 space-x-2">
        <Label htmlFor="is_fixed">Is this activity fixed to a timeslot?</Label>
        <div className="space-x-2">
          {radioBtnOptions.map((choice) => (
            <Label className="space-x-1">
              <input
                type="radio"
                id = {choice.value.toString()}
                name="is_fixed"
                value={choice.value.toString()}
                disabled={is_deleted ? true : false}
                checked={is_fixed === choice.value ? true : false}
                onChange={() =>{
                  setIs_Fixed(choice.value);

                  if (!choice.value && fixed_time_slots.length > 0) {
                    setFixed_time_slots("");
                  }
                }}
              />
              <label>{choice.label}</label>
            </Label>
          ))}
        </div>
        
        {errors.is_fixed && <p className="text-sm text-red-600">{errors.is_fixed}</p>}
      </div>
      
      {is_fixed && (
        <div className="space-y-2">
          <Label htmlFor="fixed_time_slots">Please provide the fixed time slots</Label>
          <Input
            id="fixed_time_slots"
            value={fixed_time_slots}
            disabled={is_deleted ? true : false}
            onChange={(e) => setFixed_time_slots(e.target.value)}
          />
          {errors.fixed_time_slots && <p className="text-sm text-red-600">{errors.fixed_time_slots}</p>}
        </div>
      )}

      {/* Indefinite Checkbox */}
      <div className="space-y-2 space-x-2">
        <Label htmlFor="is_indefinite">Is this activity end date indefinite?</Label>
        <div className="space-x-2">
          {radioBtnOptions.map((choice) => (
            <Label className="space-x-1">
              <input
                type="radio"
                id = {choice.value.toString()}
                name="is_indefinite"
                value={choice.value.toString()}
                disabled={is_deleted ? true : false}
                checked={end_date.includes("999") ? true === choice.value : false === choice.value}
                // checked={end_date === "" ? is_indefinite === choice.value : end_date.includes("999") ? is_indefinite === choice.value : false}
                onChange={() =>{
                  if (choice.value) {
                    setEnd_date(indefiniteDate);
                  }
                  else {
                    setEnd_date("");
                  }
                }}
              />
              <label>{choice.label}</label>
            </Label>
          ))}
        </div>
      </div>

      <div className="space-y-2 space-x-2">
        <Label htmlFor="is_group">Is this a group activity?</Label>
        <div className="space-x-2">
          {radioBtnOptions.map((choice) => (
            <Label className="space-x-1">
              <input
                type="radio"
                id = {choice.value.toString()}
                name="is_group"
                value={choice.value.toString()}
                disabled={is_deleted ? true : false}
                checked={is_group === choice.value ? true : false}
                onChange={() =>{
                  setIs_Group(choice.value);

                  /*Business rule, Individual activities requires at least 1 person. */
                  if (!choice.value) {
                    setMin_people_req(1);
                  } 
                }}
              />
              <label>{choice.label}</label>
            </Label>
          ))}
        </div>
        {errors.is_group && <p className="text-sm text-red-600">{errors.is_group}</p>}
      </div>

      {/* Minmum people required (Display only if group is checked) */}
      {is_group && (
        <div className="space-y-2">
          <Label htmlFor="min_people_req">Minimum people required (Atleast 2 pax)</Label>
            <Input
              id="min_people_req"
              value={min_people_req}
              disabled={is_deleted ? true : false}
              onChange={(e) => setMin_people_req(parseInt(e.target.value))}
            />
          {errors.min_people_req && <p className="text-sm text-red-600">{errors.min_people_req}</p>}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="min_duration">Minimum Duration </Label>
        <div className="space-x-2">
          {durationRadioBtn.map((choice) => (
            <Label className="space-x-1">
              <input
                type="radio"
                id = {choice.value.toString()}
                name="min_duration"
                value={choice.value.toString()}
                disabled={is_deleted ? true : false}
                checked={min_duration === choice.value ? true : false}
                onChange={() =>{
                  setMin_duration(choice.value)
                }}
              />
              <label>{choice.label}</label>
            </Label>
          ))}
        </div>
        {errors.min_duration && <p className="text-sm text-red-600">{errors.min_duration}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="max_duration">Maximum Duration </Label>
        <div className="space-x-2">
          {durationRadioBtn.map((choice) => (
            <Label className="space-x-1">
              <input
                type="radio"
                id = {choice.value.toString()}
                name="max_duration"
                value={choice.value.toString()}
                disabled={is_deleted ? true : false}
                checked={max_duration === choice.value ? true : false}
                onChange={() =>{
                  setMax_duration(choice.value)
                }}
              />
              <label>{choice.label}</label>
            </Label>
          ))}
        </div>
        {errors.max_duration && <p className="text-sm text-red-600">{errors.max_duration}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="start_date">Start date of this activity</Label>
        <Input
          id="start_date"
          type="date"
          value={start_date}
          disabled={is_deleted ? true : false}
          onChange={(e) => setStart_date(e.target.value)}
        />
        {errors.start_date && <p className="text-sm text-red-600">{errors.start_date}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="end_date">End date of this activity</Label>
          <Input
            id="end_date"
            type="date"
            value={end_date}
            disabled={is_deleted ? true : indefiniteDate === end_date ? true : false}
            // disabled = {indefiniteDate === end_date ? true : false}
            onChange={(e) => setEnd_date(e.target.value)}
          />
        {errors.end_date && <p className="text-sm text-red-600">{errors.end_date}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting} className="min-w-24">
          {submitting ? "Saving…" : initial?.id ? "Update" : "Create"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}