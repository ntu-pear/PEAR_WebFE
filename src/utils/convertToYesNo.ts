export const convertToYesNo = (keyValue: string | null | undefined): string => {
  if (keyValue === "1") {
    return "YES";
  } else if (keyValue === "0") {
    return "NO";
  } else {
    return "";
  }
};

export const convertIsAfterMeal = (
  keyValue: string | null | undefined
): string => {
  if (keyValue === "1") {
    return "YES";
  } else if (keyValue === "0") {
    return "NO";
  } else if (keyValue === "2") {
    return `DOESN'T MATTER `;
  } else {
    return "";
  }
};

export const getStatusDescription = (
  status: string | null | undefined
): string => {
  if (typeof status === "string") {
    return status === "0" ? "NON-CHRONIC" : status === "1" ? "CHRONIC" : "";
  } else {
    return "";
  }
};
