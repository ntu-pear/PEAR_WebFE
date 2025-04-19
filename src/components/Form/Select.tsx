import { FieldValues, Path, UseFormReturn } from "react-hook-form";

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  form: UseFormReturn<T>;
  required?: boolean;
  options: string[];
};

export default function Select<T extends FieldValues>({
  label,
  name,
  form,
  required = true,
  options,
}: Props<T>) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="pb-2 flex flex-col">
      {/* This label appears on top of the select component */}
      <label className="mb-1" htmlFor={name}>
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {/* This is the select input registered as a React Hook Form input */}
      <select
        {...register(name)}
        id={name}
        className="border border-gray-300 rounded-md p-2 bg-white dark:bg-slate-700"
      >
        {/* This is the placeholder when no role is selected */}
        <option value="">--Select a Role--</option>
        {/* These are the options for the select input */}
        {options.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      {/* This is the error message that appears under the select input if validation fails */}
      {errors[name] && (
        <p role="alert" className="text-red-600 text-sm">
          The {label} field is required.
        </p>
      )}
    </div>
  );
}
