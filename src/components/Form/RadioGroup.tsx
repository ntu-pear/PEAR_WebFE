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
      {/* This label appears on top of the radio group component */}
      <label className="mb-1 text-sm font-medium">
        {label} {label && required && <span className="text-red-600">*</span>}
      </label>
      <div className="flex flex-row gap-4">
        {/* A radio button is created for each option */}
        {options.map(({ label, value }) => (
          <label htmlFor={value} className="flex gap-1">
            {/* Each radio button is registered as a React Hook Form input */}
            <input
              {...register(name, { required })}
              type="radio"
              value={value}
              id={value}
            />
            {/* The label is placed to the right of each radio button */}
            {label}
          </label>
        ))}
      </div>
      {/* This is the error message that appears under the radio group if validation fails */}
      {errors[name] && (
        <p role="alert" className="text-red-600 text-sm">
          The {label} field is required.
        </p>
      )}
    </div>
  );
}
