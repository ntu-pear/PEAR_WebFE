import { FieldValues, Path, UseFormReturn } from "react-hook-form";

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  form: UseFormReturn<T>;
  maxLength?: number;
  required?: boolean;
};

export default function Textarea<T extends FieldValues>({
  label,
  name,
  form,
  maxLength = 255,
  required = true,
}: Props<T>) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="pb-2 flex flex-col">
      {/* This label appears on top of the textarea component */}
      <label className="mb-1 text-sm font-medium" htmlFor={name}>
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {/* This is the select input registered as a React Hook Form input */}
      <textarea
        {...register(name)}
        id={name}
        className="border border-gray-300 rounded-md p-2 bg-white dark:bg-slate-700"
        maxLength={maxLength}
      />
      {/* This is the error message that appears under the textarea input if validation fails */}
      {errors[name] && (
        <p role="alert" className="text-red-600 text-sm">
          The {label} field is required.
        </p>
      )}
    </div>
  );
}
