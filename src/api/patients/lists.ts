// src/api/lists.ts
import { listTypesAPI } from "@/api/apiConfig";
import { retrieveAccessTokenFromCookie } from "@/api/users/auth";
import { TableRowData } from "@/components/Table/DataTable";
import { mockListTypes } from "@/mocks/mockLists";
import {
  addAllergyReactionType,
  addAllergyType,
  deleteAllergyReactionType,
  deleteAllergyType,
  fetchAllAllergyReactionTypes,
  fetchAllAllergyTypes,
  updateAllergyReactionType,
  updateAllergyType,
} from "./allergy";
import {
  addDementiaType,
  deleteDementiaType,
  fetchDementiaTypeList,
  updateDementiaType,
} from "./diagnosedDementia";
import {
  createDietList,
  createEducationList,
  createLiveWithList,
  createOccupationList,
  createPetList,
  createReligionList,
  deleteDietList,
  deleteEducationList,
  deleteLiveWithList,
  deleteOccupationList,
  deletePetList,
  deleteReligionList,
  fetchDietList,
  fetchEducationList,
  fetchLiveWithList,
  fetchOccupationList,
  fetchPetList,
  fetchReligionList,
  updateDietList,
  updateEducationList,
  updateLiveWithList,
  updateOccupationList,
  updatePetList,
  updateReligionList,
  fetchPrescriptionList,
  createPrescriptionList,
  updatePrescriptionList,
  deletePrescriptionList,
} from "./socialHistory";
import {
  addHighlightType,
  deleteHighlightType,
  fetchHighlightTypes,
  updateHighlightType,
} from "./highlight";
import {
  addLanguageListType,
  deleteLanguageListType,
  fetchPreferredLanguageList,
  updateLanguageListType,
} from "./preferredLanguage";
import { fetchMobilityList } from "./mobility";
import{
  fetchMedicalDiagnosisList,
  createMedicalDiagnosisList,
  updateMedicalDiagnosisList,
  deleteMedicalDiagnosisList
} from "./medicalDiagnosis";
import{
  fetchProblemList,
  createProblemList,
  updateProblemList,
  deleteProblemList
} from "./problem";

interface ListType {
  active: string;
  type: string;
  value: string;
  listOrder: number;
  id: number;
  createdDate: string;
  modifiedDate: string;
  CreatedById: string;
  ModifiedById: string;
}

export interface ListItem extends TableRowData {
  value: string;
  isDeleted: string;
  createdDate: string;
  modifiedDate: string;
}

