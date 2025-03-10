import { InputHTMLAttributes } from "react"
import { FieldValues, Path, RegisterOptions, UseFormReturn } from "react-hook-form"

interface Props<T extends FieldValues> extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: Path<T>
  formReturn: UseFormReturn<T>
  validation?: RegisterOptions<T>
}

export default function Input<T extends FieldValues>({
  label,
  name,
  formReturn,
  validation,
  ...props
}: Props<T>) {
  const { register, formState: { errors } } = formReturn

  return (
    <div className='pb-2 flex flex-col'>
      <label className='mb-1' htmlFor={name}>
        {label}
        {
          (!validation ||
            validation.required == undefined ||
            validation.required) &&
          <span className="text-red-600"> *</span>
        }
      </label>
      <input
        id={name}
        className="border border-gray-300 rounded-md p-2"
        placeholder={label}
        {...register(name, { required: true, ...validation })}
        {...props}
      />
      {errors[name] && (
        <p role="alert" className="text-red-600 text-sm">
          {errors[name].message as string || `The ${label} field is required`}
        </p>
      )}
    </div>
  )
}
