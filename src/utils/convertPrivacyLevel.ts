export const convertPrivacyLevel = (
  keyValue: string | number | null | undefined
): string => {
  if (keyValue === "1" || keyValue === 1) {
    return "LOW";
  } else if (keyValue === "2" || keyValue === 2) {
    return "MEDIUM";
  } else if (keyValue === "3" || keyValue === 3) {
    return "HIGH";
  } else {
    return "";
  }
};
