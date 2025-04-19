import { InputHTMLAttributes } from "react";
import {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormReturn,
} from "react-hook-form";

interface Props<T extends FieldValues>
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: Path<T>;
  formReturn: UseFormReturn<T>;
  validation?: RegisterOptions<T>;
}

export default function Input<T extends FieldValues>({
  label,
  name,
  formReturn,
  validation,
  ...props
}: Props<T>) {
  const {
    register,
    formState: { errors },
  } = formReturn;

  return (
    <div className="pb-2 flex flex-col">
      {/* This label appears on top of the input component */}
      <label className="mb-1" htmlFor={name}>
        {label}
        {/* This red asterisk appears if the field is required */}
        {(!validation ||
          validation.required == undefined ||
          validation.required) && <span className="text-red-600"> *</span>}
      </label>
      {/* This is the text input registered as a React Hook Form input*/}
      <input
        id={name}
        className="border border-gray-300 rounded-md p-2 dark:bg-slate-700"
        placeholder={label}
        {...register(name, { required: true, ...validation })}
        {...props}
      />
      {/* This is the error message that appears under the input if validation fails*/}
      {errors[name] && (
        <p role="alert" className="text-red-600 text-sm">
          {(errors[name].message as string) || `The ${label} field is required`}
        </p>
      )}
    </div>
  );
}
