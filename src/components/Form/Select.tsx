import {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormReturn,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  form: UseFormReturn<T>;
  required?: boolean;
  options: { value: string; name: string }[];
  validation?: RegisterOptions<T>;
};

export default function Select<T extends FieldValues>({
  label,
  name,
  form,
  required = true,
  options,
  validation,
}: Props<T>) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const selectedValue = watch(name) ?? "";

  return (
    <div className="pb-2 flex flex-col">
      <label className="mb-1 text-sm font-medium" htmlFor={name}>
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <select
        id={name}
        className="border border-gray-300 rounded-md p-2 bg-white dark:bg-slate-700"
        {...register(name, { required, ...validation })}
        value={selectedValue}
        onChange={(e) =>
          setValue(name, e.target.value as any, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          })
        }
      >
        <option value="">Please select an option</option>
        {options.map(({ value, name }) => (
          <option key={value} value={value}>
            {name}
          </option>
        ))}
      </select>

      {errors[name] && (
        <p role="alert" className="text-red-600 text-sm">
          {(errors[name]?.message as string) ||
            `The ${label} field is required.`}
        </p>
      )}
    </div>
  );
}