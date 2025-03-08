import { FieldValues, Path, RegisterOptions, UseFormReturn } from "react-hook-form"

type Props<T extends FieldValues> = {
  label: string
  name: Path<T>
  form: UseFormReturn<T>
  validation?: RegisterOptions<T>
}

export default function Input<T extends FieldValues>({
  label,
  name,
  form,
  validation
}: Props<T>) {
  const { register, formState: { errors } } = form

  return (
    <div className='pb-2 flex flex-col'>
      <label className='mb-1' htmlFor={name}>
        {label}
        {
          (!validation ||
            validation.required == undefined ||
            validation.required) &&
          <span className="text-red-600">*</span>
        }
      </label>
      <input
        id={name}
        className="border border-gray-300 rounded-md p-2"
        placeholder={label}
        {...register(name, { required: true, ...validation })}
      />
      {errors[name] && (
        <p role="alert" className="text-red-600 text-sm">
          {errors[name].message as string || `The ${label} field is required`}
        </p>
      )}
    </div>
  )
}
