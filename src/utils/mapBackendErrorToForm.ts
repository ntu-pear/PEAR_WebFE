import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export type FieldKeywordMap<T extends FieldValues> = Record<string, Path<T>>;

export function mapBackendErrorToField<T extends FieldValues>(
  error: unknown,
  form: UseFormReturn<T>,
  keywordMap: FieldKeywordMap<T>
): boolean {
  const detail = (error as { response?: { data?: { detail?: unknown } } })?.response
    ?.data?.detail;

  if (Array.isArray(detail)) {
    let mapped = false;
    detail.forEach((item: { loc?: unknown[]; msg?: string }) => {
      const locField = String(item.loc?.[item.loc.length - 1] ?? "").toLowerCase();
      const msg = item.msg;
      if (!locField || !msg) return;

      const matchedKeyword = Object.keys(keywordMap).find((k) => locField.includes(k));
      if (matchedKeyword) {
        form.setError(keywordMap[matchedKeyword], { type: "server", message: msg });
        mapped = true;
      }
    });
    return mapped;
  }

  if (typeof detail === "string") {
    const lowerDetail = detail.toLowerCase();
    const matchedKeyword = Object.keys(keywordMap).find((k) => lowerDetail.includes(k));
    if (matchedKeyword) {
      form.setError(keywordMap[matchedKeyword], { type: "server", message: detail });
      return true;
    }
  }

  return false;
}
