import { FieldKeywordMap } from "@/utils/mapBackendErrorToForm";
import { GuardianFormInputs } from "@/utils/guardianValidation";

export const GUARDIAN_FIELD_KEYWORD_MAP: FieldKeywordMap<GuardianFormInputs> = {
  nric: "nric",
  "first name": "firstName",
  "last name": "lastName",
  "preferred name": "preferredName",
  "contact": "contactNo",
  address: "address",
  "date of birth": "dateOfBirth",
  email: "email",
  relationship: "relationshipName",
};
