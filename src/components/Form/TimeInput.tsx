import { TimePicker } from "antd";
import { Controller, FieldValues, Path, UseFormReturn } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";


type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  form: UseFormReturn<T>;
  hourStep?:
    | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22;
  minuteStep?:
    | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
    | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
    | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30
    | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40
    | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50
    | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58;
  minHour?: number; 
  maxHour?: number; 
  required?: boolean;
};

export default function TimeInput<T extends FieldValues>({
  label,
  name,
  form,
  hourStep = 1,
  minuteStep = 5,
  required = true,
}: Props<T>) {
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <div className="pb-2 flex flex-col">
      <label className="mb-1 text-sm font-medium" htmlFor={name}>
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <Controller
        name={name}
        control={control}
        rules={{
          required: required
            ? `Please select a value for ${label}.`
            : undefined,

          validate: (value: string) => {
            if (!value) return true;

            // value is HHmm (e.g. "0900", "1700")
            const hour = parseInt(value.slice(0, 2), 10);
            const minute = parseInt(value.slice(2), 10);

            // 9:00 AM – 5:00 PM rules
            if (hour < 9 || hour > 17) {
              return "Medication time must be between 9:00 AM and 5:00 PM.";
            }

            if (hour === 17 && minute !== 0) {
              return "Only 5:00 PM is allowed as the last administration time.";
            }

            return true;
          },
        }}
        render={({ field }) => {
          const value: Dayjs | null =
            field.value && typeof field.value === "string"
              ? dayjs(field.value, "HHmm")
              : null;

          return (
            <TimePicker
              value={value}
              id={name}
              className="w-full"
              size="large"
              format="h:mm A"
              use12Hours
              hourStep={hourStep}
              minuteStep={minuteStep}
              placeholder={`Select ${label}`}
              needConfirm={false}
              onChange={(time) => {
                if (!time) {
                  field.onChange("");
                  return;
                }

                // Store as HHmm (backend-compatible)
                field.onChange(time.format("HHmm"));
              }}
              getPopupContainer={(trigger) => trigger.parentElement!}
            />
          );
        }}
      />


      {errors[name] && (
        <p role="alert" className="text-red-600 text-sm">
          The {label} field is invalid. Proper timings within opening hours required.
        </p>
      )}
    </div>
  );
}