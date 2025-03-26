import { FieldValues, Path, UseFormReturn } from "react-hook-form"

type Props<T extends FieldValues> = {
  label: string
  name: Path<T>
  form: UseFormReturn<T>
  required?: boolean
  options: string[]
}

export default function Select<T extends FieldValues>({
  label,
  name,
  form,
  required = true,
  options
}: Props<T>) {
  const { register, formState: { errors } } = form

  return (
    <div className='pb-2 flex flex-col'>
      <label className='mb-1' htmlFor={name}>
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <select
        {...register(name)}
        id={name}
        className="border border-gray-300 rounded-md p-2 bg-white dark:bg-slate-700"
      >
        <option value="">--Select a Role--</option>
        {options.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p role="alert" className="text-red-600 text-sm">
          The {label} field is required.
        </p>
      )}
    </div>
  )
}
