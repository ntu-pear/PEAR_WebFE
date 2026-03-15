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
  validation?: RegisterOptions<T>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  min?: string;
  required?: boolean;
};

export default function DateInput<T extends FieldValues>({
  label,
  name,
  form,
  validation,
  required = true,
  ...props
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

      <input
        id={name}
        type="date"
        className="border border-gray-300 rounded-md p-2 dark:bg-slate-700"
        {...register(name, { required, ...validation })}
        {...props}
      />

      {errors[name] && (
        <p role="alert" className="text-red-600 text-sm">
          {(errors[name]?.message as string) ||
            `The ${label} field is required.`}
        </p>
      )}
    </div>
  );
}