// TBD: Replace with real API
export const fetchListItems = async (type: string): Promise<ListItem[]> => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  switch (type) {
    case "Allergy":
      const allergyTypes = await fetchAllAllergyTypes();
      return allergyTypes.data.map(
        ({
          AllergyTypeID,
          Value,
          IsDeleted,
          CreatedDateTime,
          UpdatedDateTime,
        }) => ({
          id: AllergyTypeID,
          value: Value,
          isDeleted: IsDeleted,
          createdDate: CreatedDateTime,
          modifiedDate: UpdatedDateTime,
        })
      );
    case "AllergyReaction":
      const allergyReactionTypes = await fetchAllAllergyReactionTypes();
      return allergyReactionTypes.data.map(
        ({
          AllergyReactionTypeID,
          Value,
          IsDeleted,
          CreatedDateTime,
          UpdatedDateTime,
        }) => ({
          id: AllergyReactionTypeID,
          value: Value,
          isDeleted: IsDeleted,
          createdDate: CreatedDateTime,
          modifiedDate: UpdatedDateTime,
        })
      );
    case "Dementia":
      const dementiaTypes = await fetchDementiaTypeList();
      return dementiaTypes.map(
        ({
          DementiaTypeListId,
          Value,
          IsDeleted,
          CreatedDate,
          ModifiedDate,
        }) => ({
          id: DementiaTypeListId,
          value: Value,
          isDeleted: IsDeleted,
          createdDate: CreatedDate,
          modifiedDate: ModifiedDate,
        })
      );
    case "Diet":
      const dietTypes = await fetchDietList();
      return dietTypes.map(
        ({ Id, Value, IsDeleted, CreatedDateTime, UpdatedDateTime }) => ({
          id: Id,
          value: Value,
          isDeleted: IsDeleted,
          createdDate: CreatedDateTime,
          modifiedDate: UpdatedDateTime,
        })
      );
    case "Education":
      const educationTypes = await fetchEducationList();
      return educationTypes.map(
        ({ Id, Value, IsDeleted, CreatedDateTime, UpdatedDateTime }) => ({
          id: Id,
          value: Value,
          isDeleted: IsDeleted,
          createdDate: CreatedDateTime,
          modifiedDate: UpdatedDateTime,
        })
      );
    case "Highlight":
      const highlightTypes = await fetchHighlightTypes();
      return highlightTypes.map(({ id, value }) => ({
        id,
        value,
        isDeleted: "0",
        createdDate: "",
        modifiedDate: "",
      }));
    case "LiveWith":
      const liveWithTypes = await fetchLiveWithList();
      return liveWithTypes.map(
        ({ Id, Value, IsDeleted, CreatedDateTime, UpdatedDateTime }) => ({
          id: Id,
          value: Value,
          isDeleted: IsDeleted,
          createdDate: CreatedDateTime,
          modifiedDate: UpdatedDateTime,
        })
      );
    case "Occupation":
      const occupationTypes = await fetchOccupationList();
      return occupationTypes.map(
        ({ Id, Value, IsDeleted, CreatedDateTime, UpdatedDateTime }) => ({
          id: Id,
          value: Value,
          isDeleted: IsDeleted,
          createdDate: CreatedDateTime,
          modifiedDate: UpdatedDateTime,
        })
      );
    case "Pet":
      const petTypes = await fetchPetList();
      return petTypes.map(
        ({ Id, Value, IsDeleted, CreatedDateTime, UpdatedDateTime }) => ({
          id: Id,
          value: Value,
          isDeleted: IsDeleted,
          createdDate: CreatedDateTime,
          modifiedDate: UpdatedDateTime,
        })
      );
    case "Religion":
      const religionTypes = await fetchReligionList();
      return religionTypes.map(
        ({ Id, Value, IsDeleted, CreatedDateTime, UpdatedDateTime }) => ({
          id: Id,
          value: Value,
          isDeleted: IsDeleted,
          createdDate: CreatedDateTime,
          modifiedDate: UpdatedDateTime,
        })
      );
    case "Language":
      const languageTypes = await fetchPreferredLanguageList();
      return languageTypes.map(
        ({ id, value, isDeleted, createdDate, modifiedDate }) => ({
          id,
          value,
          isDeleted,
          createdDate,
          modifiedDate,
        })
      );
    case "Mobility":
      const mobilityTypes = await fetchMobilityList();
      return mobilityTypes.map(
        ({
          MobilityListId,
          Value,
          IsDeleted,
          CreatedDateTime,
          ModifiedDateTime,
        }) => ({
          id: String(MobilityListId),
          value: Value,
          isDeleted: IsDeleted ? "1" : "0",
          createdDate: CreatedDateTime,
          modifiedDate: ModifiedDateTime,
        })
      );
     case "Prescription":
      const prescriptionTypes = await fetchPrescriptionList();
      return (prescriptionTypes || []).map(
        ({ Id, Value, IsDeleted, CreatedDateTime, UpdatedDateTime }) => ({
          id: Id,
          value: Value,
          isDeleted: IsDeleted ? "1" : "0",
          createdDate: CreatedDateTime,
          modifiedDate: UpdatedDateTime,
        })
      );
      case "Medical Diagnosis":
      const medicalDiagnosisTypes = await fetchMedicalDiagnosisList();
      console.log(medicalDiagnosisTypes)
      return (medicalDiagnosisTypes || []).map(
        ({ Id, DiagnosisName, IsDeleted, CreatedDate, ModifiedDate}) => ({
          id: Id,
          value: DiagnosisName,
          isDeleted: IsDeleted == '1' ? "1" : "0",
          createdDate: CreatedDate,
          modifiedDate: ModifiedDate,
        })
      );
      case "Problem":
      const problemTypes = await fetchProblemList();
      return (problemTypes || []).map(
        ({ Id, ProblemName, IsDeleted, CreatedDate, ModifiedDate}) => ({
          id: Id,
          value: ProblemName,
          isDeleted: IsDeleted == '1' ? "1" : "0",
          createdDate: CreatedDate,
          modifiedDate: ModifiedDate,
        })
      );

    default:
      return [];
  }
};

