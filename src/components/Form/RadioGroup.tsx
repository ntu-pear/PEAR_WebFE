import { FieldValues, Path, UseFormReturn } from "react-hook-form";

type Props<T extends FieldValues> = {
  label?: string;
  name: Path<T>;
  form: UseFormReturn<T>;
  required?: boolean;
  options: { label: string; value: string }[];
};

export default function RadioGroup<T extends FieldValues>({
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
      <label className="mb-1">
        {label} {label && required && <span className="text-red-600">*</span>}
      </label>
      <div className="flex flex-row gap-4">
        {options.map(({ label, value }) => (
          <label htmlFor={value} className="flex gap-1">
            <input
              {...register(name, { required })}
              type="radio"
              value={value}
              id={value}
            />
            {label}
          </label>
        ))}
      </div>
      {errors[name] && (
        <p role="alert" className="text-red-600 text-sm">
          The {label} field is required.
        </p>
      )}
    </div>
  );
}
