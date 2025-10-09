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
  required = false,
}: Props<T>) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="pb-2 flex flex-col">
      <label className="mb-1 text-sm font-medium" htmlFor={name}>
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <textarea
        {...register(name, { required })}
        id={name}
        className="border border-gray-300 rounded-md p-2 bg-white dark:bg-slate-700"
        maxLength={maxLength}
      />
      {errors[name] && (
        <p role="alert" className="text-red-600 text-sm">
          The {label} field is required.
        </p>
      )}
    </div>
  );
}
