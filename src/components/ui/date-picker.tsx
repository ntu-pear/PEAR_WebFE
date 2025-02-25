import React, { useState } from "react";
import { DatePicker } from "antd";
import { Dayjs } from "dayjs";

interface DatePickerFieldProps {
  label: string;
  required?: boolean;
  errorMessage?: string;
  value?: Dayjs | null;
  onChange?: (value: Dayjs | null) => void;
  isError?: boolean;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  required = false,
  errorMessage = "This field is required.",
  value,
  onChange,
  isError = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const handleDateChange = (date: Dayjs | null) => {
    setTouched(true);
    if (required && !date) {
      setError(errorMessage);
    } else {
      setError(null);
    }
    onChange?.(date);
  };

  const handleBlur = () => {
    if (required && !value && touched) {
      setError(errorMessage);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium leading-6 text-primary">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-2">
        <DatePicker
          value={value}
          onChange={handleDateChange}
          onBlur={handleBlur}
          className={`w-full rounded-md border ${
            isError || error ? "border-red-500" : "border-gray-300"
          }`}
        />
        {(isError || error) && (
          <p className="text-red-500 text-sm mt-1">{error || errorMessage}</p>
        )}
      </div>
    </div>
  );
};
export { DatePickerField };
