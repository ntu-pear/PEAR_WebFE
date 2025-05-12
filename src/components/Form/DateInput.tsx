import { FieldValues, Path, UseFormReturn } from "react-hook-form";

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  form: UseFormReturn<T>;
  required?: boolean;
};

export default function DateInput<T extends FieldValues>({
  label,
  name,
  form,
  required = true,
}: Props<T>) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="pb-2 flex flex-col">
      {/* This label appears on top of the date input component */}
      <label className="mb-1" htmlFor={name}>
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {/* This is the date input registered as a React Hook Form input */}
      <input
        id={name}
        type="date"
        className="border border-gray-300 rounded-md p-2 dark:bg-slate-700"
        {...register(name, { required })}
      />
      {/* This is the error message that appears under the input if validation fails */}
      {errors.firstName && (
        <p role="alert" className="text-red-600 text-sm">
          The {label} field is required.
        </p>
      )}
    </div>
  );
}
