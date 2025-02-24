import { SocialHistoryTD } from "@/mocks/mockPatientDetails";
import { socialHistoryAPI } from "../apiConfig";
import { convertToYesNo } from "@/utils/convertToYesNo";

export interface SocialHistory {
  active: string;
  patientId: number;
  sexuallyActive: string;
  secondHandSmoker: string;
  alcoholUse: string;
  caffeineUse: string;
  tobaccoUse: string;
  drugUse: string;
  exercise: string;
  id: number;
  createdDate: string;
  modifiedDate: string;
  CreatedById: string;
  ModifiedById: string;
}

export const convertToSocialHistoryTD = (
  socialHistory: SocialHistory
): SocialHistoryTD => {
  return {
    id: socialHistory.id,
    alcoholUse: convertToYesNo(socialHistory.alcoholUse),
    caffeineUse: convertToYesNo(socialHistory.caffeineUse),
    diet: "",
    drugUse: convertToYesNo(socialHistory.drugUse),
    education: "",
    exercise: convertToYesNo(socialHistory.exercise),
    liveWith: "",
    occupation: "",
    pet: "",
    religion: "",
    secondhandSmoker: convertToYesNo(socialHistory.secondHandSmoker),
    sexuallyActive: convertToYesNo(socialHistory.sexuallyActive),
    tobaccoUse: convertToYesNo(socialHistory.tobaccoUse),
  };
};

export const fetchSocialHistory = async (
  patientId: number
): Promise<SocialHistoryTD> => {
  try {
    const response = await socialHistoryAPI.get<SocialHistory>(
      `?patient_id=${patientId}`
    );
    console.log("GET Patient Social History", response.data);
    return convertToSocialHistoryTD(response.data);
  } catch (error) {
    console.error("GET Patient Social History", error);
    throw error;
  }
};