// TBD: Replace with real API
export async function fetchListTypes(): Promise<string[]> {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  const res = await listTypesAPI.get<ListType[]>("", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("GET all List Types", res.data);

  return mockListTypes;
}

// TBD: Replace with real API
export const addListItem = async ({
  type,
  value,
}: {
  type: string;
  value: string;
}) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  switch (type) {
    case "Allergy":
      await addAllergyType(value);
      return;
    case "AllergyReaction":
      await addAllergyReactionType(value);
      return;
    case "Dementia":
      await addDementiaType(value);
      return;
    case "Diet":
      await createDietList(value);
      return;
    case "Education":
      await createEducationList(value);
      return;
    case "Highlight":
      await addHighlightType(value);
      return;
    case "LiveWith":
      await createLiveWithList(value);
      return;
    case "Occupation":
      await createOccupationList(value);
      return;
    case "Pet":
      await createPetList(value);
      return;
    case "Religion":
      await createReligionList(value);
      return;
    case "Language":
      await addLanguageListType(value);
      return;
    case "Mobility":
      return;
    case "Prescription":
      await createPrescriptionList(value)
      return;
    case "Medical Diagnosis":
      await createMedicalDiagnosisList(value)
      return;
    case "Problem":
      await createProblemList(value)
      return;
    default:
      return;
  }
};

// TBD: Replace with real API
export const updateListItem = async ({
  type,
  id,
  value,
}: {
  type: string;
  id: string;
  value: string;
}) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  switch (type) {
    case "Allergy":
      await updateAllergyType(id, value);
      return;
    case "AllergyReaction":
      await updateAllergyReactionType(id, value);
      return;
    case "Dementia":
      await updateDementiaType(Number(id), value);
      return;
    case "Diet":
      await updateDietList(Number(id), value);
      return;
    case "Education":
      await updateEducationList(Number(id), value);
      return;
    case "Highlight":
      await updateHighlightType(Number(id), value);
      return;
    case "LiveWith":
      await updateLiveWithList(Number(id), value);
      return;
    case "Occupation":
      await updateOccupationList(Number(id), value);
      return;
    case "Pet":
      await updatePetList(Number(id), value);
      return;
    case "Religion":
      await updateReligionList(Number(id), value);
      return;
    case "Language":
      await updateLanguageListType(Number(id), value);
      return;
    case "Mobility":
      return;
    case "Prescription":
      await updatePrescriptionList(Number(id), value);
      return;
    case "Medical Diagnosis":
      await updateMedicalDiagnosisList(Number(id), value);
      return;
    case "Problem":
      await updateProblemList(Number(id), value);
      return;
    default:
      return;
  }
};

// TBD: Replace with real API
export const deleteListItem = async ({
  type,
  id,
}: {
  type: string;
  id: string;
}) => {
  const token = retrieveAccessTokenFromCookie();
  if (!token) throw new Error("No token found.");

  switch (type) {
    case "Allergy":
      await deleteAllergyType(id);
      return;
    case "AllergyReaction":
      await deleteAllergyReactionType(id);
      return;
    case "Dementia":
      await deleteDementiaType(Number(id));
      return;
    case "Diet":
      await deleteDietList(Number(id));
      return;
    case "Education":
      await deleteEducationList(Number(id));
      return;
    case "Highlight":
      await deleteHighlightType(Number(id));
      return;
    case "LiveWith":
      await deleteLiveWithList(Number(id));
      return;
    case "Occupation":
      await deleteOccupationList(Number(id));
      return;
    case "Pet":
      await deletePetList(Number(id));
      return;
    case "Religion":
      await deleteReligionList(Number(id));
      return;
    case "Language":
      await deleteLanguageListType(Number(id));
      return;
    case "Mobility":
      return;
    case "Prescription":
      await deletePrescriptionList(Number(id));
      return;
    case "Medical Diagnosis":
      await deleteMedicalDiagnosisList(Number(id));
      return;
    case "Problem":
      await deleteProblemList(Number(id));
      return;            
    default:
      return;
  }
};
