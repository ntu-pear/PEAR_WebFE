import { FieldValues, Path, UseFormReturn } from "react-hook-form"

type Props<T extends FieldValues> = {
  label: string
  name: Path<T>
  form: UseFormReturn<T>
  required?: boolean
}

export default function DateInput<T extends FieldValues>({
  label,
  name,
  form,
  required = true
}: Props<T>) {
  const { register, formState: { errors } } = form

  return (
    <div className='pb-2 flex flex-col'>
      <label className='mb-1' htmlFor={name}>
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        id={name}
        type="date"
        className="border border-gray-300 rounded-md p-2"
        {...register(name, { required })}
      />
      {errors.firstName && (
        <p role="alert" className="text-red-600 text-sm">
          The {label} field is required.
        </p>
      )}
    </div>
  )
}
