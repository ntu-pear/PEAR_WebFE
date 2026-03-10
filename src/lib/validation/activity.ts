export type ActivityFormValues = { id?: number; title: string; description?: string | null };
export type FormErrors = { title?: string; description?: string; _summary?: string[] };

export const ERRORS = {
  SHORT_TITLE_16: "Use 16 characters or fewer.",
  DUPLICATE_NAME: "Already used by another activity.",
  REQUIRED_TITLE: "Title is required.",
  REQUIRED_DESCRIPTION: "Description is required.",
} as const;

export function validateLocal(values: { title: string; description?: string | null }, opts?: { enforceShortTitle?: boolean }) {
  const e: FormErrors = { _summary: [] };
  const title = values.title?.trim();
  const description = values.description?.trim();

  if (!title) {
    e.title = ERRORS.REQUIRED_TITLE;
    e._summary!.push(ERRORS.REQUIRED_TITLE);
  }

  if (!description) {
    e.description = ERRORS.REQUIRED_DESCRIPTION;
    e._summary!.push(ERRORS.REQUIRED_DESCRIPTION);
  }

  if (opts?.enforceShortTitle && title && title.length > 16) {
    e.title = ERRORS.SHORT_TITLE_16;
    e._summary!.push(ERRORS.SHORT_TITLE_16);
  }

  return e;
}