import { TimePicker } from "antd";
import { Controller, FieldValues, Path, UseFormReturn } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";

const format = "HH:mm";

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
  minHour,
  maxHour,
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
        }}
        render={({ field }) => {
          const value: Dayjs | null =
            field.value && dayjs(field.value).isValid()
              ? dayjs(field.value)
              : null;

          return (
            <TimePicker
              value={value}
              onChange={(time) => field.onChange(time)}
              id={name}
              className="w-full"
              size="large"
              format={format}
              hourStep={hourStep}
              minuteStep={minuteStep}
              placeholder={`Select ${label}`}
              needConfirm={false}

              disabledHours={() => {
                if (minHour === undefined || maxHour === undefined) return [];

                const disabled: number[] = [];
                for (let i = 0; i < 24; i++) {
                  if (i < minHour || i > maxHour) {
                    disabled.push(i);
                  }
                }
                return disabled;
              }}

              getPopupContainer={(trigger) => trigger.parentElement!}
            />
          );
        }}
      />

      {errors[name] && (
        <p role="alert" className="text-red-600 text-sm">
          The {label} field is required.
        </p>
      )}
    </div>
  );
}