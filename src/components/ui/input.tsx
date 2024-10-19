import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  required?: boolean;
  requiredMessage?: string;
  errorMessage?: string;
  onValueChange?: (value: string) => void;
  validationRegex?: RegExp;
  validationMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      required = false,
      requiredMessage,
      errorMessage,
      onValueChange,
      validationRegex,
      validationMessage,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState<string>("");
    const [error, setError] = React.useState<string | null>(null);

    const validateInput = (value: string) => {
      if (required && value.trim() === "") {
        return requiredMessage || "This field is required.";
      }
      if (validationRegex && !validationRegex.test(value)) {
        return validationMessage || errorMessage || "Invalid input.";
      }
      return null;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onValueChange?.(newValue);

      if (!required && newValue.trim() === "") {
        setError(null);
        return;
      }

      const validationError = validateInput(newValue);
      setError(validationError);
    };

    const handleBlur = () => {
      if (required) {
        const validationError = validateInput(value);
        setError(validationError);
      }
    };

    return (
      <div className="w-full">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-input focus-visible:ring-ring",
            className
          )}
          ref={ref}
          required={required}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
