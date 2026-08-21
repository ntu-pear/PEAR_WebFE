export const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null) {
    const apiError = error as {
      response?: { data?: { detail?: unknown; message?: string } };
      message?: string;
    };
    const detail = apiError.response?.data?.detail;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    if (Array.isArray(detail)) {
      const validationErrors = detail
        .map((err: { loc?: unknown[]; msg?: string }) =>
          `${err.loc?.join(".") || "Field"}: ${err.msg}`
        )
        .join(", ");
      if (validationErrors) return `Validation error: ${validationErrors}`;
    }

    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
