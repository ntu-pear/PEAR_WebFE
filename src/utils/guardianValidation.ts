import * as z from "zod";
import dayjs from "dayjs";
import { validateNRIC } from "@/utils/validateNRIC";

export const RELATIONSHIP_OPTIONS = [
  "Aunt",
  "Child",
  "Friend",
  "Grandchild",
  "Grandparent",
  "Husband",
  "Nephew",
  "Niece",
  "Parent",
  "Sibling",
  "Uncle",
  "Wife",
];

export const guardianSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name must be 100 characters or fewer")
    .refine(
      (v) => /^[a-zA-Z ]+$/.test(v),
      "First name must contain only letters"
    ),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(100, "Last name must be 100 characters or fewer")
    .refine(
      (v) => /^[a-zA-Z ]+$/.test(v),
      "Last name must contain only letters"
    ),
  preferredName: z
    .string()
    .trim()
    .min(1, "Preferred name is required")
    .max(100, "Preferred name must be 100 characters or fewer")
    .refine(
      (v) => /^[a-zA-Z ]+$/.test(v),
      "Preferred name must contain only letters"
    ),
  gender: z.enum(["M", "F"], { message: "Gender is required" }),
  contactNo: z
    .string()
    .trim()
    .min(1, "Contact No. is required")
    .regex(/^[689]\d{7}$/, "Contact must start with 6/8/9 and be 8 digits"),
  nric: z
    .string()
    .trim()
    .min(1, "NRIC is required")
    .regex(/^[STFGM]\d{7}[A-Z]$/, {
      message: "NRIC must be 9 characters (S/T/F/G/M + 7 digits + letter)",
    })
    .refine((nric) => validateNRIC(nric), {
      message: "Invalid NRIC",
    }),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^\S+@\S+\.\S+$/.test(v),
      "Please enter a valid email address"
    ),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (date) => {
        const age = dayjs().diff(dayjs(date), "year");
        return age >= 18 && age <= 120;
      },
      "Guardian must be between 18 and 120 years old"
    ),
  address: z.string().trim().min(1, "Address is required").max(255, "Address must be 255 characters or fewer"),
  tempAddress: z.string().trim().max(255, "Address must be 255 characters or fewer").optional().or(z.literal("")),
  relationshipName: z
    .string()
    .refine(
      (v) => RELATIONSHIP_OPTIONS.includes(v),
      "Relationship is required"
    ),
});

export type GuardianFormInputs = z.infer<typeof guardianSchema>;
