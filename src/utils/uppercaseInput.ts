import { UseFormRegisterReturn } from "react-hook-form";

export const uppercaseInPlace = (target: HTMLInputElement) => {
  const { selectionStart, selectionEnd } = target;
  target.value = target.value.toUpperCase();
  if (selectionStart !== null) {
    target.setSelectionRange(selectionStart, selectionEnd);
  }
};

export const withUppercase = <T extends UseFormRegisterReturn>(
  registration: T
): T => ({
  ...registration,
  onChange: (event: { target: HTMLInputElement }) => {
    uppercaseInPlace(event.target);
    return registration.onChange(event);
  },
});
